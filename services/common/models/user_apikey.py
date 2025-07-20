from sqlalchemy import String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from services.common.models.base import Base
from datetime import datetime


class UserApiKey(Base):
    __tablename__ = "user_apikey"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, autoincrement=False, comment="Primary key")
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, comment="User ID")
    name: Mapped[str] = mapped_column(String(255), nullable=False, comment="Name")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="Description")
    apikey: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, comment="API key")
    expire_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment="Expiration time")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        comment="Creation timestamp",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        server_onupdate=func.current_timestamp(),
        comment="Last update timestamp",
    )
