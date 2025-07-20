from fastapi import APIRouter, Depends, Query
from sqlalchemy import table
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.admin_service.services.user_service import UserService
from services.admin_service.services.user_wallet_history_service import UserWalletHistoryService

router = APIRouter()


def get_user_wallet_history_service(db: Session = Depends(get_db)) -> UserWalletHistoryService:
    return UserWalletHistoryService(db)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.get("/list", summary="Get user order list")
def get_user_order_list(
    page: int = Query(1, description="Current page number"),
    page_size: int = Query(15, description="Number of items per page"),
    user_service: UserService = Depends(get_user_service),
    user_wallet_history_service: UserWalletHistoryService = Depends(get_user_wallet_history_service),
):
    """Get paginated list of user order history."""
    offset = (page - 1) * page_size
    total, orders = user_wallet_history_service.success_order_list(offset, page_size)
    if not orders:
        return ResponseUtils.success_page(data=[], total=total, page_num=page, page_size=page_size)
    result = []
    for order in orders:
        user = user_service.get_by_id(order.user_id)
        if not user:
            continue
        confirm_at = ""
        if order.status == 1:
            confirm_at = order.updated_at
        result.append(
            {
                "id": order.id,
                "user_id": order.user_id,
                "email": user.email,
                "order_id": order.transaction_id,
                "payment_type": order.payment_method,
                "payment_state": order.status,
                "amount": order.amount,
                "create_at": order.created_at,
                "confirm_at": confirm_at,
            }
        )

    return ResponseUtils.success_page(data=result, total=total, page_num=page, page_size=page_size)
