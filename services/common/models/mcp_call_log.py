""" """

from sqlalchemy import String, Text, Boolean, Numeric, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from enum import Enum as PyEnum
from services.common.models.base import Base
from datetime import datetime


class ProcessStatus(PyEnum):
    PENDING = "pending"
    PROCESSED = "processed"
    FAILED = "failed"


class McpCallLog(Base):
    __tablename__ = "mcp_call_log"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        autoincrement=False,
        comment="UUID primary key",
    )
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, comment="User ID")
    service_id: Mapped[str] = mapped_column(String(36), nullable=False, comment="MCP service ID")
    api_id: Mapped[str] = mapped_column(String(100), nullable=False, comment="API tool ID")
    tool_name: Mapped[str] = mapped_column(String(200), nullable=False, comment="Tool name")
    input_params: Mapped[str] = mapped_column(Text, nullable=True, comment="Call parameters")
    apikey_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="API key ID")
    call_success: Mapped[int] = mapped_column(Boolean, nullable=False, comment="Call success status")
    unit_price: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False, comment="Unit price per call")
    actual_cost: Mapped[float] = mapped_column(Numeric(10, 4), nullable=True, default=0.0000, comment="Actual charged amount")
    call_start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False, comment="Call start time")
    call_end_time: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment="Call end time")
    process_status: Mapped[ProcessStatus] = mapped_column(
        Enum(ProcessStatus, values_callable=lambda obj: [e.value for e in obj]),
        nullable=True,
        default=ProcessStatus.PENDING,
        comment="Process status: pending, processed, failed",
    )
    error_msg: Mapped[str] = mapped_column(Text, nullable=True, comment="Error message")
    wallet_history_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="Associated wallet history record ID")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        comment="Creation time",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        server_onupdate=func.current_timestamp(),
        comment="Update time",
    )
