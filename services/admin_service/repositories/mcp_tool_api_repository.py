from sqlalchemy.orm import Session
from services.common.models.mcp_tool_api import McpToolApi
from typing import Optional


class McpToolApiRepository:
    def __init__(self, db: Session):
        self.db = db

    def update(self, mcp_tool_api: McpToolApi) -> McpToolApi:
        db_obj = self.db.query(McpToolApi).filter(McpToolApi.id == mcp_tool_api.id).first()
        if not db_obj:
            raise ValueError("McpToolApi not found")
        db_obj.name = mcp_tool_api.name
        db_obj.description = mcp_tool_api.description
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def create(self, mcp_tool_api: McpToolApi) -> McpToolApi:
        # Set timestamps explicitly if not already set
        from datetime import datetime, timezone
        current_time = datetime.now(timezone.utc)
        if not hasattr(mcp_tool_api, 'created_at') or mcp_tool_api.created_at is None:
            mcp_tool_api.created_at = current_time
        if not hasattr(mcp_tool_api, 'updated_at') or mcp_tool_api.updated_at is None:
            mcp_tool_api.updated_at = current_time
            
        self.db.add(mcp_tool_api)
        self.db.commit()
        self.db.refresh(mcp_tool_api)
        return mcp_tool_api

    def get_by_service_id(self, service_id: str) -> list[McpToolApi]:
        """Get API list by service ID"""
        return self.db.query(McpToolApi).filter(
            McpToolApi.service_id == service_id,
            McpToolApi.is_deleted == 0
        ).all()

    def get_by_id(self, api_id: str) -> Optional[McpToolApi]:
        """Get single API by API ID"""
        return self.db.query(McpToolApi).filter(
            McpToolApi.id == api_id,
            McpToolApi.is_deleted == 0
        ).first()

    def delete_by_service_id(self, service_id: str) -> None:
        """Delete all API records for specified service ID"""
        self.db.query(McpToolApi).filter(McpToolApi.service_id == service_id).delete()
        self.db.commit()
