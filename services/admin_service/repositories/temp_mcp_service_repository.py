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

    def update(self, temp_mcp_service: TempMcpService) -> TempMcpService:
        """Update temporary service record"""
        existing_service = self.db.query(TempMcpService).filter(TempMcpService.id == temp_mcp_service.id).first()
        if not existing_service:
            raise ValueError("Temporary service not found")

        # 更新所有字段
        existing_service.tenant_id = temp_mcp_service.tenant_id
        existing_service.name = temp_mcp_service.name
        existing_service.slug_name = temp_mcp_service.slug_name
        existing_service.short_description = temp_mcp_service.short_description
        existing_service.long_description = temp_mcp_service.long_description
        existing_service.base_url = temp_mcp_service.base_url
        existing_service.headers = temp_mcp_service.headers
        existing_service.charge_type = temp_mcp_service.charge_type
        existing_service.price = temp_mcp_service.price
        existing_service.input_token_price = temp_mcp_service.input_token_price
        existing_service.output_token_price = temp_mcp_service.output_token_price
        existing_service.enabled = temp_mcp_service.enabled
        existing_service.tags = temp_mcp_service.tags
        existing_service.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(existing_service)
        return existing_service