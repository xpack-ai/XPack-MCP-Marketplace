import uuid
import secrets
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from services.common.models.sys_config import SysConfig
from typing import Optional

class SysConfigRepository:
    def __init__(self, db: Session):
        self.db = db
    def get_by_key(self, key: str) -> Optional[SysConfig]:
        return self.db.query(SysConfig).filter(SysConfig.key == key).first()
    def get_value_by_key(self, key: str) -> Optional[str]:
        sys_config = self.get_by_key(key)
        if sys_config:
            return sys_config.value
        return None
    def set_value_by_key(self, key: str, value: str,description:str) -> Optional[SysConfig]:
        sys_config = self.get_by_key(key)
        if sys_config:
            sys_config.value = value
            sys_config.description = description
            self.db.commit()
            self.db.refresh(sys_config)
            return sys_config
        sys_config = SysConfig(
            id=str(uuid.uuid4()),
            key=key, 
            value=value,
            description=description,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        self.db.add(sys_config)
        self.db.commit()
        return sys_config
    def delete_by_key(self, key: str) -> bool:
        sys_config = self.get_by_key(key)
        if sys_config:
            self.db.delete(sys_config)
            self.db.commit()
            return True
        return False