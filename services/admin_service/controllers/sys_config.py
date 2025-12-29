"""Admin system configuration controller.

Provides endpoints to read and update platform configurations, homepage content,
and to test email settings. All responses and comments are standardized in English.
"""
from fastapi import APIRouter, Depends, Body
import json
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.common.utils.email_utils import EmailUtils
from services.admin_service.services.sys_config_service import SysConfigService
from services.admin_service.services.user_service import UserService
from services.admin_service.services.platform_report_service import PlatformReportService
from services.admin_service.constants import sys_config_key
from services.common.logging_config import get_logger
from services.admin_service.utils.ip import get_public_ip, get_local_ip
from services.common.utils.validation_utils import ValidationUtils
from services.common.exceptions import ValidationException



logger = get_logger(__name__)

router = APIRouter()


def get_sysconfig_service(db: Session = Depends(get_db)) -> SysConfigService:
    return SysConfigService(db)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)

@router.get("/homepage")
def get_homepage(
    sysconfig_service: SysConfigService = Depends(get_sysconfig_service),
    ):
    """Get homepage configuration including FAQ, top navigation, and embedded HTML."""
    faq = sysconfig_service.get_value_by_key(sys_config_key.KEY_FAQ) or "[]"
    # Check empty value; if not empty, deserialize JSON
    try:
        # Array type
        if faq.startswith("[") and faq.endswith("]"):
            faq = json.loads(faq)
        else:
            return ResponseUtils.error("Invalid FAQ configuration format")
    except json.JSONDecodeError:
        return ResponseUtils.error("Invalid FAQ configuration format")
    

    top_navigation = sysconfig_service.get_value_by_key(sys_config_key.KEY_TOP_NAVIGATION) or "[]"
    try:
        # Array type
        if top_navigation.startswith("[") and top_navigation.endswith("]"):
            top_navigation = json.loads(top_navigation)
        else:
            return ResponseUtils.error("Invalid top navigation configuration format")
    except json.JSONDecodeError:
        return ResponseUtils.error("Invalid top navigation configuration format")
    embeded_html = sysconfig_service.get_value_by_key(sys_config_key.KEY_EMBEDED_HTML,True) or "{}"
    try:
        embeded_html = json.loads(embeded_html)
    except json.JSONDecodeError:
        return ResponseUtils.error("Invalid embedded HTML configuration format")

    return ResponseUtils.success(
        data={
            "faq": faq,
            "top_navigation": top_navigation,
            "embeded_html": embeded_html,
        }
    )

@router.put("/homepage")
def update_homepage(
    sysconfig_service: SysConfigService = Depends(get_sysconfig_service),
    body: dict = Body(...),
):
    faq = body.get("faq")
    top_navigation = body.get("top_navigation")
    embeded_html = body.get("embeded_html")
    """Update system configuration settings."""
    if faq:
        sysconfig_service.set_value_by_key(sys_config_key.KEY_FAQ, json.dumps(faq),"FAQ")
    if top_navigation:
        sysconfig_service.set_value_by_key(sys_config_key.KEY_TOP_NAVIGATION, json.dumps(top_navigation),"Top Navigation")
    if embeded_html:
        sysconfig_service.set_value_by_key(sys_config_key.KEY_EMBEDED_HTML, json.dumps(embeded_html),"Embeded HTML",True)
    return ResponseUtils.success()

