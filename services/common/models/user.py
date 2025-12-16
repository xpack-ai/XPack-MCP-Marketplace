from sqlalchemy import Column, Integer, String, Enum, DateTime
from datetime import datetime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from enum import Enum as PyEnum
from services.common.models.base import Base


class RegisterType(PyEnum):
    GOOGLE = "google"
    EMAIL = "email"
    INNER = "inner"


class User(Base):
    __tablename__ = "user"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        autoincrement=False,
        comment="Primary key, auto-incremented ID",
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="Username")
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, comment="Email address")
    password: Mapped[str] = mapped_column(String(255), nullable=True, comment="Password hash")
    avatar: Mapped[str] = mapped_column(String(255), comment="Avatar URL")
    is_active: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=True,
        comment="Account status: 0=disabled, 1=active",
    )
    is_deleted: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=False,
        comment="Soft delete flag: 0=active, 1=deleted",
    )
    register_type: Mapped[RegisterType] = mapped_column(
        Enum(RegisterType, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        comment="Registration method"
    )
    role_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=False,
        comment="1: admin, 2: user",
    )
    group_id: Mapped[str] = mapped_column(
        String(36),
        nullable=True,
        default="",
        comment="Group ID",
    )
    last_login_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        comment="last login timestamp",
    )
    last_login_ip = Column(String(45), comment="Last login IP (IPv4/IPv6 compatible)")
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
