from sqlalchemy import BigInteger, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from services.common.models.base import Base
from datetime import datetime


class SysConfig(Base):
    __tablename__ = "sys_config"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        autoincrement=False,
        comment="Primary key",
    )
    key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, comment="Configuration key")
    value: Mapped[str] = mapped_column(String, nullable=False, comment="Configuration value")
    description: Mapped[str] = mapped_column(String, nullable=False, comment="Configuration description")
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
