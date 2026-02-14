# Read config from sys_config table, key is configured in services/admin_service/constants/sys_config_key.py

import logging
from fastapi import APIRouter, Depends, Request
import json
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.admin_service.utils.user_utils import UserUtils
from services.common import error_msg
from services.admin_service.services.sys_config_service import SysConfigService
from services.admin_service.constants.sys_config_key import *
from services.admin_service.services.payment_channel_service import PaymentChannelService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/config", summary="Get configuration (no login required)", tags=["common"])
def get_config(
        request: Request,
        db: Session = Depends(get_db),
):
    """Get platform configuration settings without authentication."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    try:
        # Create service instance
        sys_config_service = SysConfigService(db)
        payment_channel_service = PaymentChannelService(db)
        values  = sys_config_service.get_all()
        

        # Get homepage config
        faq = sys_config_service.get_value_by_key(KEY_FAQ) or "[]"
        embeded_html = sys_config_service.get_value_by_key(KEY_EMBEDED_HTML,True) or "{}"
        top_navigation = sys_config_service.get_value_by_key(KEY_TOP_NAVIGATION) or "[]"
        try:
            faq = json.loads(faq)
        except json.JSONDecodeError:
            return ResponseUtils.error("Invalid FAQ configuration format")
        try:
            embeded_html = json.loads(embeded_html)
        except json.JSONDecodeError:
            return ResponseUtils.error("Invalid embedded HTML configuration format")
        try:
            top_navigation = json.loads(top_navigation)
        except json.JSONDecodeError:
            return ResponseUtils.error("Invalid top navigation configuration format")
        # Build response data
        config_data = {
            "login": {
                "google": {"client_id": values.get(KEY_LOGIN_GOOGLE_CLIENT, ""), "is_enabled": values.get(KEY_LOGIN_GOOGLE_ENABLE, "false").lower() in ("true", "t", "yes", "y", "1")},
                "email": {"is_enabled": values.get(KEY_LOGIN_EMAIL_ENABLE, "false").lower() in ("true", "t", "yes", "y", "1"), "mode": values.get(KEY_LOGIN_EMAIL_MODE, "password")},
            },
            "platform": {
                "name": values.get(KEY_PLATFORM_NAME, "XPack"),
                "logo": values.get(KEY_PLATFORM_LOGO, ""),
                "website_title": values.get(KEY_WEBSITE_TITLE, ""),
                "headline": values.get(KEY_HEADLINE, ""),
                "subheadline": values.get(KEY_SUBHEADLINE, ""),
                "language": values.get(KEY_LANGUAGE, ""),
                "theme": values.get(KEY_THEME, ""),
                "about_page": values.get(KEY_ABOUT_PAGE,True) or "",
                "mcp_server_prefix": values.get(KEY_MCP_SERVER_PREFIX, ""),
                "meta_description": values.get(KEY_META_DESCRIPTION, ""),
                "x_title": values.get(KEY_X_TITLE, ""),
                "x_description": values.get(KEY_X_DESCRIPTION, ""),
                "x_image_url": values.get(KEY_X_IMAGE_URL, ""),
                "facebook_title": values.get(KEY_FACEBOOK_TITLE, ""),
                "facebook_description": values.get(KEY_FACEBOOK_DESCRIPTION, ""),
                "facebook_image_url": values.get(KEY_FACEBOOK_IMAGE_URL, ""),
                "social_account_facebook_url": values.get(KEY_SOCIAL_ACCOUNT_FACEBOOK_URL, ""),
                "social_account_x_url": values.get(KEY_SOCIAL_ACCOUNT_X_URL, ""),
                "tag_bar_display": values.get(KEY_TAG_BAR_DISPLAY, "false").lower() in ("true", "t", "yes", "y", "1"),
            },
            "faq": faq,
            "embeded_html": embeded_html,
            "top_navigation": top_navigation,
            "payment_channels": [{"id": item.id, "name": item.name} for item in payment_channel_service.available_list()],
        }

        return ResponseUtils.success(data=config_data)
    except Exception as e:
        logger.error(f"Failed to get config: {str(e)}")
        return ResponseUtils.error(message="Failed to get configuration")

@router.get("/homepage", summary="Get homepage configuration (no login required)", tags=["common"])
def get_homepage_config(
        request: Request,
        db: Session = Depends(get_db),
):
    """Get homepage configuration settings without authentication."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    try:
        # Create service instance
        sys_config_service = SysConfigService(db)

        # Get homepage config
        faq = sys_config_service.get_value_by_key(KEY_FAQ) or "[]"
        embeded_html = sys_config_service.get_value_by_key(KEY_EMBEDED_HTML,True) or "{}"
        top_navigation = sys_config_service.get_value_by_key(KEY_TOP_NAVIGATION) or "[]"
        try:
            faq = json.loads(faq)
        except json.JSONDecodeError:
            return ResponseUtils.error("Invalid FAQ configuration format")
        try:
            embeded_html = json.loads(embeded_html)
        except json.JSONDecodeError:
            return ResponseUtils.error("Invalid embedded HTML configuration format")
        try:
            top_navigation = json.loads(top_navigation)
        except json.JSONDecodeError:
            return ResponseUtils.error("Invalid top navigation configuration format")
        config_data = {
            "faq": faq,
            "embeded_html": embeded_html,
            "top_navigation": top_navigation,
        }
        return ResponseUtils.success(data=config_data)
    except Exception as e:
        logger.error(f"Failed to get homepage config: {str(e)}")
        return ResponseUtils.error(message="Failed to get configuration")