# Unified response utilities for consistent API responses

from typing import Any, Optional, Dict
from services.common.exceptions import BaseAPIException


class ResponseUtils:
    """Utility class for creating standardized API responses"""

    @staticmethod
    def success(data: Any = None, message: str = "Success", code: int = 200) -> Dict[str, Any]:
        """
        Create a successful response
        
        Args:
            data: Response data
            message: Success message
            code: HTTP status code
            
        Returns:
            Standardized success response
        """
        return {
            "success": True, 
            "code": str(code), 
            "error_message": message, 
            "data": data
        }

    @staticmethod
    def success_page(
        data: Any = None, 
        message: str = "Success", 
        code: int = 200, 
        page_num: int = 1, 
        page_size: int = 10, 
        total: int = 0
    ) -> Dict[str, Any]:
        """
        Create a successful paginated response
        
        Args:
            data: Response data
            message: Success message
            code: HTTP status code
            page_num: Current page number
            page_size: Page size
            total: Total number of items
            
        Returns:
            Standardized paginated success response
        """
        return {
            "success": True,
            "code": str(code),
            "error_message": message,
            "data": data,
            "page": {
                "page": page_num, 
                "page_size": page_size, 
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0
            }
        }

    @staticmethod
    def error(
        message: str = "An error occurred", 
        code: int = 500, 
        data: Any = None, 
        error_msg: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create an error response
        
        Args:
            message: Error message
            code: HTTP status code
            data: Additional error data
            error_msg: Error message dictionary from error_msg.py
            
        Returns:
            Standardized error response
        """
        if error_msg and isinstance(error_msg, dict):
            code = error_msg.get("code", code)
            message = error_msg.get("message", message)
            
        return {
            "success": False, 
            "code": str(code), 
            "error_message": message, 
            "data": data
        }

    @staticmethod
    def from_exception(exception: BaseAPIException) -> Dict[str, Any]:
        """
        Create an error response from a custom exception
        
        Args:
            exception: Custom API exception
            
        Returns:
            Standardized error response
        """
        return ResponseUtils.error(
            message=exception.message,
            code=exception.code,
            data=exception.data
        )
