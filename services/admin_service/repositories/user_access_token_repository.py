import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from services.common.models.user_access_token import UserAccessToken


"""Repository for user access tokens: create and revoke by token."""
class UserAccessTokenRepository:
    """Data access layer for UserAccessToken model."""
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str) -> UserAccessToken:
        """Create a new access token for the user, expiring in 30 days."""
        user_access_token = UserAccessToken(
            id=str(uuid.uuid4()), user_id=user_id, token=str(uuid.uuid4()), expire_at=datetime.now(timezone.utc) + timedelta(days=30)
        )

        self.db.add(user_access_token)
        self.db.commit()
        self.db.refresh(user_access_token)
        return user_access_token

    def delete_by_token(self, token: str) -> None:
        """Revoke an access token by its token string."""
        user_access_token = self.db.query(UserAccessToken).filter(UserAccessToken.token == token).first()
        if user_access_token:
            self.db.delete(user_access_token)
            self.db.commit()
