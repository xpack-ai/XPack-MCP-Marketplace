import aiohttp
import asyncio
from urllib.parse import urlparse
from typing import Optional, Dict, Any
from services.common.exceptions import (
    ValidationException, 
    InternalServerException,
    ServiceUnavailableException
)
from services.common.logging_config import get_logger

logger = get_logger(__name__)


class HttpUtils:
    """HTTP utility class providing common HTTP request functionality"""

    @staticmethod
    async def download_content_from_url(
        url: str,
        timeout: int = 30,
        max_file_size: int = 10 * 1024 * 1024,  # 10MB
        allowed_content_types: Optional[list] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Download content from URL

        Args:
            url: The URL to download from
            timeout: Request timeout in seconds
            max_file_size: Maximum file size in bytes
            allowed_content_types: List of allowed content types
            headers: Additional request headers

        Returns:
            str: Downloaded content

        Raises:
            ValidationException: When URL is invalid or parameters are wrong
            ServiceUnavailableException: When network issues occur
            InternalServerException: When unexpected errors occur
        """
        if allowed_content_types is None:
            allowed_content_types = [
                "application/json",
                "text/plain",
                "application/yaml",
                "text/yaml",
                "application/x-yaml",
                "text/x-yaml"
            ]

        try:
            logger.info(f"Starting to download content from URL: {url}")

            # Set request headers
            request_headers = {
                "User-Agent": "XPack-OpenAPI-Downloader/1.0"
            }
            if headers:
                request_headers.update(headers)

            # Basic SSRF protections: only allow http/https and block localhost/private IPs
            parsed = urlparse(url)
            if parsed.scheme not in ("http", "https"):
                raise ValidationException("URL scheme must be http or https")
            host = (parsed.hostname or "").lower()
            private_prefixes = ("127.", "10.", "192.168.")
            if host in ("localhost", "127.0.0.1") or host.startswith(private_prefixes) or host.startswith("172."):
                raise ValidationException("Access to local/private addresses is not allowed")

            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=timeout),
                headers=request_headers
            ) as session:
                async with session.get(url) as response:
                    # Check response status
                    if response.status != 200:
                        raise ServiceUnavailableException(
                            f"Unable to download content, HTTP status code: {response.status}"
                        )

                    # Check content type
                    content_type = response.headers.get('content-type', '').lower()
                    if not any(ct in content_type for ct in allowed_content_types):
                        logger.warning(f"Content type might be incorrect: {content_type}")

                    # Check file size
                    content_length = response.headers.get('content-length')
                    if content_length and int(content_length) > max_file_size:
                        raise ValidationException(
                            f"File too large, maximum allowed: {max_file_size} bytes"
                        )

                    # Read content
                    content = await response.text()

                    # Check actual content size
                    if len(content.encode('utf-8')) > max_file_size:
                        raise ValidationException(
                            f"File too large, maximum allowed: {max_file_size} bytes"
                        )

                    logger.info(f"Successfully downloaded content, size: {len(content)} characters")
                    return content

        except aiohttp.ClientError as e:
            logger.error(f"Network request failed: {e}")
            raise ServiceUnavailableException(f"Network request failed: {str(e)}")
        except asyncio.TimeoutError:
            logger.error(f"Request timeout: {url}")
            raise ServiceUnavailableException("Request timeout")
        except (ValidationException, ServiceUnavailableException):
            raise
        except Exception as e:
            logger.error(f"Error occurred while downloading content: {e}")
            raise InternalServerException(f"Download failed: {str(e)}")

    @staticmethod
    async def validate_url_accessibility(url: str, timeout: int = 10) -> bool:
        """Validate if URL is accessible"""
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=timeout)
            ) as session:
                async with session.head(url) as response:
                    return response.status == 200
        except Exception as e:
            return False

    @staticmethod
    async def get_url_info(url: str, timeout: int = 10) -> Dict[str, Any]:
        """Get basic URL information"""
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=timeout)
            ) as session:
                async with session.head(url) as response:
                    return {
                        "status": response.status,
                        "content_type": response.headers.get('content-type', ''),
                        "content_length": response.headers.get('content-length'),
                        "last_modified": response.headers.get('last-modified'),
                        "server": response.headers.get('server', ''),
                        "accessible": response.status == 200
                    }
        except Exception as e:
            return {
                "status": None,
                "content_type": "",
                "content_length": None,
                "last_modified": None,
                "server": "",
                "accessible": False,
                "error": str(e)
            }

    @staticmethod
    async def post_json(
        url: str,
        data: Dict[str, Any],
        timeout: int = 30,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Send JSON POST request

        Args:
            url: Request URL
            data: Data to send
            timeout: Timeout in seconds
            headers: Additional request headers

        Returns:
            Dict[str, Any]: Response data

        Raises:
            ValidationException: When parameters are invalid
            ServiceUnavailableException: When network issues occur
            InternalServerException: When unexpected errors occur
        """
        try:
            request_headers = {
                "Content-Type": "application/json",
                "User-Agent": "XPack-HTTP-Client/1.0"
            }
            if headers:
                request_headers.update(headers)

            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=timeout),
                headers=request_headers
            ) as session:
                async with session.post(url, json=data) as response:
                    if response.status >= 400:
                        raise ServiceUnavailableException(
                            f"HTTP request failed with status code: {response.status}"
                        )

                    return await response.json()

        except aiohttp.ClientError as e:
            logger.error(f"POST request failed: {e}")
            raise ServiceUnavailableException(f"Request failed: {str(e)}")
        except asyncio.TimeoutError:
            logger.error(f"POST request timeout: {url}")
            raise ServiceUnavailableException("Request timeout")
        except (ValidationException, ServiceUnavailableException):
            raise
        except Exception as e:
            logger.error(f"Error occurred during POST request: {e}")
            raise InternalServerException(f"Request failed: {str(e)}")
