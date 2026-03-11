
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from services.common.models.base import Base
from datetime import datetime


class StatsMcpServiceDate(Base):
    __tablename__ = "stats_mcp_service_date"
    stats_date: Mapped[datetime] = mapped_column(
        DateTime,
        primary_key=True,
        nullable=False,
        comment="统计时间（精确到小时，UTC）",
    )

    service_id: Mapped[str] = mapped_column(
        String(100),
        primary_key=True,
        nullable=False,
        comment="服务ID",
    )

    call_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="调用次数",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        comment="创建时间",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        server_onupdate=func.current_timestamp(),
        comment="更新时间",
    )
    