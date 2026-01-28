import logging
from sqlalchemy.orm import Session
from typing import Optional, List
from services.common.models.user_apikey import UserApiKey
from services.common.database import SessionLocal
from datetime import datetime
from services.admin_service.repositories.user_apikey_repository import UserApiKeyRepository
from services.common.utils.cache_utils import CacheUtils
from services.common.redis_keys import RedisKeys

logger = logging.getLogger(__name__)


class UserApiKeyService:
    def __init__(self, db: Session = SessionLocal()):
        self.user_apikey_repository = UserApiKeyRepository(db)

    def create(self, user_id: str, name: str, description: str = "") -> UserApiKey:
        """Create a new API key for the user with generated token."""
        if self.user_apikey_repository.check_user_apikey_by_name(user_id, name):
            raise ValueError("API key name already exists")
        user_apikey = self.user_apikey_repository.create(user_id, name, description)
        return user_apikey

    def modify(
        self, id: str, user_id: str, name: Optional[str] = None, description: Optional[str] = None, expire_at: Optional[datetime] = None
    ) -> Optional[UserApiKey]:
        user_apikey = self.user_apikey_repository.get_by_id(id)
        if not user_apikey or user_apikey.user_id != user_id:
            return None
        updated = self.user_apikey_repository.update(id, name, description, expire_at)
        return updated

    def delete(self, id: str, user_id: str) -> Optional[UserApiKey]:
        user_apikey = self.user_apikey_repository.get_by_id(id)
        if not user_apikey or user_apikey.user_id != user_id:
            return None
        self.user_apikey_repository.delete(id)
        try:
            CacheUtils.delete_cache(RedisKeys.user_apikey_key(user_apikey.apikey))
        except Exception:
            pass
        return user_apikey

    def get_by_user_id(self, user_id: str) -> List[UserApiKey]:
        return self.user_apikey_repository.get_by_user_id(user_id)
