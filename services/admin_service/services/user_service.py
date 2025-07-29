from sqlalchemy.orm import Session
from typing import Optional, Tuple, List
from services.common.models.user import User
from services.common.database import SessionLocal

from services.admin_service.repositories.user_repository import UserRepository
from services.admin_service.repositories.user_wallet_repository import UserWalletRepository


class UserService:
    def __init__(self, db: Session = SessionLocal()):
        self.user_repository = UserRepository(db)
        self.user_wallet_repository = UserWalletRepository(db)

    def get_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.user_repository.get_by_id(user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.user_repository.get_by_email(email)

    def create(self, email: str, register_type: str, role_id: int = 2) -> Optional[User]:
        """Create new user"""
        user = self.user_repository.create(email=email, register_type=register_type, role_id=role_id)
        if user:
            self.user_wallet_repository.create(user_id=user.id)
            return user
        return None

    def delete(self, user_id: str) -> Optional[User]:
        """Delete user"""
        return self.user_repository.delete(user_id)

    def get_user_list(self, offset: int, limit: int) -> Tuple[int, List[User]]:
        """Get user list"""
        return self.user_repository.get_user_list(offset, limit)

    def get_admin_user(self) -> Optional[User]:
        """Get admin user"""
        return self.user_repository.get_admin_user()

    def update_admin(self, name: str, password: str) -> Optional[User]:
        """Update admin user info"""
        return self.user_repository.update_admin_user(name=name, password=password)
