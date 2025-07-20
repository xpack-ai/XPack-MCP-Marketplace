from sqlalchemy.orm import Session
from typing import Optional
from services.common.database import SessionLocal
from services.common.models.user_wallet import UserWallet

from services.admin_service.repositories.user_wallet_repository import UserWalletRepository

class UserWalletService:
    def __init__(self, db: Session = SessionLocal()):
        self.user_wallet_repository = UserWalletRepository(db)
    
    def get_by_user_id(self, user_id: str) -> Optional[UserWallet]:
        """Get user wallet info by user ID"""
        return self.user_wallet_repository.get_by_user_id(user_id)