from sqlalchemy.orm import Session
from sqlalchemy import func, literal_column
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, List
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

    def get_user_list(self, offset: int, limit: int) -> Tuple[int, List[User]]:
        total = self.db.query(User).filter(User.is_deleted == 0, User.role_id == 2).count()

        users = self.db.query(User).filter(User.is_deleted == 0, User.role_id == 2).offset(offset).limit(limit).all()
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
    
    def get_registered_user_count(self, start_at: Optional[datetime] = None, end_at: Optional[datetime] = None) -> int:
        """
        Get total number of registered users

        Args:
            start_at (Optional[datetime], optional): Start time. Defaults to None.
            end_at (Optional[datetime], optional): End time. Defaults to None.

        Returns:
            int: Total number of registered users
        """
        query = self.db.query(User).filter(User.role_id == 2)

        # Apply server timezone when filtering by time range
        offset_td = datetime.now().astimezone().utcoffset() or timedelta(0)
        offset_minutes = int(offset_td.total_seconds() // 60)
        local_dt = func.timestampadd(literal_column('MINUTE'), offset_minutes, User.created_at)

        if start_at:
            start_local = start_at.astimezone().replace(tzinfo=None) if start_at.tzinfo is not None else start_at
            query = query.filter(local_dt >= start_local)
        if end_at:
            end_local = end_at.astimezone().replace(tzinfo=None) if end_at.tzinfo is not None else end_at
            query = query.filter(local_dt <= end_local)
        return query.count()
    
    def get_registered_user_trend(self, start_at: Optional[datetime] = None, end_at: Optional[datetime] = None) -> list:
        """
        Get registered user trend by day

        Args:
            start_at (Optional[datetime], optional): Start time. Defaults to None.
            end_at (Optional[datetime], optional): End time. Defaults to None.

        Returns:
            list: Registered user trend by day
        """
        # Group by server-local day: shift UTC created_at by server TZ offset, then take DATE
        offset_td = datetime.now().astimezone().utcoffset() or timedelta(0)
        offset_minutes = int(offset_td.total_seconds() // 60)
        local_dt = func.timestampadd(literal_column('MINUTE'), offset_minutes, User.created_at)
        day_col = func.date(local_dt)
        query = (
            self.db.query(
                day_col.label("stats_day"),
                func.count(User.id).label("registered_count"),
            )
            .filter(User.role_id == 2)
        )

        if start_at is not None:
            query = query.filter(User.created_at >= start_at)
        if end_at is not None:
            query = query.filter(User.created_at <= end_at)

        rows = query.group_by(day_col).order_by(day_col.asc()).all()
        return [{"stats_day": row.stats_day, "count": int(row.registered_count or 0)} for row in rows]
        