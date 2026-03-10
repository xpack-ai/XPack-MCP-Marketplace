from datetime import datetime, timezone
from sqlalchemy.orm import Session
from services.common.models.temp_mcp_service import TempMcpService
from typing import Optional, List


class TempMcpServiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, temp_mcp_service: TempMcpService) -> TempMcpService:
        """Create temporary service record"""
        self.db.add(temp_mcp_service)
        self.db.commit()
        self.db.refresh(temp_mcp_service)
        return temp_mcp_service

    def delete_by_service_id(self, service_id: str, tenant_id: Optional[str] = None) -> None:
        """Delete all temporary records for specified service ID"""
        self.db.query(TempMcpService).filter(TempMcpService.id == service_id, TempMcpService.tenant_id == tenant_id).delete()
        self.db.commit()

    def get_by_id(self, service_id: str, tenant_id: Optional[str] = None) -> Optional[TempMcpService]:
        """Get temporary service record by service ID"""
        return self.db.query(TempMcpService).filter(TempMcpService.id == service_id, TempMcpService.tenant_id == tenant_id).first()

    def get_all_by_service_id(self, service_id: str, tenant_id: Optional[str] = None) -> List[TempMcpService]:
        """Get all temporary records for specified service ID"""
        return self.db.query(TempMcpService).filter(TempMcpService.id == service_id, TempMcpService.tenant_id == tenant_id).all()
