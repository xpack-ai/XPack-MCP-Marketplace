from sqlalchemy import String, Enum, Numeric, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from services.common.models.base import Base,ChargeType


class McpService(Base):
    __tablename__ = "mcp_service"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        autoincrement=False,
        comment="Primary key",
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, comment="Service name")
    slug_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, comment="Unique slug name for the service")
    short_description: Mapped[str] = mapped_column(String, nullable=False, comment="Short description of the service")
    long_description: Mapped[str] = mapped_column(String, nullable=True, comment="Detailed description of the service (Markdown format)")
    base_url: Mapped[str] = mapped_column(String(512), nullable=True, comment="api url")
    headers: Mapped[str] = mapped_column(String, nullable=True, comment="Additional headers for requests (JSON Array format)")
    charge_type: Mapped[ChargeType] = mapped_column(
        Enum(ChargeType, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        comment="Charge type: free, per_call, per_token",
    )
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True, comment="Service price (2 decimal places)")
    input_token_price: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=True, comment="Input token price (2 decimal places, for per_token charge type)"
    )
    output_token_price: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=True, comment="Output token price (2 decimal places, for per_token charge type)"
    )
    enabled: Mapped[int] = mapped_column(Integer, nullable=True, comment="Service status: 0=disabled, 1=enabled")
    tags: Mapped[str] = mapped_column(String, nullable=True, comment="Tags")
    service_type: Mapped[str] = mapped_column(String(255), nullable=True, comment="Service type",default="openapi")
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

class DropMCPService(Base):
    __tablename__ = "drop_mcp_service"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        autoincrement=False,
        comment="Primary key, service UUID",
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, comment="Service name")
    slug_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, comment="Unique service identifier (slug format)")
    short_description: Mapped[str] = mapped_column(String, nullable=False, comment="Brief service description")
    long_description: Mapped[str] = mapped_column(String, nullable=True, comment="Detailed service description (Markdown)")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
        server_default=func.current_timestamp(),
        server_onupdate=func.current_timestamp(),
        comment="Last update timestamp",
    )