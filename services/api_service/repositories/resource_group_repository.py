"""
Resource group service map repository class - used in API service
"""
from typing import List
from sqlalchemy.orm import Session
from services.common.models.resource_group import ResourceGroupServiceMap
from services.common.utils.cache_utils import CacheUtils


class ResourceGroupMapRepository:
    """Resource group service map repository class"""
    
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, group_id: str, force_update: bool = False) -> List[str]:
        """
        Get resource group service map by ID
        
        Args:
            group_id: Resource group ID
            
        Returns:
            List[str]: Resource group service map instance, returns None if not exists
        """
        """
        Get resource group service map by ID
        """
        cache_key = f"xpack:resource_group:id:{group_id}"
        if not force_update:
            # Try to get from cache using SQLAlchemy-specific method
            cached_model = CacheUtils.get_sqlalchemy_cache(cache_key, List[str])
            if cached_model:
                return cached_model

        # Query from database if not in cache
        service_ids = [item.service_id for item in self.db.query(ResourceGroupServiceMap).filter(ResourceGroupServiceMap.group_id == group_id).all()]
        if service_ids:
            # Cache the result for 10 minutes
            CacheUtils.set_sqlalchemy_cache(cache_key, service_ids, 600)
            return service_ids

        return []
