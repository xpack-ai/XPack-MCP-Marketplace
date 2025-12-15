from typing import List, Tuple, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from services.common.models.resource_group import ResourceGroupServiceMap


class ResourceGroupServiceMapRepository:
    def __init__(self, db: Session):
        self.db = db

    def bind_services(self, group_id: str, service_ids: List[str], commit: bool = True) -> int:
        created = 0
        now = datetime.now()
        for sid in service_ids:
            exists = (
                self.db.query(ResourceGroupServiceMap)
                .filter(ResourceGroupServiceMap.group_id == group_id, ResourceGroupServiceMap.service_id == sid)
                .first()
            )
            if exists:
                continue
            mapping = ResourceGroupServiceMap(group_id=group_id, service_id=sid, created_at=now)
            self.db.add(mapping)
            created += 1
        if created and commit:
            self.db.commit()
        return created

    def unbind_service(self, group_id: str, service_id: str, commit: bool = True) -> int:
        q = (
            self.db.query(ResourceGroupServiceMap)
            .filter(ResourceGroupServiceMap.group_id == group_id, ResourceGroupServiceMap.service_id == service_id)
        )
        count = q.count()
        if count:
            q.delete()
            if commit:
                self.db.commit()
        return count

    def list_service_ids_paginated(self, group_id: str, page: int = 1, page_size: int = 10,service_ids: Optional[List[str]] = None) -> Tuple[List[str], int]:
        offset = (page - 1) * page_size
        query = self.db.query(ResourceGroupServiceMap).filter(ResourceGroupServiceMap.group_id == group_id)
        if service_ids:
            query = query.filter(ResourceGroupServiceMap.service_id.in_(service_ids))
        total = query.count()
        groups = (
            query.order_by(ResourceGroupServiceMap.created_at.desc()).offset(offset).limit(page_size).all()
        )
        return [r.service_id for r in groups], total

    def migrate_services(self, from_group_id: str, to_group_id: str, commit: bool = True) -> int:
        q = (
            self.db.query(ResourceGroupServiceMap)
            .filter(ResourceGroupServiceMap.group_id == from_group_id)
        )
        count = q.count()
        # 获取当前时间
        now = datetime.now()
        if count:
            q.update({ResourceGroupServiceMap.group_id: to_group_id, ResourceGroupServiceMap.created_at: now})
            if commit:
                self.db.commit()
        return count

    def delete_by_group_id(self, group_id: str, commit: bool = True) -> int:
        q = self.db.query(ResourceGroupServiceMap).filter(ResourceGroupServiceMap.group_id == group_id)
        count = q.count()
        if count:
            q.delete()
            if commit:
                self.db.commit()
        return count
