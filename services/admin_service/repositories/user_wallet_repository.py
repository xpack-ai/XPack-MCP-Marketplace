import uuid
import secrets
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.common.models.user_wallet import UserWallet


class UserWalletRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str) -> UserWallet:
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
        return self.db.query(UserWallet).filter(UserWallet.user_id == user_id).first()

    def get_by_user_id_with_lock(self, user_id: str) -> Optional[UserWallet]:
        """Get user wallet with row-level lock for update"""
        return self.db.query(UserWallet).filter(UserWallet.user_id == user_id).with_for_update().first()

    def update_balance(self, user_id: str, new_balance: float) -> bool:
        """Update user balance"""
        wallet = self.get_by_user_id(user_id)
        if wallet:
            wallet.balance = new_balance
            wallet.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            return True
        return False

    def update_balance_atomic(self, user_id: str, new_balance: float, expected_balance: float) -> bool:
        """
        Atomically update user balance with optimistic locking.
        
        Args:
            user_id: User ID
            new_balance: New balance to set
            expected_balance: Expected current balance (for optimistic locking)
            
        Returns:
            bool: True if update successful, False if balance was modified by another transaction
        """
        try:
            # Use ORM update with WHERE condition for optimistic locking
            updated_rows = self.db.query(UserWallet).filter(
                UserWallet.user_id == user_id,
                UserWallet.balance == expected_balance
            ).update({
                "balance": new_balance,
                "updated_at": datetime.now(timezone.utc)
            }, synchronize_session=False)
            
            # Commit the transaction and check if any row was updated
            self.db.commit()
            return updated_rows > 0
            
        except Exception as e:
            self.db.rollback()
            raise e
