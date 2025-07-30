"""
Platform Report Service

This service handles reporting platform information to the official XPack platform
when is_showcased is enabled.
"""

import asyncio
from typing import Optional, Dict, Any
from services.common.logging_config import get_logger
from services.common.utils.http_utils import HttpUtils
from services.common.exceptions import ServiceUnavailableException, InternalServerException

logger = get_logger(__name__)


class PlatformReportService:
    """Service for reporting platform information to XPack official platform"""

    # Official XPack platform reporting endpoint
    XPACK_REPORT_URL = "https://platform.xpack.ai/v1/cases/report"

    def __init__(self):
        """Initialize platform report service"""
        self.http_utils = HttpUtils()

    async def report_platform_info(self, platform_data: Dict[str, Any]) -> bool:
        """
        Report platform information to XPack official platform

        Args:
            platform_data: Platform configuration data containing:
                - name: Platform name
                - logo: Platform logo URL
                - url: Platform URL
                - website_title: Website title
                - headline: Homepage headline
                - subheadline: Homepage subheadline
                - language: Platform language
                - theme: Platform theme
                - domain: Platform domain
                - is_showcased: Whether to showcase on XPack website
                - mcp_server_prefix: MCP server prefix

        Returns:
            bool: True if report was successful, False otherwise
        """
        try:
            # Validate required fields
            if not self._validate_platform_data(platform_data):
                logger.warning("Platform data validation failed, skipping report")
                return False

            # Check if showcasing is enabled
            if not platform_data.get("is_showcased", False):
                logger.info("Platform showcasing is disabled, skipping report")
                return True

            # Prepare report payload
            report_payload = {
                "platform": {
                    "name": platform_data.get("name", ""),
                    "logo": platform_data.get("logo", ""),
                    "url": platform_data.get("url", ""),
                    "website_title": platform_data.get("website_title", ""),
                    "domain": platform_data.get("domain", ""),
                    "headline": platform_data.get("headline", ""),
                    "subheadline": platform_data.get("subheadline", ""),
                    "language": platform_data.get("language", ""),
                    "is_showcased": platform_data.get("is_showcased", False),
                    "mcp_server_prefix": platform_data.get("mcp_server_prefix", ""),
                }
            }

            logger.info(f"Reporting platform information to XPack platform: {platform_data.get('name', 'Unknown')}")

            # Send report to XPack platform
            response = await self.http_utils.post_json(
                url=self.XPACK_REPORT_URL, data=report_payload, timeout=15  # Reduced timeout to avoid blocking main operations
            )

            logger.info(f"Platform report successful: {response}")
            return True

        except ServiceUnavailableException as e:
            logger.error(f"Failed to report platform info due to network issue: {e}")
            return False
        except InternalServerException as e:
            logger.error(f"Failed to report platform info due to internal error: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during platform reporting: {e}")
            return False

    def _validate_platform_data(self, platform_data: Dict[str, Any]) -> bool:
        """
        Validate platform data before reporting

        Args:
            platform_data: Platform data to validate

        Returns:
            bool: True if data is valid, False otherwise
        """
        required_fields = ["name"]

        for field in required_fields:
            if not platform_data.get(field):
                logger.warning(f"Missing required field for platform report: {field}")
                return False

        return True

    def report_platform_info_sync(self, platform_data: Dict[str, Any]) -> bool:
        """
        Synchronous wrapper for reporting platform information
        This method is designed to be non-blocking and fail-safe to avoid impacting main business logic.

        Args:
            platform_data: Platform configuration data

        Returns:
            bool: True if report was successful, False otherwise
        """
        try:
            # Try to get the current event loop
            try:
                loop = asyncio.get_running_loop()
                # If we're already in an event loop, use asyncio.create_task
                import concurrent.futures

                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(asyncio.run, self.report_platform_info(platform_data))
                    # Reduced timeout to avoid blocking main operations
                    return future.result(timeout=30)
            except RuntimeError:
                # No event loop running, create a new one
                return asyncio.run(self.report_platform_info(platform_data))
        except Exception as e:
            # Log error but don't propagate to avoid affecting main business logic
            logger.warning(f"Platform reporting failed but continuing with main operation: {e}")
            return False

    def report_platform_info_background(self, platform_data: Dict[str, Any]) -> None:
        """
        Background reporting method that runs asynchronously without blocking main operations.
        This method is fire-and-forget style to ensure zero impact on main business logic.

        Args:
            platform_data: Platform configuration data
        """
        import threading

        def _background_report():
            try:
                # Use a shorter timeout for background operations
                self.report_platform_info_sync(platform_data)
            except Exception as e:
                # Silently handle any exceptions to avoid affecting main operations
                logger.debug(f"Background platform reporting completed with issues: {e}")

        # Start reporting in background thread
        thread = threading.Thread(target=_background_report, daemon=True)
        thread.start()
        logger.debug("Platform reporting started in background thread")
