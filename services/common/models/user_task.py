from sqlalchemy import BigInteger, String, DateTime, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from services.common.models.base import Base
from datetime import datetime


class UserTask(Base):
    __tablename__ = "onboarding_task"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
        comment="Primary key",
    )
    task_id: Mapped[str] = mapped_column(String(100), nullable=False, comment="Task ID")
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, comment="User ID")
    task_status: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="Task status, 0: not completed, 1: completed"
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
