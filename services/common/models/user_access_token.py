from sqlalchemy import String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from services.common.models.base import Base
from datetime import datetime


class UserAccessToken(Base):
    __tablename__ = "user_access_token"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        autoincrement=False,
        comment="Primary key",
    )
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, comment="User unique ID (UUID format)")
    token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, comment="Access token")
    expire_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, comment="Token expiration timestamp")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        comment="Creation timestamp",
    )
