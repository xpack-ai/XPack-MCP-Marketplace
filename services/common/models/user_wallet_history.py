from sqlalchemy import String, Enum, Numeric, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from enum import Enum as PyEnum
from services.common.models.base import Base
from datetime import datetime

class PaymentMethod(PyEnum):
    PLATFORM = "platform"
    STRIPE = "stripe"
    ALIPAY = "alipay"
    WECHAT = "wechat"


class TransactionType(PyEnum):
    DEPOSIT = "deposit"
    CONSUME = "consume"
    REFUND = "refund"
    API_CALL = "api_call"
    RESET = "reset"


class UserWalletHistory(Base):
    __tablename__ = "user_wallet_history"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        autoincrement=False,
        comment="Primary key",
    )
    user_id: Mapped[str] = mapped_column(
        String(36), nullable=False, comment="User unique ID (UUID format)"
    )
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        comment="Payment method: platform, stripe, alipay, wechat",
    )
    amount: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False, comment="Transaction amount (positive for deposit, negative for consumption, 2 decimal places)"
    )
    balance_after: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False, comment="Balance after transaction (2 decimal places)"
    )
    type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        comment="Transaction type: deposit, consume, refund",
    )
    status: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="Order status: 0=new, 1=completed, 2=pending"
    )
    transaction_id: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=True, comment="Payment platform transaction ID"
    )
    channel_user_id: Mapped[str] = mapped_column(
        String(255), nullable=True, comment="Payment channel user ID"
    )
    callback_data: Mapped[str] = mapped_column(
        String, nullable=True, comment="Payment callback information"
    )
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