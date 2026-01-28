from os import stat
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from services.common.models.user_wallet_history import TransactionType
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
    keyword: str = Query("", description="Search keyword for user email or name"),
    sort_amount: str = Query("desc", description="Sort amount by desc or asc"),
    filter_payment_type: str = Query("", description="Filter payment type"),
    user_service: UserService = Depends(get_user_service),
    user_wallet_history_service: UserWalletHistoryService = Depends(get_user_wallet_history_service),
):
    """Get paginated list of user order history."""
    offset = (page - 1) * page_size
    if filter_payment_type:
        filter_payment_type_list = filter_payment_type.split(",")
    else:
        filter_payment_type_list = None
    total, orders = user_wallet_history_service.success_deposit_order_list(offset, page_size, keyword, sort_amount, filter_payment_type_list)
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

@router.get("/list/by_user", summary="Get user order list by user id")
def get_user_order_list_by_user_id(
    user_id: str = Query(..., description="User ID"),
    page: int = Query(1, description="Current page number"),
    page_size: int = Query(15, description="Number of items per page"),
    order_type: Optional[str] = Query(None, description="Order type"),
    status: Optional[str] = Query(None, description="Order status"),
    user_service: UserService = Depends(get_user_service),
    user_wallet_history_service: UserWalletHistoryService = Depends(get_user_wallet_history_service),
):
    """Get paginated list of user order history by user id."""
    user = user_service.get_by_id(user_id)
    if not user:
        return ResponseUtils.error(message="not found user", code=404)
    offset = (page - 1) * page_size
    order_type_list = []
    if order_type:
        # 将字符串转成列表，中间使用逗号分隔
        ots = order_type.split(",")
        for ot in ots:
            ot = ot.strip()
            if ot == "purchase":
                order_type_list.append("api_call")
            elif ot == "recharge":
                order_type_list.append("deposit")
            else:
                order_type_list.append(ot)
    status_list: Optional[List[int]] = []
    if status:
        sl = status.split(",")
        for s in sl:
            status_list.append(int(s.strip()))
    total, orders = user_wallet_history_service.success_order_list_by_user(user_id, offset, page_size, order_type_list, status_list)
    
    return ResponseUtils.success_page(data=orders, total=total, page_num=page, page_size=page_size)