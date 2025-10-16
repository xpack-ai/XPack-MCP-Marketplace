from sqlalchemy.orm import Session
from typing import Optional, List
from services.common.database import SessionLocal
from datetime import datetime

from services.common.models.user import User

from services.admin_service.repositories.user_repository import UserRepository
from services.admin_service.repositories.user_wallet_repository import UserWalletRepository

class StatsService:
    def __init__(self, db: Session = SessionLocal()):
        self.user_repository = UserRepository(db)
        self.user_wallet_repository = UserWalletRepository(db)

    def get_total_registered_users(self) -> int:
        """
        Get total number of registered users

        Returns:
            int: Total number of registered users
        """
        return self.user_repository.get_registered_user_count()
    
    def get_today_registered_user_count(self) -> int:
        """
        Get today number of registered users

        Returns:
            int: Today number of registered users
        """
        return self.user_repository.get_registered_user_count(datetime.now())

    def get_registered_user_count_by_day(self, start_at: Optional[datetime] = None, end_at: Optional[datetime] = None) -> List[dict]:
        """
        Get registered user count by day

        Args:
            start_at (Optional[datetime], optional): Start time. Defaults to None.
            end_at (Optional[datetime], optional): End time. Defaults to None.

        Returns:
            List[dict]: List of registered user count by day
        """
        return self.user_repository.get_registered_user_trend(start_at, end_at)
    
