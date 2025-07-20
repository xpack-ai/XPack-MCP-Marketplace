"""
Cache utilities for Redis operations
"""

import json
import logging
import pickle
from typing import Optional, Any
from objtyping import to_primitive
from services.common.redis import redis_client
from services.common.utils.sqlalchemy_utils import SqlalchemyUtils

logger = logging.getLogger(__name__)


class CacheUtils:
    DEFAULT_CACHE_EXPIRE_TIME = 3600

    @staticmethod
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

    @staticmethod
    def get_cache(cache_key: str) -> Optional[Any]:
        """
        """
        try:
            return redis_client.get(cache_key)
        except Exception as e:
            logger.error(f"Cache/DB operation failed for key {cache_key}: {e}")
            return None

    @staticmethod
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

    @staticmethod
    def set_model_cache(cache_key: str, model: Any, expire_time: int = DEFAULT_CACHE_EXPIRE_TIME) -> bool:
        """
        """
        try:
            redis_client.set(cache_key, json.dumps(to_primitive(model)), ex=expire_time)
            return True
        except Exception as e:
            logger.error(f"Failed to set cache for key {cache_key}: {e}")
            return False

    @staticmethod
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

    @staticmethod
    def clear_pattern_cache(pattern: str) -> int:
        """
        Clear cache keys matching pattern

        Args:
            pattern: Pattern to match cache keys

        Returns:
            int: Number of keys cleared
        """
        try:
            logger.warning("Pattern cache clearing not implemented - use specific keys instead")
            return 0
        except Exception as e:
            logger.error(f"Failed to clear pattern cache for {pattern}: {e}")
            return 0

    # SQLAlchemy Model specific cache methods
    @staticmethod
    def get_sqlalchemy_cache(cache_key: str, model_class: type) -> Optional[Any]:
        """
        Get SQLAlchemy model from cache with proper deserialization

        Args:
            cache_key: Cache key
            model_class: SQLAlchemy model class

        Returns:
            Optional[Any]: Model instance or None if not found
        """
        try:
            cache_value = redis_client.get(cache_key)
            if cache_value:
                # Check if cache_value is already deserialized (dict) or needs deserialization (str)
                if isinstance(cache_value, dict):
                    model_data = cache_value
                elif isinstance(cache_value, str):
                    # Deserialize from pickled string data
                    model_data = pickle.loads(cache_value.encode('latin1'))
                else:
                    logger.warning(f"Unexpected cache value type for key {cache_key}: {type(cache_value)}")
                    return None
                    
                return SqlalchemyUtils.dict_to_model(model_class, model_data)
            return None
        except Exception as e:
            logger.error(f"Failed to get SQLAlchemy cache for key {cache_key}: {e}")
            return None

    @staticmethod
    def set_sqlalchemy_cache(cache_key: str, model: Any, expire_time: int = DEFAULT_CACHE_EXPIRE_TIME) -> bool:
        """
        Set SQLAlchemy model to cache with proper serialization

        Args:
            cache_key: Cache key
            model: SQLAlchemy model instance
            expire_time: Cache expiration time in seconds

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            model_dict = SqlalchemyUtils.model_to_dict(model)
            # Serialize using pickle for better type preservation
            serialized_data = pickle.dumps(model_dict).decode('latin1')
            redis_client.set(cache_key, serialized_data, ex=expire_time)
            return True
        except Exception as e:
            logger.error(f"Failed to set SQLAlchemy cache for key {cache_key}: {e}")
            return False

    @staticmethod
    def get_sqlalchemy_list_cache(cache_key: str, model_class: type) -> Optional[list]:
        """
        Get list of SQLAlchemy models from cache with proper deserialization

        Args:
            cache_key: Cache key
            model_class: SQLAlchemy model class

        Returns:
            Optional[list]: List of model instances or None if not found
        """
        try:
            cache_value = redis_client.get(cache_key)
            if cache_value:
                # Check if cache_value is already deserialized (list) or needs deserialization (str)
                if isinstance(cache_value, list):
                    model_list_data = cache_value
                elif isinstance(cache_value, str):
                    # Deserialize from pickled string data
                    model_list_data = pickle.loads(cache_value.encode('latin1'))
                else:
                    logger.warning(f"Unexpected cache value type for key {cache_key}: {type(cache_value)}")
                    return None
                    
                if isinstance(model_list_data, list):
                    return [SqlalchemyUtils.dict_to_model(model_class, item) for item in model_list_data]
            return None
        except Exception as e:
            logger.error(f"Failed to get SQLAlchemy list cache for key {cache_key}: {e}")
            return None

    @staticmethod
    def set_sqlalchemy_list_cache(cache_key: str, model_list: list, expire_time: int = DEFAULT_CACHE_EXPIRE_TIME) -> bool:
        """
        Set list of SQLAlchemy models to cache with proper serialization

        Args:
            cache_key: Cache key
            model_list: List of SQLAlchemy model instances
            expire_time: Cache expiration time in seconds

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not isinstance(model_list, list):
                logger.error(f"Expected list for cache key {cache_key}, got {type(model_list)}")
                return False
                
            model_dict_list = [SqlalchemyUtils.model_to_dict(model) for model in model_list]
            # Serialize using pickle for better type preservation
            serialized_data = pickle.dumps(model_dict_list).decode('latin1')
            redis_client.set(cache_key, serialized_data, ex=expire_time)
            return True
        except Exception as e:
            logger.error(f"Failed to set SQLAlchemy list cache for key {cache_key}: {e}")
            return False
