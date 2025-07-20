"""
User API key repository class - used in API service
"""

import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from services.common.models.user_apikey import UserApiKey
from services.common.redis_keys import RedisKeys
from services.common.utils.cache_utils import CacheUtils

logger = logging.getLogger(__name__)


class UserApiKeyRepository:
    """User API key repository class"""

    def __init__(self, db: Session):
        self.db = db

    def get_by_apikey(self, apikey: str) -> Optional[UserApiKey]:
        """
        Query user API key info by API key

        Args:
            apikey: API key

        Returns:
            Optional[UserApiKey]: User API key info, returns None if not exists
        """
        cache_key = RedisKeys.user_apikey_key(apikey)
        
        # Try to get from cache using new SQLAlchemy-specific method
        cached_model = CacheUtils.get_sqlalchemy_cache(cache_key, UserApiKey)
        if cached_model:
            return cached_model

        # Query from database if not in cache
        user_apikey = self.db.query(UserApiKey).filter(UserApiKey.apikey == apikey).first()
        if user_apikey:
            # Cache the result using new SQLAlchemy-specific method
            CacheUtils.set_sqlalchemy_cache(cache_key, user_apikey, 300)
            return user_apikey

        return None

    def is_apikey_valid(self, apikey: str) -> bool:
        """
        Check if API key is valid

        Args:
            apikey: API key

        Returns:
            bool: Whether valid
        """
        user_apikey = self.get_by_apikey(apikey)
        if not user_apikey:
            return False

        # Check if expired
        if user_apikey.expire_at:
            # Ensure timezone consistency: if database time has no timezone info, assume it's UTC time
            if user_apikey.expire_at.tzinfo is None:
                # Database time has no timezone info, assume UTC
                expire_at_utc = user_apikey.expire_at.replace(tzinfo=timezone.utc)
            else:
                expire_at_utc = user_apikey.expire_at

            if expire_at_utc < datetime.now(timezone.utc):
                return False

        return True
