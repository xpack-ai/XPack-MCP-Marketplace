from datetime import datetime, timezone
from sqlalchemy.orm import Session
from services.common.models.mcp_service import DropMCPService
from typing import Dict, List


"""Repository for MCP services: CRUD, pagination, and public listing."""
class DropMcpServiceRepository:
    """Data access layer for McpService model."""
    def __init__(self, db: Session):
        self.db = db

    def create(self, mcp_service: DropMCPService) -> DropMCPService:
        """Create a service; set timestamps if missing and persist."""
        # Set timestamps explicitly if not already set
        current_time = datetime.now(timezone.utc)
        if not hasattr(mcp_service, "updated_at") or mcp_service.updated_at is None:
            mcp_service.updated_at = current_time

        self.db.add(mcp_service)
        self.db.commit()
        self.db.refresh(mcp_service)
        return mcp_service
    
    def all(self) -> Dict[str, DropMCPService]:
        """Retrieve all services."""
        services = self.db.query(DropMCPService).all()
        return {service.id: service for service in services}
    
    def all_by_service_ids(self, service_ids: List[str]) -> Dict[str, DropMCPService]:
        """Retrieve all services by service IDs."""
        services = self.db.query(DropMCPService).filter(DropMCPService.id.in_(service_ids)).all()
        return {service.id: service for service in services}