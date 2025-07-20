# Global exception handling middleware

import json
import traceback
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from services.common.exceptions import BaseAPIException
from services.common.utils.response_utils import ResponseUtils
from services.common.logging_config import get_logger
from services.common import error_msg

logger = get_logger(__name__)


class ExceptionHandlingMiddleware(BaseHTTPMiddleware):
    """
    Global exception handling middleware
    - Catches all unhandled exceptions
    - Converts them to unified response format
    - Logs errors with appropriate levels
    """

    async def dispatch(self, request: Request, call_next):
        """Process requests and handle any exceptions that occur"""
        try:
            response = await call_next(request)
            return response
            
        except BaseAPIException as exc:
            # Handle custom API exceptions
            logger.warning(
                f"API exception occurred: {exc.message} - Path: {request.url.path} - Code: {exc.code}"
            )
            return self._create_error_response(exc.message, exc.code, exc.data)
            
        except HTTPException as exc:
            # Handle FastAPI HTTPExceptions
            logger.warning(
                f"HTTP exception occurred: {exc.detail} - Path: {request.url.path} - Code: {exc.status_code}"
            )
            # Convert to unified format based on status code
            return self._handle_http_exception(exc, request)
            
        except StarletteHTTPException as exc:
            # Handle Starlette HTTPExceptions (including 404 Not Found)
            logger.warning(
                f"Starlette HTTP exception occurred: {exc.detail} - Path: {request.url.path} - Code: {exc.status_code}"
            )
            # Convert to unified format based on status code
            return self._handle_http_exception(exc, request)
            
        except ValueError as exc:
            # Handle validation errors
            logger.warning(f"Validation error occurred: {str(exc)} - Path: {request.url.path}")
            return self._create_error_response("Invalid request parameters", 400)
            
        except ConnectionError as exc:
            # Handle connection errors
            logger.error(f"Connection error occurred: {str(exc)} - Path: {request.url.path}")
            return self._create_error_response("Service temporarily unavailable", 503)
            
        except TimeoutError as exc:
            # Handle timeout errors  
            logger.error(f"Timeout error occurred: {str(exc)} - Path: {request.url.path}")
            return self._create_error_response("Request timeout", 504)
            
        except Exception as exc:
            # Handle all other unexpected exceptions
            logger.error(
                f"Unexpected error occurred: {str(exc)} - Path: {request.url.path}",
                exc_info=True
            )
            # Don't expose internal error details in production
            return self._create_error_response("Internal server error", 500)

    def _create_error_response(self, message: str, status_code: int, data=None) -> JSONResponse:
        """Create standardized error response using ResponseUtils"""
        error_response = ResponseUtils.error(message=message, code=status_code, data=data)
        return JSONResponse(
            status_code=status_code,
            content=error_response,
            headers={"Content-Type": "application/json; charset=utf-8"}
        )
    
    def _handle_http_exception(self, exc, request: Request) -> JSONResponse:
        """
        Handle HTTP exceptions and convert to unified response format
        
        Args:
            exc: HTTPException or StarletteHTTPException
            request: The incoming request
            
        Returns:
            Standardized error response
        """
        status_code = exc.status_code
        
        # Use predefined error messages based on status code
        if status_code == 404:
            message = error_msg.ENDPOINT_NOT_FOUND["message"]
        elif status_code == 400:
            message = error_msg.INVALID_REQUEST["message"]
        elif status_code == 401:
            message = error_msg.UNAUTHORIZED["message"]
        elif status_code == 403:
            message = error_msg.FORBIDDEN["message"]
        elif status_code == 409:
            message = error_msg.CONFLICT["message"]
        elif status_code == 422:
            message = error_msg.VALIDATION_FAILED["message"]
        elif status_code == 500:
            message = error_msg.INTERNAL_ERROR["message"]
        elif status_code == 503:
            message = error_msg.SERVICE_UNAVAILABLE["message"]
        else:
            # Fallback to exception detail for other status codes
            message = exc.detail if hasattr(exc, 'detail') else "HTTP error occurred"
        
        return self._create_error_response(message, status_code)
