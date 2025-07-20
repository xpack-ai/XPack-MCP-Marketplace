# Read config from sys_config table, key is configured in services/admin_service/constants/sys_config_key.py

import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.admin_service.services.sys_config_service import SysConfigService
from services.admin_service.constants.sys_config_key import (
    KEY_PLATFORM_NAME,
    KEY_PLATFORM_LOGO,
    KEY_WEBSITE_TITLE,
    KEY_HEADLINE,
    KEY_SUBHEADLINE,
    KEY_LANGUAGE,
    KEY_LOGIN_GOOGLE_CLIENT,
    KEY_LOGIN_GOOGLE_ENABLE,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/config", summary="Get configuration (no login required)", tags=["common"])
def get_config(db: Session = Depends(get_db)):
    """Get platform configuration settings without authentication."""
    try:
        # Create service instance
        sys_config_service = SysConfigService(db)

        # Get platform config
        platform_name = sys_config_service.get_value_by_key(KEY_PLATFORM_NAME) or "XPack"
        platform_logo = sys_config_service.get_value_by_key(KEY_PLATFORM_LOGO) or ""
        website_title = sys_config_service.get_value_by_key(KEY_WEBSITE_TITLE) or ""
        headline = sys_config_service.get_value_by_key(KEY_HEADLINE) or ""
        subheadline = sys_config_service.get_value_by_key(KEY_SUBHEADLINE) or ""
        language = sys_config_service.get_value_by_key(KEY_LANGUAGE) or ""

        # Get login config
        google_client_id = sys_config_service.get_value_by_key(KEY_LOGIN_GOOGLE_CLIENT) or ""
        google_is_enabled_raw = sys_config_service.get_value_by_key(KEY_LOGIN_GOOGLE_ENABLE) or "false"
        # Convert to boolean
        google_is_enabled = google_is_enabled_raw.lower() in ("true", "t", "yes", "y", "1")

        # Build response data
        config_data = {
            "login": {"google": {"client_id": google_client_id, "is_enabled": google_is_enabled}},
            "platform": {
                "name": platform_name,
                "logo": platform_logo,
                "website_title": website_title,
                "headline": headline,
                "subheadline": subheadline,
                "language": language,
            },
        }

        return ResponseUtils.success(data=config_data)
    except Exception as e:
        logger.error(f"Failed to get config: {str(e)}")
        return ResponseUtils.error(message="Failed to get configuration")
