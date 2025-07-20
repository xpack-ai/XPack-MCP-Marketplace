from sqlalchemy import String, Numeric, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from services.common.models.base import Base
from datetime import datetime


class UserWallet(Base):
    __tablename__ = "user_wallet"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        autoincrement=False,
        comment="Primary key, auto-incremented ID",
    )
    user_id: Mapped[str] = mapped_column(String(36), unique=True, nullable=False, comment="User unique ID (UUID format)")
    balance: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, comment="Wallet balance (2 decimal places)")
    frozen_balance: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, comment="Frozen balance (2 decimal places)")
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
