from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.auth import verify_token
from services.common.models.user import User
from services.common.config import Config
from services.common.logging_config import get_logger
from services.common.utils.response_utils import ResponseUtils
from typing import Optional
import re
import json

logger = get_logger(__name__)


class AuthMiddleware:
    """
    Authentication middleware
    - Authenticates all HTTP requests
    - Skips paths defined in configuration that don't require authentication
    - Validates JWT Token and injects user information into request context
    """

    def __init__(self, app):
        self.app = app
        logger.info(f"AuthMiddleware initialized, no-auth paths: {len(Config.NO_AUTH_PATHS)} paths configured")

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Get request path
            path = scope.get("path", "")

            # Skip paths that don't require authentication
            if path in Config.NO_AUTH_PATHS:
                logger.debug(f"Skipping authentication for path: {path}")
                await self.app(scope, receive, send)
                return
            for prefix_path in Config.NO_AUTH_PREFIX_PATH:
                if path.startswith(prefix_path):
                    logger.debug(f"Skipping authentication for path prefix: {prefix_path}")
                    await self.app(scope, receive, send)
                    return
            # Get headers
            headers = scope.get("headers", [])
            auth_header = None

            # Find Authorization header
            for key, value in headers:
                if key == b"authorization":
                    auth_header = value.decode("utf-8")
                    break

            if not auth_header:
                await self._send_error_response(send, 401, "Authorization header is required")
                return

            token = auth_header.replace("Bearer ", "")

            # Validate token
            db = next(get_db())
            try:
                user = verify_token(token, db)
                if not user:
                    await self._send_error_response(send, 401, "Invalid or expired token")
                    return

                # Add user information to request state
                scope["user"] = user
                scope["user_token"] = token

            except Exception as e:
                logger.error(f"Authentication error: {str(e)}")
                await self._send_error_response(send, 500, "Internal server error during authentication")
                return
            finally:
                if "db" in locals():
                    db.close()

        await self.app(scope, receive, send)

    async def _send_error_response(self, send, status_code: int, detail: str):
        """
        Send error response using unified response format
        """
        # Use ResponseUtils to generate unified error response format
        error_response_data = ResponseUtils.error(message=detail, code=status_code)
        response_body = json.dumps(error_response_data, ensure_ascii=False).encode("utf-8")

        await send(
            {"type": "http.response.start", "status": status_code, "headers": [(b"content-type", b"application/json; charset=utf-8")]}
        )

        await send({"type": "http.response.body", "body": response_body})
