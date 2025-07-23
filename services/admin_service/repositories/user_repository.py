from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
from services.common.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_account(self, name: str) -> Optional[User]:
        return self.db.query(User).filter(User.name == name).first()
    def update_password(self,user_id:str, password:str) -> Optional[User]:
        user = self.get_by_id(user_id)
        if not user:
            return None
        user.password = password
        self.db.commit()
        self.db.refresh(user)
        return user

    def create(self, email: str, register_type: str, role_id: int = 2, password: Optional[str] = None) -> Optional[User]:
        from uuid import uuid4
        from services.common.models.user import RegisterType

        name = email.split("@")[0] if "@" in email else email

        user = User(
            id=str(uuid4()),
            name=name,
            email=email,
            password=password,
            avatar=None,
            is_active=1,
            is_deleted=0,
            register_type=RegisterType(register_type),
            role_id=role_id,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def create_google_user(self, email: str, name: str, google_id: str, role_id: int = 2) -> Optional[User]:
        from uuid import uuid4
        from services.common.models.user import RegisterType

        user = User(
            id=str(uuid4()),
            name=name,
            email=email,
            avatar=None,
            is_active=1,
            is_deleted=0,
            register_type=RegisterType.GOOGLE,
            role_id=role_id,
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user_id: str) -> Optional[User]:
        user = self.get_by_id(user_id)
        if not user:
            return None
        user.is_deleted = 1
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_list(self, offset: int, limit: int) -> tuple[int, list[User]]:
        total = self.db.query(User).filter(User.is_deleted == 0 and User.role_id == 2).count()

        users = self.db.query(User).filter(User.is_deleted == 0 and User.role_id == 2).offset(offset).limit(limit).all()
        return total, users

    def get_admin_user(self) -> Optional[User]:
        return self.db.query(User).filter(User.role_id == 1, User.is_deleted == 0).first()

    def update_admin_user(self, name: Optional[str], password: Optional[str]) -> Optional[User]:
        admin_user = self.get_admin_user()
        if not admin_user:
            return None
        if name:
            admin_user.name = name
        if password:
            admin_user.password = password
        self.db.commit()
        self.db.refresh(admin_user)
        return admin_user
