from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from services.common.models.resource_group import ResourceGroup


class ResourceGroupRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, group: ResourceGroup, commit: bool = True) -> ResourceGroup:
        now = datetime.now(timezone.utc)
        if not getattr(group, "created_at", None):
            group.created_at = now
        if not getattr(group, "updated_at", None):
            group.updated_at = now
        self.db.add(group)
        if commit:
            self.db.commit()
            self.db.refresh(group)
        return group

    def update(self, group: ResourceGroup, commit: bool = True) -> ResourceGroup:
        existing = self.db.query(ResourceGroup).filter(ResourceGroup.id == group.id).first()
        if not existing:
            raise ValueError("Resource group not found")
        if group.name is not None:
            existing.name = group.name
        if group.description is not None:
            existing.description = group.description
        if group.enabled is not None:
            existing.enabled = group.enabled
        if commit:
            self.db.commit()
            self.db.refresh(existing)
        return existing

    def delete(self, id: str, commit: bool = True) -> Optional[ResourceGroup]:
        existing = self.db.query(ResourceGroup).filter(ResourceGroup.id == id).first()
        if not existing:
            return None
        self.db.delete(existing)
        if commit:
            self.db.commit()
        return existing

    def get_by_id(self, id: str) -> Optional[ResourceGroup]:
        return self.db.query(ResourceGroup).filter(ResourceGroup.id == id).first()

    def get_all_not_include(self, ids: List[str]) -> List[ResourceGroup]:
        """Get all groups not include in ids"""
        return self.db.query(ResourceGroup).filter(ResourceGroup.id.not_in(ids)).all()

    def get_all_paginated(self, page: int = 1, page_size: int = 10, keyword: Optional[str] = None) -> Tuple[List[ResourceGroup], int]:
        offset = (page - 1) * page_size
        query = self.db.query(ResourceGroup)
        if keyword:
            query = query.filter(ResourceGroup.name.like(f"%{keyword}%"))
        total = query.count()
        groups = (
            query.order_by(ResourceGroup.created_at.desc()).offset(offset).limit(page_size).all()
        )
        return groups, total
    
    def get_all(self,keyword: Optional[str] = None) -> List[ResourceGroup]:
        query = self.db.query(ResourceGroup)
        if keyword:
            query = query.filter(ResourceGroup.name.like(f"%{keyword}%"))
        return query.order_by(ResourceGroup.created_at.desc()).all()
