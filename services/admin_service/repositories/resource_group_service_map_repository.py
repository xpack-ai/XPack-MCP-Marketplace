from typing import List, Tuple, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from services.common.models.resource_group import ResourceGroupServiceMap


class ResourceGroupServiceMapRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def bind_group(self, service_id: str, group_ids: List[str], commit: bool = True) -> int:
        created = 0
        now = datetime.now()
        for gid in group_ids:
            exists = (
                self.db.query(ResourceGroupServiceMap)
                .filter(ResourceGroupServiceMap.group_id == gid, ResourceGroupServiceMap.service_id == service_id)
                .first()
            )
            if exists:
                continue
            mapping = ResourceGroupServiceMap(group_id=gid, service_id=service_id, created_at=now)
            self.db.add(mapping)
            created += 1
        if created and commit:
            self.db.commit()
        return created
    
    def unbind_group(self, service_id: str, group_ids: List[str], commit: bool = True) -> int:
        q = (
            self.db.query(ResourceGroupServiceMap)
            .filter(ResourceGroupServiceMap.group_id.in_(group_ids), ResourceGroupServiceMap.service_id == service_id)
        )
        count = q.count()
        if count:
            q.delete()
            if commit:
                self.db.commit()
        return count

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
    
    def list_group_ids_paginated(self, service_id: str, page: int = 1, page_size: int = 10, group_ids: Optional[List[str]] = None) -> Tuple[List[dict], int]:
        offset = (page - 1) * page_size
        query = self.db.query(ResourceGroupServiceMap).filter(ResourceGroupServiceMap.service_id == service_id)
        if group_ids:
            query = query.filter(ResourceGroupServiceMap.group_id.in_(group_ids))
        total = query.count()
        groups = (
            query.order_by(ResourceGroupServiceMap.created_at.desc()).offset(offset).limit(page_size).all()
        )
        return [{"id": r.group_id, "join_at": r.created_at} for r in groups], total

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
    
    def list_service_ids(self, group_id: str) -> List[str]:
        return [r.service_id for r in self.db.query(ResourceGroupServiceMap.service_id).filter(ResourceGroupServiceMap.group_id == group_id).all()]

    def list_group_ids(self, service_id: str) -> List[str]:
        return [r.group_id for r in self.db.query(ResourceGroupServiceMap.group_id).filter(ResourceGroupServiceMap.service_id == service_id).all()]

    def migrate_services(self, from_group_id: str, to_group_id: str, commit: bool = True) -> int:
        # 过滤已经在新分组的服务
        existing_services = (
            self.db.query(ResourceGroupServiceMap.service_id)
            .filter(ResourceGroupServiceMap.group_id == to_group_id)
            .all()
        )
        existing_service_ids = [item.service_id for item in existing_services]
        q = (
            self.db.query(ResourceGroupServiceMap)
            .filter(ResourceGroupServiceMap.group_id == from_group_id, ~ResourceGroupServiceMap.service_id.in_(existing_service_ids))
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
