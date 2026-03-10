from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session
from services.common.models.mcp_service import McpService
from typing import Optional, Tuple, List


"""Repository for MCP services: CRUD, pagination, and public listing."""
class McpServiceRepository:
    """Data access layer for McpService model."""
    def __init__(self, db: Session):
        self.db = db

    def update_enabled(self, id: str, enabled: int, tenant_id: Optional[str] = None) -> McpService:
        """Enable or disable a service by ID; raises if not found."""
        query = self.db.query(McpService).filter(McpService.id == id)
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)
        service = query.first()
        if not service:
            raise ValueError("Service not found")
        service.enabled = enabled
        self.db.commit()
        self.db.refresh(service)
        return service

    def delete(self, id: str, tenant_id: Optional[str] = None) -> Optional[McpService]:
        """Delete a service by ID; returns deleted entity or None."""
        query = self.db.query(McpService).filter(McpService.id == id)
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)
        service = query.first()
        if not service:
            return None
        self.db.delete(service)
        self.db.commit()
        return service

    def update(self, mcp_service: McpService, tenant_id: Optional[str] = None) -> McpService:
        """Update mutable fields for an existing service; returns refreshed entity."""
        query = self.db.query(McpService).filter(McpService.id == mcp_service.id)
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)
        existing_service = query.first()
        if not existing_service:
            raise ValueError("Service not found")

        existing_service.name = mcp_service.name
        existing_service.slug_name = mcp_service.slug_name
        existing_service.short_description = mcp_service.short_description
        existing_service.long_description = mcp_service.long_description
        existing_service.base_url = mcp_service.base_url
        existing_service.headers = mcp_service.headers
        existing_service.charge_type = mcp_service.charge_type
        existing_service.price = mcp_service.price

        self.db.commit()
        self.db.refresh(existing_service)
        return existing_service

    def get_by_id(self, id: str, tenant_id: Optional[str] = None) -> Optional[McpService]:
        """Get a service by primary ID."""
        query = self.db.query(McpService).filter(McpService.id == id)
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)
        return query.first()

    def get_by_ids(self, ids: List[str], tenant_id: Optional[str] = None) -> List[McpService]:
        """Get services by primary IDs."""
        query = self.db.query(McpService).filter(McpService.id.in_(ids))
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)
        return query.all()

    def get_by_slug_name(self, slug_name: str, tenant_id: Optional[str] = None) -> Optional[McpService]:
        """Get a service by unique slug name."""
        query = self.db.query(McpService).filter(McpService.slug_name == slug_name)
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)
        return query.first()           

    def get_all(self, tenant_id: Optional[str] = None, keyword: Optional[str] = None) -> List[McpService]:
        """List all services ordered by creation time descending."""
        query = self.db.query(McpService)
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)
        if keyword:
            keyword = f"%{keyword}%"
            query = query.filter((McpService.name.like(keyword)) | (McpService.short_description.like(keyword)))
        return query.order_by(McpService.created_at.desc()).all()

    def get_all_paginated(self, tenant_id: Optional[str] = None, page: int = 1, page_size: int = 10, keyword: Optional[str] = None,filter_status: Optional[list] = None) -> Tuple[List[McpService], int]:
        """Get service list with pagination"""
        offset = (page - 1) * page_size

        query = self.db.query(McpService)
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)
        if keyword:
            keyword = f"%{keyword}%"
            query = query.filter((McpService.name.like(keyword)) | (McpService.short_description.like(keyword)))
        if filter_status:
            query = query.filter(McpService.enabled.in_(filter_status))
        total = query.count()
        query = query.order_by(McpService.created_at.desc()).offset(offset).limit(page_size)
        
        services = query.all()

        return services, total

    def get_all_not_include(self, ids: List[str], tenant_id: Optional[str] = None) -> List[McpService]:
        """Get all services not include in ids"""
        query = self.db.query(McpService).filter(McpService.id.not_in(ids))
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)
        return query.order_by(McpService.created_at.desc()).all()

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

    def get_public_services_paginated(self, keyword: str, tenant_id: Optional[str] = None, page: int = 1, page_size: int = 10, tag: Optional[str] = None) -> Tuple[List[McpService], int]:
        """Get public service list with pagination, supports keyword search"""
        offset = (page - 1) * page_size

        query = self.db.query(McpService).filter(McpService.enabled == 1)
        if tenant_id:
            query = query.filter(McpService.tenant_id == tenant_id)

        if keyword:
            keyword = f"%{keyword}%"
            query = query.filter((McpService.name.like(keyword)) | (McpService.short_description.like(keyword)))
        if tag:
            normalized_tag = tag.strip()
            if normalized_tag:
                normalized_tags = func.replace(func.replace(McpService.tags, ", ", ","), " ,", ",")
                query = query.filter(func.find_in_set(normalized_tag, normalized_tags) > 0)
        

        total = query.count()

        services = query.order_by(McpService.created_at.desc()).offset(offset).limit(page_size).all()

        return services, total

    def get_tags_strings(self, enabled_only: bool = False) -> List[str]:
        query = self.db.query(McpService.tags).filter(McpService.tags.isnot(None)).filter(McpService.tags != "")
        if enabled_only:
            query = query.filter(McpService.enabled == 1)
        return [row[0] for row in query.all() if row and row[0]]
