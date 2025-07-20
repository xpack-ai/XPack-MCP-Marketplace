from sqlalchemy import String, Text, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from services.common.models.base import Base
from datetime import datetime


class PaymentChannel(Base):
    __tablename__ = "payment_channel"
    """
    CREATE TABLE `payment_channel` (
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    """
    id: Mapped[str] = mapped_column(String(36), primary_key=True, autoincrement=False, comment="Primary key")
    name: Mapped[str] = mapped_column(String(255), nullable=False, comment="Channel name")
    status: Mapped[int] = mapped_column(Integer, nullable=False, comment="Channel status, 0: disabled, 1: enabled")
    config: Mapped[str] = mapped_column(Text, nullable=True, comment="Channel config")
    update_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment="Update time")
