import json
import logging
import yaml
from fastapi import UploadFile, HTTPException
from .openapi_helper import OpenApiForAI, convert_openapi_for_ai
from services.common.utils.http_utils import HttpUtils

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OpenApiManager:
    """MCP manager for handling OpenAPI document download and parsing"""

    def __init__(self, timeout: int = 30, max_file_size: int = 10 * 1024 * 1024):  # 10MB
        self.timeout = timeout
        self.max_file_size = max_file_size

    async def download_openapi_from_url(self, url: str) -> OpenApiForAI:
        """Download OpenAPI document from URL and parse to OpenApiForAI object"""
        try:
            logger.info(f"Starting to download OpenAPI document from URL: {url}")

            # Use HttpUtils to download content
            content = await HttpUtils.download_content_from_url(
                url=url,
                timeout=self.timeout,
                max_file_size=self.max_file_size,
                allowed_content_types=[
                    "application/json",
                    "text/plain",
                    "application/yaml",
                    "text/yaml",
                    "application/x-yaml",
                    "text/x-yaml",
                ],
            )

            logger.info(f"Successfully downloaded document, size: {len(content)} characters")

            return self._parse_openapi_content(content, f"URL: {url}")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error occurred while downloading OpenAPI document: {e}")
            raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

    async def parse_openapi_from_upload(self, file: UploadFile) -> OpenApiForAI:
        """Parse OpenAPI document from uploaded file"""
        try:
            logger.info(f"Starting to process uploaded file: {file.filename}")

            # Check filename
            if not file.filename:
                raise HTTPException(status_code=400, detail="File name cannot be empty")

            # Check file extension
            allowed_extensions = {".json", ".yaml", ".yml", ".txt"}
            file_extension = None
            if "." in file.filename:
                file_extension = "." + file.filename.rsplit(".", 1)[1].lower()

            if file_extension not in allowed_extensions:
                raise HTTPException(status_code=400, detail=f"Unsupported file type, only support: {', '.join(allowed_extensions)}")

            # Check file size
            content = await file.read()
            if len(content) > self.max_file_size:
                raise HTTPException(status_code=413, detail=f"File too large, maximum allowed {self.max_file_size} bytes")

            if len(content) == 0:
                raise HTTPException(status_code=400, detail="File content is empty")

            # Try to decode file content
            try:
                content_str = content.decode("utf-8")
            except UnicodeDecodeError:
                try:
                    content_str = content.decode("gbk")
                except UnicodeDecodeError:
                    raise HTTPException(status_code=400, detail="File encoding not supported, please use UTF-8 or GBK encoding")

            logger.info(f"Successfully read file content, size: {len(content_str)} characters")

            return self._parse_openapi_content(content_str, f"File: {file.filename}")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error occurred while processing uploaded file: {e}")
            raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

    def _parse_openapi_content(self, content: str, source: str) -> OpenApiForAI:
        """Parse OpenAPI document content to OpenApiForAI object"""
        try:
            # Try to parse as JSON first
            try:
                json.loads(content)
                logger.info(f"Detected JSON format OpenAPI document - {source}")
            except json.JSONDecodeError:
                # If not JSON, try to handle as YAML
                try:
                    yaml_data = yaml.safe_load(content)
                    content = json.dumps(yaml_data, ensure_ascii=False)
                    logger.info(f"Detected YAML format OpenAPI document, converted to JSON - {source}")
                except ImportError:
                    raise HTTPException(status_code=500, detail="Missing YAML parsing dependency, please install PyYAML or provide JSON format document")
                except yaml.YAMLError as e:
                    raise HTTPException(status_code=400, detail=f"YAML format error: {str(e)}")

            # Use openapi_helper to convert to OpenApiForAI object
            openapi_for_ai = convert_openapi_for_ai(content)

            logger.info(f"Successfully parsed OpenAPI document - {source}, containing {len(openapi_for_ai.apis)} API endpoints")

            return openapi_for_ai

        except ValueError as e:
            logger.error(f"OpenAPI document format error - {source}: {e}")
            raise HTTPException(status_code=400, detail=f"OpenAPI document format error: {str(e)}")
        except Exception as e:
            logger.error(f"Unknown error occurred while parsing OpenAPI document - {source}: {e}")
            raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")

    async def validate_openapi_url(self, url: str) -> bool:
        """Validate if URL is accessible"""
        return await HttpUtils.validate_url_accessibility(url, timeout=10)


# 创建全局实例
openapi_manager = OpenApiManager()
