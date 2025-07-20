"""
User wallet repository class - used in API service
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from services.common.models.user_wallet import UserWallet


class UserWalletRepository:
    """User wallet repository class"""
    
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str) -> UserWallet:
        """
        Create user wallet
        
        Args:
            user_id: User ID
            
        Returns:
            UserWallet: Created wallet instance
        """
        wallet = UserWallet(
            id=str(uuid.uuid4()),
            user_id=user_id,
            balance=0.0,
            frozen_balance=0.0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        self.db.add(wallet)
        self.db.commit()
        self.db.refresh(wallet)
        return wallet

    def get_by_user_id(self, user_id: str) -> Optional[UserWallet]:
        """
        Get wallet by user ID
        
        Args:
            user_id: User ID
            
        Returns:
            Optional[UserWallet]: Wallet instance, returns None if not exists
        """
        return self.db.query(UserWallet).filter(UserWallet.user_id == user_id).first()

    def update_balance(self, user_id: str, new_balance: float) -> bool:
        """
        Update user balance
        
        Args:
            user_id: User ID
            new_balance: New balance
            
        Returns:
            bool: Whether update succeeded
        """
        wallet = self.get_by_user_id(user_id)
        if wallet:
            wallet.balance = new_balance
            # updated_at field is automatically updated by database, no manual setting needed
            self.db.commit()
            return True
        return False
