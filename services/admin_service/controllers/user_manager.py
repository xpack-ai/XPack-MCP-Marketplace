from fastapi import APIRouter, Query, Body, Request
from sqlalchemy.orm import Session
from fastapi import Depends
from services.admin_service.services.user_service import UserService
from services.admin_service.services.user_wallet_service import UserWalletService
from services.admin_service.services.resource_group_service import ResourceGroupService
from services.common.database import get_db
from services.common.response.user_manager_response import UserManagerResponse
from services.common.utils.response_utils import ResponseUtils
from services.common.utils.validation_utils import ValidationUtils
from services.common.logging_config import get_logger
import json,hashlib
from services.common import error_msg
from services.admin_service.services.payment_service import PaymentService
from services.admin_service.utils.user_utils import UserUtils



logger = get_logger(__name__)

router = APIRouter()


def get_user_wallet_service(db: Session = Depends(get_db)) -> UserWalletService:
    return UserWalletService(db)


def get_resource_group_service(db: Session = Depends(get_db)) -> ResourceGroupService:
    return ResourceGroupService(db)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)

def get_payment_service(db: Session = Depends(get_db)) -> PaymentService:
    return PaymentService(db)


@router.put("/resource_group", summary="update user resource group")
async def update_user_resource_group(
    request: Request,
    body: dict = Body(...),
    user_service: UserService = Depends(get_user_service),
    resource_group_service: ResourceGroupService = Depends(get_resource_group_service),
):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    """Update user resource group."""
    user_id = body.get("user_id")
    group_id = body.get("resource_group")
    if not user_id or not group_id:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    group = resource_group_service.get_info(group_id)
    if not group:
        return ResponseUtils.error(error_msg=error_msg.RESOURCE_NOT_FOUND)
    user = user_service.get_by_id(user_id)
    if not user:
        return ResponseUtils.error(error_msg=error_msg.USER_NOT_FOUND)
    user_service.update_resource_group(user_id, group_id)
    return ResponseUtils.success()



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
    keyword: str = Query(None, description="Search keyword for email or name"),
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
    total, users = user_service.get_user_list(skip, validated_page_size, keyword)

    # Convert user data to list
    user_list = []
    for user in users:
        wallet = user_wallet_service.get_by_user_id(user.id)
        user_list.append(
            {"id": user.id, 
            "email": user.email, 
            "created_at": user.created_at, 
            "balance": wallet.balance if wallet else 0,
            "group_id": user.group_id if user.group_id else "allow-all",
            })

    return ResponseUtils.success_page(data=user_list, total=total, page_num=page, page_size=page_size)

@router.post("/balance/recharge")
async def recharge_balance(
    request: Request,
    payment_service: PaymentService = Depends(get_payment_service),
):
    body = await request.body()
    body_str = body.decode('utf-8')
    timestamp=request.headers.get("x-xpack-timestamp")
    sign = request.headers.get("x-xpack-sign")
    # calculate md5 hash of the body and timestamp
    md5_hash = hashlib.md5(f"{timestamp}{body_str}".encode('utf-8')).hexdigest()
    calculated_sign = hashlib.sha256(md5_hash.encode('utf-8')).hexdigest()
    if sign != calculated_sign:
        return ResponseUtils.error(message="Invalid signature")
    try:
        body_str = body_str.replace("'", '"')  # Ensure JSON format
        body = json.loads(body_str)
    except json.JSONDecodeError:
        return ResponseUtils.error(message="Invalid JSON format")

    user_id = body.get("user_id")
    balance = body.get("balance")
    typ = body.get("type")
    transaction_id = hashlib.md5(f"{timestamp}{user_id}{balance}{typ}".encode('utf-8')).hexdigest()
    if payment_service.check_transaction_id_exists(transaction_id):
        return ResponseUtils.error(message="Transaction ID already exists")
    success = payment_service.platform_payment(user_id=user_id, amount=balance, typ=typ, transaction_id=transaction_id)
    if not success:
        return ResponseUtils.error(message="Failed to recharge wallet balance")
    return ResponseUtils.success(message="Wallet recharge successful")