"""Repository for MCP services in API service: cached reads by ID/slug."""
from sqlalchemy.orm import Session
from services.common.models.mcp_service import McpService
from services.common.utils.cache_utils import CacheUtils
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)


class McpServiceRepository:
    """Repository for MCP services in API service: cached reads by ID/slug."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, service_id: str, force_update: bool = False) -> Optional[McpService]:
        """
        Get single MCP service by service ID 
        """
        cache_key = f"xpack:mcp_service:id:{service_id}"
        if not force_update:
            # Try to get from cache using SQLAlchemy-specific method
            cached_model = CacheUtils.get_sqlalchemy_cache(cache_key, McpService)
            if cached_model:
                return cached_model

        # Query from database if not in cache
        service = self.db.query(McpService).filter(McpService.id == service_id, McpService.enabled == 1).first()
        if service:
            # Cache the result for 10 minutes
            CacheUtils.set_sqlalchemy_cache(cache_key, service, 600)
            return service

        return None

    def get_by_slug_name(self, slug_name: str) -> Optional[McpService]:
        """
        Get single MCP service by slug name
        """
        cache_key = f"xpack:mcp_service:slug:{slug_name}"

        # Try to get from cache using SQLAlchemy-specific method
        cached_model = CacheUtils.get_sqlalchemy_cache(cache_key, McpService)
        if cached_model:
            return cached_model

        # Query from database if not in cache
        service = self.db.query(McpService).filter(McpService.slug_name == slug_name, McpService.enabled == 1).first()
        if service:
            # Cache the result for 10 minutes
            CacheUtils.set_sqlalchemy_cache(cache_key, service, 600)
            return service

        return None
