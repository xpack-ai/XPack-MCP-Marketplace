import os
import logging
from dotenv import load_dotenv

logging = logging.getLogger(__name__)

load_dotenv()


class Config:
    API_PORT = int(os.getenv("API_PORT", 8002))
    ADMIN_PORT = int(os.getenv("ADMIN_PORT", 8001))
    BASE_URL = os.getenv("BASE_URL", "")
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    # MySQL database configuration
    MYSQL_HOST = os.getenv("MYSQL_HOST", "mysql")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "123456")
    MYSQL_DB = os.getenv("MYSQL_DB", "xpack")

    # Database connection pool settings
    DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", 20))
    DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", 30))
    DB_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", 30))
    DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", 3600))
    DB_POOL_PRE_PING = os.getenv("DB_POOL_PRE_PING", "true").lower() == "true"

    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.example.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
    SMTP_USER = os.getenv("SMTP_USER", "your_email@example.com")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your_password")
    SMTP_SENDER = os.getenv("SMTP_SENDER", SMTP_USER)

    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "redis")
    REDIS_DB = int(os.getenv("REDIS_DB", 0))

    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
    RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
    RABBITMQ_VHOST = os.getenv("RABBITMQ_VHOST", "/")

    # No authentication required paths
    # Can be overridden with NO_AUTH_PATHS environment variable (comma-separated)
    _default_no_auth_paths = [
        "/",
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/api/auth/email/send-captcha",
        "/api/auth/email/sign",
        "/api/auth/account/sign",
        "/api/auth/email/send_captcha",
        "/api/auth/google/sign",
        "/api/web/mcp_tags",
        "/api/web/mcp_services",
        "/api/web/mcp_service_info",
        "/api/payment/callback_stripe",
        # "/api/payment/callback_alipay",
    ]

    # Support custom no-auth paths via environment variable
    _env_no_auth_paths = os.getenv("NO_AUTH_PATHS", "")
    NO_AUTH_PATHS = (
        [path.strip() for path in _env_no_auth_paths.split(",") if path.strip()] if _env_no_auth_paths else _default_no_auth_paths
    )
    NO_AUTH_PREFIX_PATH=[
        "/uploads/",
        "/api/common/"
    ]
    MCP_SESSION_IDLE_TTL_SECONDS = int(os.getenv("MCP_SESSION_IDLE_TTL_SECONDS", 900))
    MCP_SESSION_CLEANUP_INTERVAL_SECONDS = int(os.getenv("MCP_SESSION_CLEANUP_INTERVAL_SECONDS", 60))
    ALLOWED_ORIGINS = [s.strip() for s in os.getenv("ALLOWED_ORIGINS", "*").split(",") if s.strip()]