@router.get("/info")
def get_sysconfig(
    sysconfig_service: SysConfigService = Depends(get_sysconfig_service),
    user_service: UserService = Depends(get_user_service),
):
    """Get all system configuration settings."""
    admin_user = user_service.get_admin_user()
    # Batch read configurations (small table)
    
    large_keys = [
        sys_config_key.KEY_ABOUT_PAGE,
    ]

    small_values = sysconfig_service.get_all()
    large_values = sysconfig_service.get_all(large_keys, is_large=True)

    

    cname_a_ip = small_values.get(sys_config_key.KEY_CNAME_A_IP, "")
    if not cname_a_ip:
        # Get public IP; if unavailable, fall back to local IP
        public_ip = get_public_ip()
        cname_a_ip = public_ip if public_ip else get_local_ip()
        sysconfig_service.set_value_by_key(sys_config_key.KEY_CNAME_A_IP, cname_a_ip,"CNAME A IP")

    # Admin username
    admin_username = ""
    if admin_user and admin_user.name:
        admin_username = admin_user.name

    return ResponseUtils.success(
        data={
            "platform": {
                "name": small_values.get(sys_config_key.KEY_PLATFORM_NAME, ""),
                "logo": small_values.get(sys_config_key.KEY_PLATFORM_LOGO, ""),
                "url": small_values.get(sys_config_key.KEY_PLATFORM_URL, ""),
                "website_title": small_values.get(sys_config_key.KEY_WEBSITE_TITLE, ""),
                "headline": small_values.get(sys_config_key.KEY_HEADLINE, ""),
                "subheadline": small_values.get(sys_config_key.KEY_SUBHEADLINE, ""),
                "language": small_values.get(sys_config_key.KEY_LANGUAGE, ""),
                "theme": small_values.get(sys_config_key.KEY_THEME, ""),
                "about_page": large_values.get(sys_config_key.KEY_ABOUT_PAGE, ""),
                "domain": small_values.get(sys_config_key.KEY_DOMAIN, ""),
                "is_showcased": small_values.get(sys_config_key.KEY_IS_SHOWCASED, "").lower() in ("true", "t", "yes", "y", "1"),
                "mcp_server_prefix": small_values.get(sys_config_key.KEY_MCP_SERVER_PREFIX, ""),
                "meta_description": small_values.get(sys_config_key.KEY_META_DESCRIPTION, ""),
                "x_title": small_values.get(sys_config_key.KEY_X_TITLE, ""),
                "x_description": small_values.get(sys_config_key.KEY_X_DESCRIPTION, ""),
                "x_image_url": small_values.get(sys_config_key.KEY_X_IMAGE_URL, ""),
                "facebook_title": small_values.get(sys_config_key.KEY_FACEBOOK_TITLE, ""),
                "facebook_description": small_values.get(sys_config_key.KEY_FACEBOOK_DESCRIPTION, ""),
                "facebook_image_url": small_values.get(sys_config_key.KEY_FACEBOOK_IMAGE_URL, ""),
                "social_account_facebook_url": small_values.get(sys_config_key.KEY_SOCIAL_ACCOUNT_FACEBOOK_URL, ""),
                "social_account_x_url": small_values.get(sys_config_key.KEY_SOCIAL_ACCOUNT_X_URL, ""),
                "cname_a_ip": cname_a_ip,
                "tag_bar_display": small_values.get(sys_config_key.KEY_TAG_BAR_DISPLAY, "").lower() in ("true", "t", "yes", "y", "1"),
            },
            "account": {
                "username": admin_username,
            },
            "email": {
                "smtp_host": small_values.get(sys_config_key.KEY_EMAIL_SMTP_HOST, ""),
                "smtp_port": small_values.get(sys_config_key.KEY_EMAIL_SMTP_PORT, ""),
                "smtp_user": small_values.get(sys_config_key.KEY_EMAIL_SMTP_USER, ""),
                "smtp_password": small_values.get(sys_config_key.KEY_EMAIL_SMTP_PASSWORD, ""),
                "smtp_sender": small_values.get(sys_config_key.KEY_EMAIL_SMTP_SENDER, ""),
            },
            "login": {
                "google": {
                    "client_id": small_values.get(sys_config_key.KEY_LOGIN_GOOGLE_CLIENT, ""),
                    "client_secret": small_values.get(sys_config_key.KEY_LOGIN_GOOGLE_SECRET, ""),
                    "is_enabled": small_values.get(sys_config_key.KEY_LOGIN_GOOGLE_ENABLE, "").lower() in ("true", "t", "yes", "y", "1"),
                },
                "email":{
                    "is_enabled": small_values.get(sys_config_key.KEY_LOGIN_EMAIL_ENABLE, "").lower() in ("true", "t", "yes", "y", "1"),
                    "mode": small_values.get(sys_config_key.KEY_LOGIN_EMAIL_MODE, ""),
                }
            },
        }
    )


