# Custom exception classes for unified error handling

from typing import Optional, Dict, Any


class BaseAPIException(Exception):
    """Base exception class for all API exceptions"""
    
    def __init__(
        self,
        message: str = "An error occurred",
        code: int = 500,
        data: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.code = code
        self.data = data
        super().__init__(self.message)


class ValidationException(BaseAPIException):
    """Exception for validation errors (400)"""
    
    def __init__(self, message: str = "Invalid request parameters", data: Optional[Dict[str, Any]] = None):
        super().__init__(message, 400, data)


class UnauthorizedException(BaseAPIException):
    """Exception for unauthorized access (401)"""
    
    def __init__(self, message: str = "Unauthorized access", data: Optional[Dict[str, Any]] = None):
        super().__init__(message, 401, data)


class ForbiddenException(BaseAPIException):
    """Exception for forbidden access (403)"""
    
    def __init__(self, message: str = "Access forbidden", data: Optional[Dict[str, Any]] = None):
        super().__init__(message, 403, data)


class NotFoundException(BaseAPIException):
    """Exception for resource not found (404)"""
    
    def __init__(self, message: str = "Resource not found", data: Optional[Dict[str, Any]] = None):
        super().__init__(message, 404, data)


class ConflictException(BaseAPIException):
    """Exception for resource conflicts (409)"""
    
    def __init__(self, message: str = "Resource conflict", data: Optional[Dict[str, Any]] = None):
        super().__init__(message, 409, data)


class BusinessException(BaseAPIException):
    """Exception for business logic errors (422)"""
    
    def __init__(self, message: str = "Business logic error", data: Optional[Dict[str, Any]] = None):
        super().__init__(message, 422, data)


class InternalServerException(BaseAPIException):
    """Exception for internal server errors (500)"""
    
    def __init__(self, message: str = "Internal server error", data: Optional[Dict[str, Any]] = None):
        super().__init__(message, 500, data)


class ServiceUnavailableException(BaseAPIException):
    """Exception for service unavailable (503)"""
    
    def __init__(self, message: str = "Service temporarily unavailable", data: Optional[Dict[str, Any]] = None):
        super().__init__(message, 503, data)
