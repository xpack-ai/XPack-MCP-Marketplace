from datetime import datetime
from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.models.user_access_token import UserAccessToken
from services.common.models.user import User
from services.common.redis_keys import RedisKeys
from services.common.utils.cache import get_model_cache, set_model_cache, delete_cache
import logging

# Configure logging
logger = logging.getLogger(__name__)

security = HTTPBearer()

# Cache configuration
TOKEN_CACHE_EXPIRE_TIME = 30 * 24 * 3600  # Cache for 30 days


def verify_token(token: str, db: Session) -> Optional[User]:
    """Verify token and return user info (with Redis cache support)"""
    try:
        # Get token info
        token_cache_key = RedisKeys.user_access_token_key(token)
        user_access_token = get_model_cache(token_cache_key, UserAccessToken)
        if not user_access_token:
            user_access_token = db.query(UserAccessToken).filter(UserAccessToken.token == token).first()
            if not user_access_token:
                logger.warning(f"Token not found: {token}")
                return None
            set_model_cache(token_cache_key, user_access_token, TOKEN_CACHE_EXPIRE_TIME)

        logging.info(f"query token info")

        # Check if token is expired
        expire_datetime = datetime.strptime(str(user_access_token.expire_at), "%Y-%m-%d %H:%M:%S")
        if expire_datetime <= datetime.now():
            logger.warning(f"Token expired: {token}, expire_at: {user_access_token.expire_at}")
            # Delete expired cache
            delete_cache(token_cache_key)
            return None

        # Get user info
        user_cache_key = RedisKeys.user_key(str(user_access_token.user_id))
        user = get_model_cache(user_cache_key, User)
        if not user:
            user = (
                db.query(User).filter(User.id == user_access_token.user_id and User.is_deleted == False and User.is_active == True).first()
            )
            print("user is",user.register_type)
            if not user:
                logger.warning(f"User not found for token: {token}, user_id: {user_access_token.user_id}")
                return None
            set_model_cache(user_cache_key, user)

        if not user or not isinstance(user, User):
            logger.warning(f"User not found for token: {token}, user_id: {user_access_token.user_id}")
            return None

        return user

    except Exception as e:
        logger.error(f"Token verification failed for token {token}: {e}", exc_info=True)
        return None

def delete_token(token: str) -> bool:
    """Delete token from database and cache"""
    try:
        token_cache_key = RedisKeys.user_access_token_key(token)
        delete_cache(token_cache_key)
        return True
    except Exception as e:
        logger.error(f"Failed to delete token {token}: {e}", exc_info=True)
        return False
