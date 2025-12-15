import uuid
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from services.common.models.resource_group import ResourceGroup
from services.admin_service.repositories.resource_group_repository import ResourceGroupRepository
from services.admin_service.repositories.resource_group_service_map_repository import ResourceGroupServiceMapRepository
from services.admin_service.repositories.mcp_service_repository import McpServiceRepository
from services.admin_service.repositories.sys_config_repository import SysConfigRepository
from services.admin_service.constants.sys_config_key import KEY_DEFAULT_RESOURCE_GROUP
from services.common.models.mcp_service import ChargeType



class ResourceGroupService:
    def __init__(self, db: Session):
        self.db = db
        self.group_repo = ResourceGroupRepository(db)
        self.map_repo = ResourceGroupServiceMapRepository(db)
        self.mcp_repo = McpServiceRepository(db)
        self.sys_repo = SysConfigRepository(db)

    def create_group(self, gid: str, name: str, description: Optional[str], is_default: bool = False) -> str:
        
        try:
            if gid != "deny-all" and gid != "allow-all":
                group = ResourceGroup()
                group.id = gid
                group.name = name
                group.description = description or ""
                group.enabled = 1
                result = self.group_repo.create(group, commit=False)
                if result is None:
                    raise ValueError("Failed to create resource group")
            
            if is_default:
                self.sys_repo.set_value_by_key(key=KEY_DEFAULT_RESOURCE_GROUP, value=gid, description="Default resource group", commit=False)
            self.db.commit()
            return gid
        except Exception:
            self.db.rollback()
            raise

    def update_group(self, gid: str, body: dict) -> bool:
        if not gid:
            raise ValueError("Group ID is required")
        existing = self.group_repo.get_by_id(gid)
        if not existing:
            raise ValueError("Resource group not found")
        try:
            if gid != "deny-all" and gid != "allow-all":
                patch = ResourceGroup()
                patch.id = gid
                patch.name = body.get("name", existing.name)
                patch.description = body.get("description", existing.description)
                patch.enabled = body.get("enabled", existing.enabled)
                self.group_repo.update(patch, commit=False)
            is_default = body.get("is_default", False)
            if is_default:
                self.sys_repo.set_value_by_key(key=KEY_DEFAULT_RESOURCE_GROUP, value=gid, description="Default resource group", commit=False)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    def delete_group(self, gid: str, migrate_id: Optional[str] = None) -> bool:
        try:
            if migrate_id:
                migrate_group = self.group_repo.get_by_id(migrate_id)
                if not migrate_group:
                    raise ValueError("Migrate resource group not found")
                self.map_repo.migrate_services(gid, migrate_id, commit=False)
                current_default = self.sys_repo.get_value_by_key(KEY_DEFAULT_RESOURCE_GROUP)
                if current_default == gid:
                    self.sys_repo.set_value_by_key(KEY_DEFAULT_RESOURCE_GROUP, migrate_id, "Default resource group", commit=False)
            else:
                self.map_repo.delete_by_group_id(gid, commit=False)
                current_default = self.sys_repo.get_value_by_key(KEY_DEFAULT_RESOURCE_GROUP)
                if current_default == gid:
                    self.sys_repo.set_value_by_key(KEY_DEFAULT_RESOURCE_GROUP, "", "Default resource group", commit=False)
            deleted = self.group_repo.delete(gid, commit=False)
            if deleted is None:
                raise ValueError("Resource group not found")
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    def get_info(self, gid: str) -> Optional[dict]:
        default_group = self.sys_repo.get_value_by_key(KEY_DEFAULT_RESOURCE_GROUP)
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

    def list_groups(self, page: int = 1, page_size: int = 10, keyword: Optional[str] = None) -> Tuple[List[dict], int]:
        groups,total =  self.group_repo.get_all_paginated(page=page, page_size=page_size, keyword=keyword)
        default_group = self.sys_repo.get_value_by_key(KEY_DEFAULT_RESOURCE_GROUP)
        data = [
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
        ]
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
        return data,total

    def simple_list_groups(self) -> List[ResourceGroup]:
        return self.group_repo.get_all()


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
            self.db.commit()
            return created
        except Exception:
            self.db.rollback()
            raise

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

    def unbind_service(self, gid: str, sids: List[str]) -> int:
        try:
            for sid in sids:
                self.map_repo.unbind_service(gid, sid, commit=False)
            self.db.commit()
            return len(sids)
        except Exception:
            self.db.rollback()
            raise
