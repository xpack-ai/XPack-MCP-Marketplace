"""
"""

import json
import logging
from typing import Optional, Any
from objtyping import to_primitive
from services.common.redis import redis_client
from enum import Enum as PyEnum

logger = logging.getLogger(__name__)

DEFAULT_CACHE_EXPIRE_TIME = 3600


def get_model_cache(cache_key: str, model_class: type) -> Optional[Any]:
    """Get cached model and reconstruct SQLAlchemy model safely.

    Supports both legacy JSON-serialized cache values and new pickled dicts.
    Ensures Enum fields are properly restored.
    """
    try:
        cache_value = redis_client.get(cache_key)
        if cache_value is None:
            return None

        # Normalize cache value to dict
        if isinstance(cache_value, dict):
            model_data = cache_value
        elif isinstance(cache_value, str):
            try:
                model_data = json.loads(cache_value)
            except Exception:
                # Unexpected format; ignore
                logger.warning(f"Unexpected cache string format for key {cache_key}, unable to parse JSON")
                return None
        else:
            logger.warning(f"Unexpected cache type for key {cache_key}: {type(cache_value)}")
            return None

        try:
            # Use SQLAlchemy-aware reconstruction for better type handling
            from services.common.utils.sqlalchemy_utils import SqlalchemyUtils
            return SqlalchemyUtils.dict_to_model(model_class, model_data)
        except Exception as e:
            logger.warning(f"Fallback to direct model init for key {cache_key}: {e}")
            try:
                return model_class(**model_data)
            except Exception as inner_e:
                logger.error(f"Failed to reconstruct model for key {cache_key}: {inner_e}")
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
    """Set model cache with safe serialization.

    - For SQLAlchemy models, convert to dict via SqlalchemyUtils to avoid losing Enum fields
    - Normalize Enum values to their underlying string representation for portability
    - Store dicts via RedisClient which pickles complex types reliably
    """
    try:
        model_dict = None
        # Try SQLAlchemy-aware conversion first
        try:
            from services.common.utils.sqlalchemy_utils import SqlalchemyUtils
            model_dict = SqlalchemyUtils.model_to_dict(model)
        except Exception:
            # Fallback to generic primitive conversion
            try:
                model_dict = to_primitive(model)
            except Exception:
                model_dict = None

        if not isinstance(model_dict, dict):
            logger.warning(f"set_model_cache expected dict-like model for key {cache_key}, got {type(model_dict)}")
            return False

        # Normalize Enum values to primitive .value
        for k, v in list(model_dict.items()):
            if isinstance(v, PyEnum):
                model_dict[k] = v.value

        # Store using RedisClient which will pickle dicts for safe retrieval
        redis_client.set(cache_key, model_dict, ex=expire_time)
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
