from sqlalchemy.orm import Session
from services.common.models.mcp_tool_api import McpToolApi
from typing import Optional, List


class McpToolApiRepository:
    """MCP tool API repository layer for API service"""

    def __init__(self, db: Session):
        self.db = db

    def get_by_service_id(self, service_id: str) -> List[McpToolApi]:
        """
        Get all API list under a service by service ID
        Only returns enabled and non-deleted APIs
        """
        return (
            self.db.query(McpToolApi).filter(McpToolApi.service_id == service_id, McpToolApi.enabled == 1, McpToolApi.is_deleted == 0).all()
        )

    def get_by_id(self, api_id: str) -> Optional[McpToolApi]:
        """
        Get single API by API ID
        Only returns enabled and non-deleted APIs
        """
        return self.db.query(McpToolApi).filter(McpToolApi.id == api_id, McpToolApi.enabled == 1, McpToolApi.is_deleted == 0).first()
