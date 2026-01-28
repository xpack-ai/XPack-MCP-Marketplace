from sqlalchemy.orm import Session
from services.common.models.user_wallet_history import UserWalletHistory

from services.admin_service.repositories.user_wallet_history_repository import UserWalletHistoryRepository
from services.admin_service.repositories.user_repository import UserRepository


from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime
from services.common.models.user_wallet_history import TransactionType
from services.admin_service.repositories.mcp_service_repository import McpServiceRepository
import json



class UserWalletHistoryService:
    def __init__(self, db: Session):
        self.user_wallet_history_repository = UserWalletHistoryRepository(db)
        self.user_repository = UserRepository(db)
        self.mcp_service_repository = McpServiceRepository(db)

    def add_deposit(self, user_id: str, amount: float, payment_method: str) -> UserWalletHistory:
        return self.user_wallet_history_repository.add_deposit(user_id, amount, payment_method)

    def add_refund(self, user_id: str, amount: float, payment_method: str, transaction_id: str) -> UserWalletHistory:
        return self.user_wallet_history_repository.add_refund(user_id, amount, payment_method, transaction_id)

    def success_deposit_order_list(self, offset: int, limit: int, keyword: Optional[str] = None, sort_amount: Optional[str] = "desc", filter_payment_type: Optional[list] = None) -> Tuple[int, List[UserWalletHistory]]:
        userIds = None
        if keyword:
            
            users = self.user_repository.get_all_user(keyword, include_deleted=True)
            userIds = [user.id for user in users]
            print(f"users,{userIds},keyword:{keyword}")
            if len(userIds) == 0:
                return 0, []
        return self.user_wallet_history_repository.success_deposit_order_list(offset, limit, userIds, sort_amount, filter_payment_type)

    def success_order_list_by_user(self, user_id: str, offset: int, limit: int, order_type: Optional[List[str]] = None, status: Optional[List[int]] = None) -> Tuple[int, List[dict]]:         
        total, orders = self.user_wallet_history_repository.success_order_list_by_user(user_id, offset, limit, order_type, status)
        if total == 0:
            return total, []
        result = []
        for order in orders:
            confirm_at = ""
            if order.status == 1:
                confirm_at = order.updated_at
            info = {
                "id": order.id,
                "user_id": order.user_id,
                "order_id": order.transaction_id,
                "payment_type": order.payment_method,
                "payment_state": order.status,
                "amount": order.amount,
                "create_at": order.created_at,
                "confirm_at": confirm_at,
            }
            if order.type == TransactionType.API_CALL:
                info["order_type"] = "purchase"
                try:
                    callback_data = json.loads(order.callback_data)
                    service = self.mcp_service_repository.get_by_id(callback_data["service_id"])
                    if service:
                        info["description"] = service.name
                except:
                    info["description"] = "-"
                info["balance"] = order.balance_after
            elif order.type == TransactionType.DEPOSIT:
                info["order_type"] = "recharge"
                if order.status == 1:
                    info["balance"] = order.balance_after
                else:
                    info["balance"] = "-"
                info["description"] = order.payment_method
            else:
                info["order_type"] = order.type
            result.append(info)
        return total, result
        return total, orders

    def order_list(self, payment_method: str, status: int, start: Optional[datetime] = None, end: Optional[datetime] = None) -> List[UserWalletHistory]:
        return self.user_wallet_history_repository.order_list(payment_method, status, start, end)

    def get_order_by_id(self, order_id: str) -> Optional[UserWalletHistory]:
        return self.user_wallet_history_repository.get_by_id(order_id)

    def check_order_complete(self, order_id: str) -> bool:
        user_wallet_history = self.user_wallet_history_repository.get_by_id(order_id)
        if user_wallet_history:
            return user_wallet_history.status == 1
        return False