@router.put("/info")
def set_sysconfig(
    body: dict = Body(...),
    user_service: UserService = Depends(get_user_service),
    sysconfig_service: SysConfigService = Depends(get_sysconfig_service),
):
    """Update system configuration settings."""
    try:
        platform_name = ""
        platform_logo = ""
        platform_url = ""
        website_title = ""
        headline = ""
        subheadline = ""
        language = ""
        admin_username = ""
        admin_password = ""
        login_google_client = ""
        login_google_secret = ""
        login_google_enable = ""
        email_smtp_host = ""
        email_smtp_port = ""
        email_smtp_user = ""
        email_smtp_password = ""
        email_smtp_sender = ""

        # Safely get nested values using `.get`
        platform = body.get("platform", {})
        platform_name = platform.get("name")
        platform_logo = platform.get("logo")
        platform_url = platform.get("url")
        website_title = platform.get("website_title")
        headline = platform.get("headline")
        subheadline = platform.get("subheadline")
        language = platform.get("language")
        theme = platform.get("theme")
        about_page = platform.get("about_page")
        domain = platform.get("domain")
        is_showcased = platform.get("is_showcased")
        mcp_server_prefix = platform.get("mcp_server_prefix")
        meta_description = platform.get("meta_description")
        x_title = platform.get("x_title")
        x_description = platform.get("x_description")
        x_image_url = platform.get("x_image_url")
        facebook_title = platform.get("facebook_title")
        facebook_description = platform.get("facebook_description")
        facebook_image_url = platform.get("facebook_image_url")
        social_account_facebook_url = platform.get("social_account_facebook_url")
        social_account_x_url = platform.get("social_account_x_url")
        tag_bar_display = platform.get("tag_bar_display")



        account = body.get("account", {})
        admin_username = account.get("username")
        admin_password = account.get("password")

        login = body.get("login", {})
        google_config = login.get("google", {})
        login_google_client = google_config.get("client_id")
        login_google_secret = google_config.get("client_secret")
        login_google_enable = google_config.get("is_enabled")  # default is False
        login_email_config = login.get("email", {})
        login_email_mode = login_email_config.get("mode")
        login_email_is_enable = login_email_config.get("is_enabled")  # default is False
        
        # Get email configuration from outer payload
        email_config = body.get("email", {})
        email_smtp_host = email_config.get("smtp_host")
        email_smtp_port = email_config.get("smtp_port")
        email_smtp_user = email_config.get("smtp_user")
        email_smtp_password = email_config.get("smtp_password")
        email_smtp_sender = email_config.get("smtp_sender")
        
        if domain:
            try:
                domain = ValidationUtils.validate_domain(domain)
            except ValidationException as e:
                return ResponseUtils.error(message=str(e), code=400)
        
        # Batch update configuration
        configs = [
            (sys_config_key.KEY_PLATFORM_NAME, platform_name, "Platform name"),
            (sys_config_key.KEY_PLATFORM_LOGO, platform_logo, "Platform logo",),
            (sys_config_key.KEY_PLATFORM_URL, platform_url, "Platform URL"),
            (sys_config_key.KEY_WEBSITE_TITLE, website_title, "Website title"),
            (sys_config_key.KEY_HEADLINE, headline, "Homepage title"),
            (sys_config_key.KEY_SUBHEADLINE, subheadline, "Subtitle"),
            (sys_config_key.KEY_LANGUAGE, language, "Language"),
            (sys_config_key.KEY_THEME, theme, "Theme"),
            (sys_config_key.KEY_ABOUT_PAGE, about_page, "About page"),
            (sys_config_key.KEY_DOMAIN, domain, "Domain"),
            (sys_config_key.KEY_IS_SHOWCASED, is_showcased, "Is showcased"),
            (sys_config_key.KEY_MCP_SERVER_PREFIX, mcp_server_prefix, "MCP server prefix"),
            (sys_config_key.KEY_META_DESCRIPTION, meta_description, "Meta description"),
            (sys_config_key.KEY_X_TITLE, x_title, "X title"),
            (sys_config_key.KEY_X_DESCRIPTION, x_description, "X description"),
            (sys_config_key.KEY_X_IMAGE_URL, x_image_url, "X image URL"),
            (sys_config_key.KEY_FACEBOOK_TITLE, facebook_title, "Facebook title"),
            (sys_config_key.KEY_FACEBOOK_DESCRIPTION, facebook_description, "Facebook description"),
            (sys_config_key.KEY_FACEBOOK_IMAGE_URL, facebook_image_url, "Facebook image URL"),
            (sys_config_key.KEY_SOCIAL_ACCOUNT_FACEBOOK_URL, social_account_facebook_url, "Facebook URL"),
            (sys_config_key.KEY_SOCIAL_ACCOUNT_X_URL, social_account_x_url, "X URL"),
            (sys_config_key.KEY_TAG_BAR_DISPLAY, tag_bar_display, "Tag bar display"),
            (sys_config_key.KEY_LOGIN_GOOGLE_CLIENT, login_google_client, "Google login client ID"),
            (sys_config_key.KEY_LOGIN_GOOGLE_SECRET, login_google_secret, "Google login client secret"),
            (sys_config_key.KEY_LOGIN_GOOGLE_ENABLE, login_google_enable, "Google login enabled"),
            (sys_config_key.KEY_EMAIL_SMTP_HOST, email_smtp_host, "Email SMTP host"),
            (sys_config_key.KEY_EMAIL_SMTP_PORT, email_smtp_port, "Email SMTP port"),
            (sys_config_key.KEY_EMAIL_SMTP_USER, email_smtp_user, "Email SMTP user"),
            (sys_config_key.KEY_EMAIL_SMTP_PASSWORD, email_smtp_password, "Email SMTP password"),
            (sys_config_key.KEY_EMAIL_SMTP_SENDER, email_smtp_sender, "Email sender address"),
            (sys_config_key.KEY_LOGIN_EMAIL_ENABLE, login_email_is_enable, "Email login enabled"),
            (sys_config_key.KEY_LOGIN_EMAIL_MODE, login_email_mode, "Email login mode"),
        ]

        # Update admin username and password
        user_service.update_admin(name=admin_username, password=admin_password)

        for key, value, desc in configs:
            if value is not None:  # Only update when value is not None
                is_large = False
                if key == sys_config_key.KEY_ABOUT_PAGE:
                    is_large = True
                sysconfig_service.set_value_by_key(key, value, desc,is_large)

        # Report platform information asynchronously to avoid impacting main operations
        try:
            platform_report_service = PlatformReportService()
            
            # Prepare platform data for reporting
            platform_report_data = {
                "name": platform_name,
                "logo": platform_logo,
                "url": platform_url,
                "website_title": website_title,
                "headline": headline,
                "subheadline": subheadline,
                "language": language,
                "theme": theme,
                "domain": domain,
                "is_showcased": is_showcased,
                "mcp_server_prefix": mcp_server_prefix,
                "meta_description": meta_description,
                "x_title": x_title,
                "x_description": x_description,
                "x_image_url": x_image_url,
                "facebook_title": facebook_title,
                "facebook_description": facebook_description,
                "facebook_image_url": facebook_image_url,
                "social_account_facebook_url": social_account_facebook_url,
                "social_account_x_url": social_account_x_url,
                "tag_bar_display": tag_bar_display,
            }
            
            # Use background reporting to avoid blocking the main configuration update
            platform_report_service.report_platform_info_background(platform_report_data)
            logger.debug("Platform information reporting initiated in background")
                
        except Exception as e:
            # Log error but continue with main operation - reporting failure should not affect configuration update
            logger.warning(f"Failed to initiate platform reporting: {e}")

        return get_sysconfig(sysconfig_service, user_service)

    except Exception as e:
        return ResponseUtils.error(f"Failed to update system configuration: {str(e)}")


@router.post("/test_email")
def test_email_config(
    body: dict = Body(...),
    db: Session = Depends(get_db),
):
    """Test email configuration with a test message."""
    try:
        test_email = body.get("email")
        if not test_email:
            return ResponseUtils.error("Please provide a test email address")

        # Test connection configuration
        success, message = EmailUtils.test_email_config(db)
        if not success:
            return ResponseUtils.error(message)

        # Send test email
        test_success = EmailUtils.send_email(
            db, "XPack Email Configuration Test", "This is a test email to verify the email configuration. If you receive this email, the configuration is working!", test_email, False
        )

        if test_success:
            return ResponseUtils.success(data={"message": "Test email sent successfully, please check your inbox"})
        else:
            return ResponseUtils.error("Failed to send test email")

    except Exception as e:
        return ResponseUtils.error(f"Failed to test email configuration: {str(e)}")




