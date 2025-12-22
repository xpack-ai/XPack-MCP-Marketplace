from sqlalchemy import String, Integer, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from services.common.models.base import Base


class ResourceGroup(Base):
    __tablename__ = "resource_group"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        autoincrement=False,
        comment="Primary key, group UUID",
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, comment="Group name")
    description: Mapped[str] = mapped_column(String, nullable=True, comment="Group description")
    enabled: Mapped[int] = mapped_column(Integer, nullable=False, default=1, comment="Group status: 0=disabled, 1=enabled")
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


class ResourceGroupServiceMap(Base):
    __tablename__ = "resource_group_service_map"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="Primary key")
    group_id: Mapped[str] = mapped_column(String(36), nullable=False, comment="Resource group UUID")
    service_id: Mapped[str] = mapped_column(String(36), nullable=False, comment="MCP service UUID")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        comment="Creation timestamp",
    )

    __table_args__ = (
        UniqueConstraint("group_id", "service_id", name="uq_group_service"),
    )

