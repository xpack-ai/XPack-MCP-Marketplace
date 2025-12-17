"""
User repository class - used in API service
"""
from typing import Optional
from sqlalchemy.orm import Session
from services.common.models.user import User
from services.common.utils.cache_utils import CacheUtils
from services.common.redis_keys import RedisKeys


class UserRepository:
    """User repository class"""
    
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str, force_update: bool = False) -> Optional[User]:
        """
        Get user by ID
        
        Args:
            user_id: User ID
            
        Returns:
            User: User instance, returns None if not exists
        """
        """
        Get user by ID          
        """
        cache_key = RedisKeys.user_key(user_id)
        if not force_update:
            # Try to get from cache using SQLAlchemy-specific method
            cached_model = CacheUtils.get_sqlalchemy_cache(cache_key, User)
            if cached_model:
                return cached_model

        # Query from database if not in cache
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:                    
            # Cache the result for 10 minutes
            CacheUtils.set_sqlalchemy_cache(cache_key, user, 600)
            return user

        return None
