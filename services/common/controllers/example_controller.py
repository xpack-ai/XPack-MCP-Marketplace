# Example controller demonstrating unified exception handling

from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.common.utils.validation_utils import ValidationUtils
from services.common.exceptions import (
    NotFoundException, 
    ValidationException, 
    BusinessException
)
from services.common.logging_config import get_logger

# Initialize logger with English messages
logger = get_logger(__name__)

router = APIRouter(tags=["example"])


@router.get("/example/users/{user_id}", summary="Get user by ID")
def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Example endpoint demonstrating unified exception handling
    
    This endpoint shows how to:
    1. Use validation utilities
    2. Throw custom exceptions
    3. Let global middleware handle the exceptions
    4. Return consistent responses
    """
    
    # Validate input parameters - will throw ValidationException if invalid
    ValidationUtils.require_non_empty_string(user_id, "user_id")
    
    logger.info(f"Fetching user with ID: {user_id}")
    
    # Simulate database lookup
    # In real implementation, this would be a database query
    user = None  # Simulate user not found
    
    # Validate that resource exists - will throw NotFoundException if not found
    ValidationUtils.require_resource_exists(user, "user")
    
    logger.info(f"Successfully retrieved user: {user_id}")
    return ResponseUtils.success(data=user)


@router.get("/example/users", summary="Get users with pagination")
def get_users(
    page: Optional[int] = Query(1, description="Page number (starts from 1)"),
    page_size: Optional[int] = Query(10, description="Page size (max 100)"),
    keyword: Optional[str] = Query(None, description="Search keyword"),
    db: Session = Depends(get_db)
):
    """
    Example endpoint demonstrating pagination validation
    """
    
    # Validate pagination parameters - will throw ValidationException if invalid
    validated_page, validated_page_size = ValidationUtils.validate_pagination(page, page_size)
    
    # Validate search keyword if provided
    if keyword:
        keyword = ValidationUtils.require_non_empty_string(keyword, "keyword")
    
    logger.info(f"Fetching users - page: {validated_page}, size: {validated_page_size}, keyword: {keyword}")
    
    # Simulate database query
    users = []  # Empty list for demo
    total = 0
    
    logger.info(f"Successfully retrieved {len(users)} users")
    return ResponseUtils.success_page(
        data=users,
        page_num=validated_page,
        page_size=validated_page_size,
        total=total
    )


@router.post("/example/users", summary="Create new user")  
def create_user(
    email: str = Query(..., description="User email"),
    name: str = Query(..., description="User name"),
    db: Session = Depends(get_db)
):
    """
    Example endpoint demonstrating input validation and business logic exceptions
    """
    
    # Validate input parameters
    validated_email = ValidationUtils.validate_email(email)
    validated_name = ValidationUtils.require_non_empty_string(name, "name")
    
    logger.info(f"Creating user with email: {validated_email}")
    
    # Simulate business logic validation
    # Check if user already exists
    existing_user = None  # Simulate database lookup
    if existing_user:
        # This will be caught by global middleware and converted to proper response
        raise BusinessException("User with this email already exists")
    
    # Simulate user creation
    new_user = {
        "id": "123",
        "email": validated_email,
        "name": validated_name
    }
    
    logger.info(f"Successfully created user: {new_user['id']}")
    return ResponseUtils.success(data=new_user, message="User created successfully")


@router.delete("/example/users/{user_id}", summary="Delete user")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Example endpoint demonstrating resource validation and deletion
    """
    
    # Validate input parameters
    ValidationUtils.require_non_empty_string(user_id, "user_id")
    
    logger.info(f"Deleting user with ID: {user_id}")
    
    # Simulate database lookup
    user = None  # Simulate user not found
    
    # This will throw NotFoundException if user doesn't exist
    ValidationUtils.require_resource_exists(user, "user")
    
    # Simulate deletion
    # In real implementation, this would delete from database
    
    logger.info(f"Successfully deleted user: {user_id}")
    return ResponseUtils.success(message="User deleted successfully")
