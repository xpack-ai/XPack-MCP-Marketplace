import uuid
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from services.common.models.resource_group import ResourceGroup
from services.admin_service.repositories.resource_group_repository import ResourceGroupRepository
from services.admin_service.repositories.resource_group_service_map_repository import ResourceGroupServiceMapRepository
from services.admin_service.repositories.user_repository import UserRepository
from services.admin_service.repositories.mcp_service_repository import McpServiceRepository
from services.admin_service.repositories.sys_config_repository import SysConfigRepository

from services.common.models.mcp_service import ChargeType
from services.common.redis import redis_client 


class ResourceGroupService:
    def __init__(self, db: Session):
        self.db = db
        self.redis = redis_client
        self.group_repo = ResourceGroupRepository(db)
        self.user_repo = UserRepository(db)
        self.map_repo = ResourceGroupServiceMapRepository(db)
        self.mcp_repo = McpServiceRepository(db)

    def create_group(self, gid: str, name: str, description: Optional[str]) -> str:
        try:
            if gid != "deny-all" and gid != "allow-all":
                # 忽略大小写检查重复
                lower_name = name.strip().lower() if name else None
                if lower_name == "allow all" or lower_name == "deny all" or self.group_repo.check_name_duplicate(gid, name):
                    raise ValueError("Resource group name \"{{name}}\" already exists")
                    
                group = ResourceGroup()
                group.id = gid
                group.name = name
                group.description = description or ""
                group.enabled = 1
                result = self.group_repo.create(group, commit=False)
                if result is None:
                    raise ValueError("Failed to create resource group")
            
            self.db.commit()
            return gid
        except Exception:
            self.db.rollback()
            raise

    def update_group(self, gid: str, body: dict) -> bool:
        if not gid:
            raise ValueError("Group ID is required")
        try:
            if gid != "deny-all" and gid != "allow-all":
                name = body.get("name","")
                # 忽略大小写检查重复
                lower_name = name.strip().lower() if name else None
                if lower_name == "allow all" or lower_name == "deny all" or self.group_repo.check_name_duplicate(gid, name):
                    raise ValueError("Resource group name \"{{name}}\" already exists")
                existing = self.group_repo.get_by_id(gid)   
                if not existing:
                    raise ValueError("Resource group not found")
                patch = ResourceGroup()
                patch.id = gid
                patch.name = body.get("name", existing.name)
                patch.description = body.get("description", existing.description)
                patch.enabled = body.get("enabled", existing.enabled)
                self.group_repo.update(patch, commit=False)
            
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    def delete_group(self, gid: str,  migrate_id: Optional[str] = None) -> bool:
        try:
            if migrate_id:
                if migrate_id != "deny-all" and migrate_id != "allow-all":
                    migrate_group = self.group_repo.get_by_id(migrate_id)
                    if not migrate_group:
                        raise ValueError("Migrate resource group not found")
                self.map_repo.migrate_services(gid, migrate_id, commit=False)
        
            else:
                self.map_repo.delete_by_group_id(gid, commit=False)
                
            deleted = self.group_repo.delete(gid, commit=False)
            if deleted is None:
                raise ValueError("Resource group not found")
            users = self.user_repo.update_resource_group_by_group_id(gid, migrate_id or "deny-all", commit=False)
            if not users:
                self.db.commit()
                return True
            
            for user in users:
                cache_key = f"xpack:user:{user.id}"
                self.redis.set(cache_key, user, 600)
            cache_key = f"xpack:resource_group:id:{gid}"
            self.redis.delete(cache_key)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    def get_info(self, gid: str,default_group: str) -> Optional[dict]:
        if gid == "allow-all":
            return {
                "id":"allow-all",
                "name":"Allow All",
                "description":"Allow all services",
                "enabled": 1,
                "is_default": default_group == "allow-all" or default_group == "",
            }
        elif gid == "deny-all":
            return {
                "id":"deny-all",
                "name":"Deny All",
                "description":"Deny all services",
                "enabled": 1,
                "is_default": default_group == "deny-all",
            }
        g = self.group_repo.get_by_id(gid)
        if not g:
            return None
        
        return {
            "id": g.id,
            "name": g.name,
            "description": g.description,
            "enabled": g.enabled,
            "is_default": g.id == default_group,
        }

    def list_groups(self, page: int = 1, page_size: int = 10, default_group: str = "", keyword: Optional[str] = None) -> Tuple[List[dict], int]:
        groups,total =  self.group_repo.get_all_paginated(page=page, page_size=page_size, keyword=keyword)
        if total == 0:
            return [
                    {
                    "id":"allow-all",
                    "name":"Allow All",
                    "description":"Allow all services",
                    "enabled": 1,
                    "is_default": "allow-all" == default_group or default_group == "",
                },
                {
                    "id":"deny-all",
                    "name":"Deny All",
                    "description":"Deny all services",
                    "enabled": 1,
                    "is_default": "deny-all" == default_group,
                },
            ],2
        data = []
        # data拼接
        data.extend(
            {
                "id": g.id,
                "name": g.name,
                "description": g.description,
                "enabled": bool(g.enabled),  # 统一类型
                "created_at": str(g.created_at) if g.created_at else None,
                "updated_at": str(g.updated_at) if g.updated_at else None,
                "is_default": g.id == default_group,
            }
            for g in groups
        )
        # 默认项（统一为 dict）
        allow_all = {
            "id": "allow-all",
            "name": "Allow All",
            "description": "Allow all services",
            "enabled": True,  # 统一为 bool
            "is_default": "allow-all" == default_group or default_group == "",
        }

        deny_all = {
            "id": "deny-all",
            "name": "Deny All",
            "description": "Deny all services",
            "enabled": True,  # 统一为 bool
            "is_default": "deny-all" == default_group,
        }
        s_index = (page - 1) * page_size
        e_index = page * page_size
        if total > s_index and total < e_index:
            data.append(allow_all)
            if total < e_index-1:
                data.append(deny_all)
        elif total < s_index and s_index - total == 1:
            data.append(deny_all)
        elif total == s_index:
            data.append(allow_all)
            data.append(deny_all)
        
        

        return data,total+2

    def simple_list_groups(self) -> List[ResourceGroup]:
        data = self.group_repo.get_all()
        data.append(ResourceGroup(id="allow-all", name="Allow All", description="Allow all services", enabled=True))
        data.append(ResourceGroup(id="deny-all", name="Deny All", description="Deny all services", enabled=True))
        return data
    
    def bind_groups(self, service_id: str, group_ids: List[str]) -> int:
        created = self.map_repo.bind_group(service_id, group_ids, commit=False)
        for gid in group_ids:
            cache_key = f"xpack:resource_group:id:{gid}"
            self.redis.delete(cache_key)
        self.db.commit()
        return created
    
    def unbind_groups(self, service_id: str, group_ids: List[str]) -> int:
        count = self.map_repo.unbind_group(service_id, group_ids, commit=False)
        for gid in group_ids:
            cache_key = f"xpack:resource_group:id:{gid}"
            self.redis.delete(cache_key)
        self.db.commit()
        return count


    def bind_services(self, gid: str, service_ids: List[str]) -> int:
        valid_ids: List[str] = []
        group = self.group_repo.get_by_id(gid)
        if not group:
            raise ValueError("Resource group not found")
        for sid in service_ids:
            if self.mcp_repo.get_by_id(sid):
                valid_ids.append(sid)
        try:
            created = self.map_repo.bind_services(gid, valid_ids, commit=False)
            cache_key = f"xpack:resource_group:id:{gid}"
            self.redis.delete(cache_key)
            self.db.commit()
            return created
        except Exception:
            self.db.rollback()
            raise

    def unbind_service(self, gid: str, sids: List[str]) -> int:
        try:
            for sid in sids:
                self.map_repo.unbind_service(gid, sid, commit=False)
            cache_key = f"xpack:resource_group:id:{gid}"
            self.redis.delete(cache_key)
            self.db.commit()
            return len(sids)
        except Exception:
            self.db.rollback()
            raise


    def get_bind_groups(self, sid: str, page: int = 1, page_size: int = 10, keyword: Optional[str] = None) -> Tuple[List[dict], int]:
        groups = self.group_repo.get_all(keyword=keyword)
        if not groups:
            if keyword and keyword.lower() not in "allow-all".lower():
                return [],0
            return [
                {
                    "id":"allow-all",
                    "name":"Allow All",
                    "join_at": "2025-12-16 00:00:00"
                }
            ],1
        group_map = {g.id: g for g in groups}
        group_ids = None
        if keyword:
            group_ids = [g.id for g in groups]
            
        groups,total = self.map_repo.list_group_ids_paginated(sid, page=page, page_size=page_size, group_ids=group_ids)
        result = []
        for group in groups:
            result.append({
                "id": group["id"],
                "name": group_map[group["id"]].name if group["id"] in group_map else "",
                "join_at": str(group["join_at"]) if group["join_at"] else None,
            })
        if len(result) < page_size:
            if keyword and keyword.lower() not in "allow-all".lower():
                return result,total
            result.append({
                "id":"allow-all",
                "name":"Allow All",
                "join_at": "2025-12-16 00:00:00"
            })
            total += 1
            
        return result,total
    def get_bind_service_ids(self, gid: str) -> List[str]:
        if gid == "deny-all":
            return []
        elif gid == "allow-all":
            return [s.id for s in self.mcp_repo.get_all()]
        return self.map_repo.list_service_ids(gid)

    def get_bind_services(self, gid: str, page: int = 1, page_size: int = 10, keyword: Optional[str] = None) -> Tuple[List[dict], int]:
        if gid == "deny-all":
            return [],0
        elif gid == "allow-all":
            services,total = self.mcp_repo.get_all_paginated(page=page, page_size=page_size, keyword=keyword)
            return [
                {
                    "id": s.id,
                    "name": s.name,
                    "base_url":s.base_url,
                    "slug_name": s.slug_name,
                    "short_description": s.short_description,
                    "long_description": s.long_description,
                    "base_url": s.base_url,
                    "charge_type": s.charge_type.value if s.charge_type else None,
                    "price": str(float(s.price)) if s.price and s.charge_type == ChargeType.PER_CALL else "0.00",
                    "input_token_price": str(float(s.input_token_price)) if s.input_token_price and s.charge_type == ChargeType.PER_TOKEN else "0.00",
                    "output_token_price": str(float(s.output_token_price)) if s.output_token_price and s.charge_type == ChargeType.PER_TOKEN else "0.00",
                    "enabled": s.enabled,
                    "created_at": str(s.created_at) if s.created_at else None,
                    "updated_at": str(s.updated_at) if s.updated_at else None,
                }
                for s in services
            ],total
        if keyword:
            
            services = self.mcp_repo.get_all(keyword=keyword)
            if not services:
                return [],0
            service_map = {s.id: s for s in services}
            sids = [s.id for s in services]
            sids,total = self.map_repo.list_service_ids_paginated(gid, page=page, page_size=page_size,service_ids=sids)  
            return [
                {
                    "id": s.id,
                    "name": s.name,
                    "base_url":s.base_url,
                    "slug_name": s.slug_name,
                    "short_description": s.short_description,
                    "long_description": s.long_description,
                    "base_url": s.base_url,
                    "charge_type": s.charge_type.value if s.charge_type else None,
                    "price": str(float(s.price)) if s.price and s.charge_type == ChargeType.PER_CALL else "0.00",
                    "input_token_price": str(float(s.input_token_price)) if s.input_token_price and s.charge_type == ChargeType.PER_TOKEN else "0.00",
                    "output_token_price": str(float(s.output_token_price)) if s.output_token_price and s.charge_type == ChargeType.PER_TOKEN else "0.00",
                    "enabled": s.enabled,
                    "created_at": str(s.created_at) if s.created_at else None,
                    "updated_at": str(s.updated_at) if s.updated_at else None,
                }
                for s in (service_map[sid] for sid in sids)
            ],total
        else:
            sids,total = self.map_repo.list_service_ids_paginated(gid, page=page, page_size=page_size)  
            services = self.mcp_repo.get_by_ids(ids=sids)
            service_map = {s.id: s for s in services}
            return [
                {
                    "id": s.id,
                    "name": s.name,
                    "base_url":s.base_url,
                    "slug_name": s.slug_name,
                    "short_description": s.short_description,
                    "long_description": s.long_description,
                    "base_url": s.base_url,
                    "charge_type": s.charge_type.value if s.charge_type else None,
                    "price": str(float(s.price)) if s.price and s.charge_type == ChargeType.PER_CALL else "0.00",
                    "input_token_price": str(float(s.input_token_price)) if s.input_token_price and s.charge_type == ChargeType.PER_TOKEN else "0.00",
                    "output_token_price": str(float(s.output_token_price)) if s.output_token_price and s.charge_type == ChargeType.PER_TOKEN else "0.00",
                    "enabled": s.enabled,
                    "created_at": str(s.created_at) if s.created_at else None,
                    "updated_at": str(s.updated_at) if s.updated_at else None,
                }
                for s in (service_map[sid] for sid in sids if sid in service_map)
            ],total
    def get_unbind_services(self, gid: str) -> List[dict]:
        if gid == "deny-all" or gid == "allow-all":
            return []
        sids = self.map_repo.list_service_ids(gid)
        services = self.mcp_repo.get_all_not_include(ids=sids)
        return [
            {
                "id": s.id,
                "name": s.name,
                "base_url":s.base_url,
                "charge_type": s.charge_type.value if s.charge_type else None,
                "price": str(float(s.price)) if s.price and s.charge_type == ChargeType.PER_CALL else "0.00",
                "input_token_price": str(float(s.input_token_price)) if s.input_token_price and s.charge_type == ChargeType.PER_TOKEN else "0.00",
                "output_token_price": str(float(s.output_token_price)) if s.output_token_price and s.charge_type == ChargeType.PER_TOKEN else "0.00",
                "enabled": s.enabled,
            }
            for s in services
        ]

    def get_unbind_groups(self, sid: str) -> List[dict]:
        """Get all groups not bind to service"""
        gids = self.map_repo.list_group_ids(sid)
        groups = self.group_repo.get_all_not_include(ids=gids)
        return [
            {
                "id": g.id,
                "name": g.name,
            }
            for g in groups
        ]

