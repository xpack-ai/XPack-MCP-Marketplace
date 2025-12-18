from sqlalchemy.orm import Session
from sqlalchemy import func, literal_column
from datetime import datetime, timezone, timedelta, date
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
        user.updated_at = datetime.now(timezone.utc)
        user.password = password
        self.db.commit()
        self.db.refresh(user)
        return user

    def create(self, email: str, register_type: str, role_id: int = 2, group_id: str = "", password: Optional[str] = None) -> Optional[User]:
        from uuid import uuid4
        from services.common.models.user import RegisterType

        name = email.split("@")[0] if "@" in email else email
        now = datetime.now(timezone.utc)
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
            group_id=group_id,
            created_at=now,
            updated_at=now
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

        users = self.db.query(User).filter(User.is_deleted == 0, User.role_id == 2).order_by(User.created_at.desc()).offset(offset).limit(limit).all()
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

        # Apply range filters using server-local time for consistency with grouping
        if start_at is not None:
            start_local = start_at.astimezone().replace(tzinfo=None) if start_at.tzinfo is not None else start_at
            query = query.filter(local_dt >= start_local)
        if end_at is not None:
            end_local = end_at.astimezone().replace(tzinfo=None) if end_at.tzinfo is not None else end_at
            query = query.filter(local_dt <= end_local)

        rows = query.group_by(day_col).order_by(day_col.asc()).all()

        # Build a mapping for existing days
        counts_by_day = {row.stats_day: int(row.registered_count or 0) for row in rows}

        # Determine start and end days (server-local date)
        if start_at is not None:
            start_day = (start_at.astimezone().date() if start_at.tzinfo is not None else start_at.date())
        else:
            start_day = rows[0].stats_day if rows else None

        if end_at is not None:
            end_day = (end_at.astimezone().date() if end_at.tzinfo is not None else end_at.date())
        else:
            end_day = rows[-1].stats_day if rows else start_day

        # If no data and no explicit range, return empty
        if start_day is None or end_day is None:
            return []

        # Generate continuous date sequence with zero-fill
        result = []
        current_day = start_day
        while current_day <= end_day:
            result.append({"stats_day": current_day, "count": counts_by_day.get(current_day, 0)})
            current_day += timedelta(days=1)
        return result
        
    def update_resource_group(self, user_id: str, group_id: str) -> Optional[User]:
        """Update user resource group"""
        user = self.db.query(User).filter(User.id == user_id, User.is_deleted == 0).first()
        if not user:
            return None
        user.group_id = group_id
        self.db.commit()
        self.db.refresh(user)
        return user
    def update_resource_group_by_group_id(self, group_id: str, new_group_id: str, commit: bool = True) -> List[User]:
        """Update user resource group"""
        users = self.db.query(User).filter(User.group_id == group_id, User.is_deleted == 0).all()
        if not users:
            return []
        for user in users:
            user.group_id = new_group_id    
        if commit:
            self.db.commit()
        return users