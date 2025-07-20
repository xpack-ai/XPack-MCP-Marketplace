from fastapi import APIRouter, Query
from typing import Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import Depends
from services.admin_service.services.user_service import UserService
from services.admin_service.services.user_wallet_service import UserWalletService
from services.common.database import get_db
from services.common.models.user import User
from services.common.response.user_manager_response import UserManagerResponse
from services.common.utils.response_utils import ResponseUtils
from services.common.utils.validation_utils import ValidationUtils
from services.common.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()


def get_user_wallet_service(db: Session = Depends(get_db)) -> UserWalletService:
    return UserWalletService(db)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.delete("/account", summary="Delete user account")
async def delete_user(
    id: str,
    user_service: UserService = Depends(get_user_service),
):
    """Delete user by ID."""
    
    # Validate user ID parameter
    ValidationUtils.require_non_empty_string(id, "id")
    
    logger.info(f"Deleting user with ID: {id}")
    
    # Delete user - let any exception bubble up to middleware
    user = user_service.delete(id)
    
    # Validate that user was found and deleted
    ValidationUtils.require_resource_exists(user, "user")
    
    logger.info(f"Successfully deleted user: {id}")
    return ResponseUtils.success(
        data=UserManagerResponse(**user.__dict__),
        message="User deleted successfully"
    )


@router.get("/account/list", summary="Get user list with pagination")
async def get_user_list(
    page: int = Query(1, description="Page number (starts from 1)"),
    page_size: int = Query(15, description="Number of items per page"),
    user_service: UserService = Depends(get_user_service),
    user_wallet_service: UserWalletService = Depends(get_user_wallet_service),
):
    """Get paginated list of users with wallet information."""
    
    # Validate pagination parameters
    validated_page, validated_page_size = ValidationUtils.validate_pagination(page, page_size)
    
    logger.info(f"Fetching user list - page: {validated_page}, size: {validated_page_size}")
    
    # Calculate offset
    skip = (validated_page - 1) * validated_page_size

    # Get user list - let any exception bubble up to middleware
    total, users = user_service.get_user_list(skip, validated_page_size)

    # Convert user data to list
    user_list = []
    for user in users:
        wallet = user_wallet_service.get_by_user_id(user.id)
        user_list.append({"id": user.id, "email": user.email, "created_at": user.created_at, "balance": wallet.balance if wallet else 0})

    return ResponseUtils.success_page(data=user_list, total=total, page_num=page, page_size=page_size)
