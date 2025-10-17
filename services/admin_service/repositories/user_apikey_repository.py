"""Repository for managing user API keys: create, update, delete, list."""
import uuid
import secrets
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from services.common.models.user_apikey import UserApiKey
from typing import Optional, List


class UserApiKeyRepository:
    """Repository for generating and managing user API keys."""
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, name: str, description: str) -> UserApiKey:
        """Create a new API key for the user with generated token."""
        now = datetime.now(timezone.utc)
        apikey = secrets.token_urlsafe(32)
        user_apikey = UserApiKey(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=name,
            description=description,
            apikey=apikey,
            expire_at=None,
            created_at=now,
            updated_at=now,
        )
        self.db.add(user_apikey)
        self.db.commit()
        self.db.refresh(user_apikey)
        return user_apikey

    def update(self, id: str, name: Optional[str] = None, description: Optional[str] = None, expire_at: Optional[datetime] = None) -> UserApiKey:
        """Update metadata for an existing API key (name, description, expiration)."""
        user_apikey = self.db.query(UserApiKey).filter(UserApiKey.id == id).first()
        if not user_apikey:
            raise ValueError("API key not found or does not belong to the user")

        if name is not None:
            user_apikey.name = name
        if description is not None:
            user_apikey.description = description
        if expire_at is not None:
            user_apikey.expire_at = expire_at
        user_apikey.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(user_apikey)
        return user_apikey

    def delete(self, id: str) -> None:
        """Delete API key by primary ID."""
        user_apikey = self.db.query(UserApiKey).filter(UserApiKey.id == id).first()
        if not user_apikey:
            raise ValueError("API key not found or does not belong to the user")

        self.db.delete(user_apikey)
        self.db.commit()

    def get_by_user_id(self, user_id: str) -> List[UserApiKey]:
        """List API keys belonging to the specified user."""
        return self.db.query(UserApiKey).filter(UserApiKey.user_id == user_id).all()
    
    def get_by_id(self, id: str) -> Optional[UserApiKey]:
        """Get API key by primary ID."""
        return self.db.query(UserApiKey).filter(UserApiKey.id == id).first()
