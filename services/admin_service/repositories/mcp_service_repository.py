from datetime import datetime, timezone
from sqlalchemy.orm import Session
from services.common.models.mcp_service import McpService
from typing import Optional, Tuple, List


"""Repository for MCP services: CRUD, pagination, and public listing."""
class McpServiceRepository:
    """Data access layer for McpService model."""
    def __init__(self, db: Session):
        self.db = db

    def update_enabled(self, id: str, enabled: int) -> McpService:
        """Enable or disable a service by ID; raises if not found."""
        service = self.db.query(McpService).filter(McpService.id == id).first()
        if not service:
            raise ValueError("Service not found")
        service.enabled = enabled
        self.db.commit()
        self.db.refresh(service)
        return service

    def delete(self, id: str) -> Optional[McpService]:
        """Delete a service by ID; returns deleted entity or None."""
        service = self.db.query(McpService).filter(McpService.id == id).first()
        if not service:
            return None
        self.db.delete(service)
        self.db.commit()
        return service

    def update(self, mcp_service: McpService) -> McpService:
        """Update mutable fields for an existing service; returns refreshed entity."""
        existing_service = self.db.query(McpService).filter(McpService.id == mcp_service.id).first()
        if not existing_service:
            raise ValueError("Service not found")

        existing_service.name = mcp_service.name
        existing_service.slug_name = mcp_service.slug_name
        existing_service.short_description = mcp_service.short_description
        existing_service.long_description = mcp_service.long_description
        # existing_service.auth_method = mcp_service.auth_method
        existing_service.base_url = mcp_service.base_url
        # existing_service.auth_header = mcp_service.auth_header
        # existing_service.auth_token = mcp_service.auth_token
        existing_service.headers = mcp_service.headers
        existing_service.charge_type = mcp_service.charge_type
        existing_service.price = mcp_service.price

        self.db.commit()
        self.db.refresh(existing_service)
        return existing_service

    def get_by_id(self, id: str) -> Optional[McpService]:
        """Get a service by primary ID."""
        return self.db.query(McpService).filter(McpService.id == id).first()

    def get_by_slug_name(self, slug_name: str) -> Optional[McpService]:
        """Get a service by unique slug name."""
        return self.db.query(McpService).filter(McpService.slug_name == slug_name).first()

    def get_all(self) -> List[McpService]:
        """List all services ordered by creation time descending."""
        return self.db.query(McpService).order_by(McpService.created_at.desc()).all()

    def get_all_paginated(self, page: int = 1, page_size: int = 10) -> Tuple[List[McpService], int]:
        """Get service list with pagination"""
        offset = (page - 1) * page_size

        total = self.db.query(McpService).count()

        services = self.db.query(McpService).order_by(McpService.created_at.desc()).offset(offset).limit(page_size).all()

        return services, total

    def create(self, mcp_service: McpService) -> McpService:
        """Create a service; set timestamps if missing and persist."""
        # Set timestamps explicitly if not already set
        current_time = datetime.now(timezone.utc)
        if not hasattr(mcp_service, "created_at") or mcp_service.created_at is None:
            mcp_service.created_at = current_time
        if not hasattr(mcp_service, "updated_at") or mcp_service.updated_at is None:
            mcp_service.updated_at = current_time

        self.db.add(mcp_service)
        self.db.commit()
        self.db.refresh(mcp_service)
        return mcp_service

    def get_public_services_paginated(self, keyword: str, page: int = 1, page_size: int = 10) -> Tuple[List[McpService], int]:
        """Get public service list with pagination, supports keyword search"""
        offset = (page - 1) * page_size

        query = self.db.query(McpService).filter(McpService.enabled == 1)

        if keyword:
            keyword = f"%{keyword}%"
            query = query.filter((McpService.name.like(keyword)) | (McpService.short_description.like(keyword)))

        total = query.count()

        services = query.order_by(McpService.created_at.desc()).offset(offset).limit(page_size).all()

        return services, total
