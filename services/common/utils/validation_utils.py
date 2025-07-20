# Validation utilities with unified exception handling

import re
from typing import Any, Optional, List, Dict
from services.common.exceptions import ValidationException, NotFoundException


class ValidationUtils:
    """Utility class for common validation operations"""

    @staticmethod
    def require_parameter(value: Any, param_name: str = "parameter") -> Any:
        """
        Validate that a required parameter is provided
        
        Args:
            value: The parameter value to validate
            param_name: Name of the parameter for error message
            
        Returns:
            The validated value
            
        Raises:
            ValidationException: If parameter is missing or empty
        """
        if value is None or (isinstance(value, str) and value.strip() == ""):
            raise ValidationException(f"Required parameter '{param_name}' is missing or empty")
        return value

    @staticmethod
    def require_non_empty_string(value: str, param_name: str = "parameter") -> str:
        """
        Validate that a string parameter is not empty
        
        Args:
            value: The string value to validate
            param_name: Name of the parameter for error message
            
        Returns:
            The validated string
            
        Raises:
            ValidationException: If string is None or empty
        """
        if not value or not isinstance(value, str) or value.strip() == "":
            raise ValidationException(f"Parameter '{param_name}' must be a non-empty string")
        return value.strip()

    @staticmethod
    def validate_positive_integer(value: Any, param_name: str = "parameter") -> int:
        """
        Validate that a parameter is a positive integer
        
        Args:
            value: The value to validate
            param_name: Name of the parameter for error message
            
        Returns:
            The validated integer
            
        Raises:
            ValidationException: If value is not a positive integer
        """
        try:
            int_value = int(value)
            if int_value <= 0:
                raise ValidationException(f"Parameter '{param_name}' must be a positive integer")
            return int_value
        except (ValueError, TypeError):
            raise ValidationException(f"Parameter '{param_name}' must be a valid positive integer")

    @staticmethod
    def validate_email(email: str, param_name: str = "email") -> str:
        """
        Validate email format
        
        Args:
            email: The email to validate
            param_name: Name of the parameter for error message
            
        Returns:
            The validated email
            
        Raises:
            ValidationException: If email format is invalid
        """
        if not email or not isinstance(email, str):
            raise ValidationException(f"Parameter '{param_name}' must be a valid email address")
            
        email = email.strip().lower()
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(email_pattern, email):
            raise ValidationException(f"Parameter '{param_name}' must be a valid email address")
            
        return email

    @staticmethod
    def validate_url(url: str, param_name: str = "url") -> str:
        """
        Validate URL format
        
        Args:
            url: The URL to validate
            param_name: Name of the parameter for error message
            
        Returns:
            The validated URL
            
        Raises:
            ValidationException: If URL format is invalid
        """
        if not url or not isinstance(url, str):
            raise ValidationException(f"Parameter '{param_name}' must be a valid URL")
            
        url = url.strip()
        url_pattern = r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$'
        
        if not re.match(url_pattern, url):
            raise ValidationException(f"Parameter '{param_name}' must be a valid HTTP/HTTPS URL")
            
        return url

    @staticmethod
    def validate_pagination(page: Any, page_size: Any) -> tuple[int, int]:
        """
        Validate pagination parameters
        
        Args:
            page: Page number
            page_size: Page size
            
        Returns:
            Tuple of (validated_page, validated_page_size)
            
        Raises:
            ValidationException: If pagination parameters are invalid
        """
        # Default values
        validated_page = 1 if page is None else page
        validated_page_size = 10 if page_size is None else page_size
        
        # Validate page
        validated_page = ValidationUtils.validate_positive_integer(validated_page, "page")
        
        # Validate page_size
        validated_page_size = ValidationUtils.validate_positive_integer(validated_page_size, "page_size")
        
        # Limit maximum page size
        if validated_page_size > 100:
            raise ValidationException("Parameter 'page_size' cannot exceed 100")
            
        return validated_page, validated_page_size

    @staticmethod
    def require_resource_exists(resource: Any, resource_name: str = "resource") -> Any:
        """
        Validate that a resource exists
        
        Args:
            resource: The resource to check
            resource_name: Name of the resource for error message
            
        Returns:
            The validated resource
            
        Raises:
            NotFoundException: If resource does not exist
        """
        if resource is None:
            raise NotFoundException(f"{resource_name.capitalize()} not found")
        return resource

    @staticmethod
    def validate_choice(value: str, choices: List[str], param_name: str = "parameter") -> str:
        """
        Validate that a parameter value is one of the allowed choices
        
        Args:
            value: The value to validate
            choices: List of allowed values
            param_name: Name of the parameter for error message
            
        Returns:
            The validated value
            
        Raises:
            ValidationException: If value is not in allowed choices
        """
        if value not in choices:
            choices_str = ", ".join(choices)
            raise ValidationException(f"Parameter '{param_name}' must be one of: {choices_str}")
        return value
