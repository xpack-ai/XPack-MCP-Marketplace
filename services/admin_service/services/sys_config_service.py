from sqlalchemy.orm import Session
from typing import Optional
from services.common.database import SessionLocal
from services.common.redis import RedisClient
from services.common.redis_keys import RedisKeys
import logging

from services.common.models.sys_config import SysConfig
from services.admin_service.repositories.sys_config_repository import SysConfigRepository

logger = logging.getLogger(__name__)


class SysConfigService:
    def __init__(self, db: Session = SessionLocal()):
        self.sys_config_repository = SysConfigRepository(db)
        try:
            self.redis_client = RedisClient()
        except Exception as e:
            logger.warning(f"Redis connection failed, cache will be disabled: {e}")
            self.redis_client = None

    def get_value_by_key(self, key: str) -> str:
        """Get config value, prioritize cache, fallback to database if cache miss"""
        cache_key = RedisKeys.sys_config_key(key)

        if self.redis_client:
            try:
                cached_value = self.redis_client.get(cache_key)
                if cached_value is not None:
                    logger.debug(f"Got sys_config {key} from cache")
                    return "" if cached_value == "__NULL__" else cached_value
            except Exception as e:
                logger.warning(f"Failed to get cache for key {key}: {e}")

        try:
            value = self.sys_config_repository.get_value_by_key(key)

            if self.redis_client:
                try:
                    cache_value = "__NULL__" if value is None else value
                    self.redis_client.set(cache_key, cache_value, ex=3600)
                    logger.debug(f"Cached sys_config {key} for 1 hour")
                except Exception as e:
                    logger.warning(f"Failed to cache key {key}: {e}")

            return value or ""
        except Exception as e:
            logger.error(f"Failed to get sys_config {key} from database: {e}")
            return ""

    def delete_by_key(self, key: str) -> bool:
        """Delete config and clear cache"""
        result = self.sys_config_repository.delete_by_key(key)
        if result:
            self._clear_cache(key)
        return result

    def set_value_by_key(self, key: str, value: str, description: str) -> Optional[SysConfig]:
        """Set config value and clear cache"""
        result = self.sys_config_repository.set_value_by_key(key=key, value=value, description=description)
        if result:
            self._clear_cache(key)
        return result

    def _clear_cache(self, key: str) -> None:
        """Clear cache for specified config"""
        if self.redis_client:
            try:
                cache_key = RedisKeys.sys_config_key(key)
                self.redis_client.delete(cache_key)
                logger.debug(f"Cleared cache for sys_config {key}")
            except Exception as e:
                logger.warning(f"Failed to clear cache for key {key}: {e}")

    def get_multiple_values(self, keys: list[str]) -> dict[str, Optional[str]]:
        """Get multiple config values with optimized performance"""
        result = {}
        cache_miss_keys = []

        if self.redis_client and keys:
            for key in keys:
                try:
                    cache_key = RedisKeys.sys_config_key(key)
                    cached_value = self.redis_client.get(cache_key)
                    if cached_value is not None:
                        result[key] = None if cached_value == "__NULL__" else cached_value
                        logger.debug(f"Got sys_config {key} from cache")
                    else:
                        cache_miss_keys.append(key)
                except Exception as e:
                    logger.warning(f"Failed to get cache for key {key}: {e}")
                    cache_miss_keys.append(key)
        else:
            cache_miss_keys = keys

        if cache_miss_keys:
            try:
                for key in cache_miss_keys:
                    value = self.sys_config_repository.get_value_by_key(key)
                    result[key] = value

                    if self.redis_client:
                        try:
                            cache_key = RedisKeys.sys_config_key(key)
                            cache_value = "__NULL__" if value is None else value
                            self.redis_client.set(cache_key, cache_value, ex=3600)
                            logger.debug(f"Cached sys_config {key} for 1 hour")
                        except Exception as e:
                            logger.warning(f"Failed to cache key {key}: {e}")
            except Exception as e:
                logger.error(f"Failed to get sys_config from database: {e}")
                for key in cache_miss_keys:
                    if key not in result:
                        result[key] = None

        return result
