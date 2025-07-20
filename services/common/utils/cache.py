"""
"""

import json
import logging
from typing import Optional, Any
from objtyping import to_primitive
from services.common.redis import redis_client

logger = logging.getLogger(__name__)

DEFAULT_CACHE_EXPIRE_TIME = 3600


def get_model_cache(cache_key: str, model_class: type) -> Optional[Any]:
    """
    """
    try:
        cache_value = redis_client.get(cache_key)
        if cache_value:
            return model_class(**json.loads(cache_value))
        return None
    except Exception as e:
        logger.error(f"Cache/DB operation failed for key {cache_key}: {e}")
        return None


def get_cache(cache_key: str) -> Optional[Any]:
    """
    """
    try:
        return redis_client.get(cache_key)
    except Exception as e:
        logger.error(f"Cache/DB operation failed for key {cache_key}: {e}")
        return None


def set_cache(key: str, value: Any, expire_time: int = DEFAULT_CACHE_EXPIRE_TIME) -> bool:
    """

    Args:

    Returns:
    """
    try:
        redis_client.set(key, value, ex=expire_time)
        return True
    except Exception as e:
        logger.error(f"Failed to set cache for key {key}: {e}")
        return False


def set_model_cache(cache_key: str, model: Any, expire_time: int = DEFAULT_CACHE_EXPIRE_TIME) -> bool:
    """
    """
    try:
        redis_client.set(cache_key, json.dumps(to_primitive(model)), ex=expire_time)
        return True
    except Exception as e:
        logger.error(f"Failed to set cache for key {cache_key}: {e}")
        return False


def delete_cache(key: str) -> bool:
    """

    Args:

    Returns:
    """
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Failed to delete cache for key {key}: {e}")
        return False


def clear_pattern_cache(pattern: str) -> int:
    """

    Args:

    Returns:
    """
    try:
        logger.warning("Pattern cache clearing not implemented - use specific keys instead")
        return 0
    except Exception as e:
        logger.error(f"Failed to clear pattern cache for {pattern}: {e}")
        return 0
