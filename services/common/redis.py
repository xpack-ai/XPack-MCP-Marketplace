import redis
from redis import Redis
from typing import Optional, Any
from .config import Config


class RedisClient:
    """Redis client wrapper providing basic Redis operations"""
    
    def __init__(self):
        """Initialize Redis connection"""
        try:
            self.client: Redis = redis.Redis(
                host=Config.REDIS_HOST,
                port=Config.REDIS_PORT,
                password=Config.REDIS_PASSWORD,
                db=Config.REDIS_DB,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            # Test connection
            self.client.ping()
        except redis.ConnectionError as e:
            raise ConnectionError(f"Cannot connect to Redis server: {e}")
        except Exception as e:
            raise Exception(f"Redis initialization failed: {e}")

    def set(self, key: str, value: Any, ex: Optional[int] = None) -> Any:
        """Set key-value pair with automatic serialization"""
        try:
            # Handle different value types
            if isinstance(value, (dict, list)):
                # For complex objects, use pickle serialization
                import pickle
                serialized_value = pickle.dumps(value).decode('latin1')
                return self.client.set(key, serialized_value, ex=ex)
            elif isinstance(value, str):
                return self.client.set(key, value, ex=ex)
            else:
                # For other types, convert to string
                return self.client.set(key, str(value), ex=ex)
        except redis.RedisError as e:
            raise Exception(f"Redis SET operation failed: {e}")

    def get(self, key: str) -> Any:
        """Get value by key with automatic deserialization"""
        try:
            result = self.client.get(key)
            if result is not None:
                # Try to deserialize if it's pickled data
                try:
                    import pickle
                    # Ensure result is string before encoding
                    if isinstance(result, str):
                        return pickle.loads(result.encode('latin1'))
                    else:
                        return result
                except:
                    # If not pickled, return as is
                    return result
            return None
        except redis.RedisError as e:
            raise Exception(f"Redis GET operation failed: {e}")

    def delete(self, key: str) -> Any:
        """Delete key"""
        try:
            return self.client.delete(key)
        except redis.RedisError as e:
            raise Exception(f"Redis DELETE operation failed: {e}")

    def exists(self, key: str) -> bool:
        """Check if key exists"""
        try:
            result = self.client.exists(key)
            return bool(result)
        except redis.RedisError as e:
            raise Exception(f"Redis EXISTS operation failed: {e}")

    def expire(self, key: str, seconds: int) -> Any:
        """Set key expiration time"""
        try:
            return self.client.expire(key, seconds)
        except redis.RedisError as e:
            raise Exception(f"Redis EXPIRE operation failed: {e}")

    def ttl(self, key: str) -> Any:
        """Get remaining TTL for key"""
        try:
            return self.client.ttl(key)
        except redis.RedisError as e:
            raise Exception(f"Redis TTL operation failed: {e}")

    def incr(self, key: str, amount: int = 1) -> Any:
        """Increment key value"""
        try:
            return self.client.incr(key, amount)
        except redis.RedisError as e:
            raise Exception(f"Redis INCR operation failed: {e}")
    
    # Redis Stream operations
    def xadd(self, stream: str, fields: dict, message_id: str = "*", maxlen: Optional[int] = None) -> str:
        """Add message to Redis Stream"""
        try:
            safe_fields = {}
            for k, v in fields.items():
                key = str(k)
                if isinstance(v, bytes):
                    try:
                        val = v.decode("utf-8")
                    except Exception:
                        val = v.decode("latin1", errors="ignore")
                elif isinstance(v, str):
                    val = v
                else:
                    val = str(v)
                safe_fields[key] = val
            resp = self.client.xadd(stream, safe_fields, id=message_id, maxlen=maxlen)
            if isinstance(resp, bytes):
                try:
                    return resp.decode("utf-8")
                except Exception:
                    return resp.decode("latin1", errors="ignore")
            if isinstance(resp, str):
                return resp
            raise TypeError("Redis XADD did not return str")
        except redis.RedisError as e:
            raise Exception(f"Redis XADD operation failed: {e}")

    def xread(self, streams: dict, count: Optional[int] = None, block: Optional[int] = None) -> list:
        """Read messages from Redis Streams"""
        try:
            resp = self.client.xread(streams, count=count, block=block)
            if isinstance(resp, list):
                return resp
            raise TypeError("Redis XREAD did not return list")
        except redis.RedisError as e:
            raise Exception(f"Redis XREAD operation failed: {e}")

    def xgroup_create(self, stream: str, group: str, id: str = "0", mkstream: bool = True) -> bool:
        """Create consumer group for Redis Stream"""
        try:
            resp = self.client.xgroup_create(stream, group, id=id, mkstream=mkstream)
            if resp in (True, "OK", b"OK"):
                return True
            return bool(resp)
        except redis.ResponseError as e:
            if "BUSYGROUP" in str(e):
                # Group already exists
                return True
            raise Exception(f"Redis XGROUP CREATE operation failed: {e}")
        except redis.RedisError as e:
            raise Exception(f"Redis XGROUP CREATE operation failed: {e}")

    def xreadgroup(self, group: str, consumer: str, streams: dict, count: Optional[int] = None, block: Optional[int] = None, noack: bool = False) -> list:
        """Read messages from Redis Stream using consumer group"""
        try:
            resp = self.client.xreadgroup(group, consumer, streams, count=count, block=block, noack=noack)
            if isinstance(resp, list):
                return resp
            raise TypeError("Redis XREADGROUP did not return list")
        except redis.RedisError as e:
            raise Exception(f"Redis XREADGROUP operation failed: {e}")

    def xack(self, stream: str, group: str, *message_ids) -> int:
        """Acknowledge processed messages in Redis Stream"""
        try:
            resp = self.client.xack(stream, group, *message_ids)
            if isinstance(resp, int):
                return resp
            raise TypeError("Redis XACK did not return int")
        except redis.RedisError as e:
            raise Exception(f"Redis XACK operation failed: {e}")

    def xlen(self, stream: str) -> int:
        """Get length of Redis Stream"""
        try:
            resp = self.client.xlen(stream)
            if isinstance(resp, int):
                return resp
            raise TypeError("Redis XLEN did not return int")
        except redis.RedisError as e:
            raise Exception(f"Redis XLEN operation failed: {e}")

    def xpending(self, stream: str, group: str) -> dict:
        """Get pending messages info for consumer group"""
        try:
            resp = self.client.xpending(stream, group)
            if isinstance(resp, dict):
                return resp
            raise TypeError("Redis XPENDING did not return dict")
        except redis.RedisError as e:
            raise Exception(f"Redis XPENDING operation failed: {e}")

    def xinfo_stream(self, stream: str) -> dict:
        """Get information about Redis Stream"""
        try:
            resp = self.client.xinfo_stream(stream)
            if isinstance(resp, dict):
                return resp
            raise TypeError("Redis XINFO STREAM did not return dict")
        except redis.RedisError as e:
            raise Exception(f"Redis XINFO STREAM operation failed: {e}")

    def xinfo_groups(self, stream: str) -> list:
        """Get consumer groups information for Redis Stream"""
        try:
            resp = self.client.xinfo_groups(stream)
            if isinstance(resp, list):
                return resp
            raise TypeError("Redis XINFO GROUPS did not return list")
        except redis.RedisError as e:
            raise Exception(f"Redis XINFO GROUPS operation failed: {e}")

    def close(self):
        """Close Redis connection"""
        try:
            self.client.close()
        except Exception as e:
            # Ignore close errors
            pass

    def __enter__(self):
        """Context manager entry"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()


# Global Redis client instance
redis_client = RedisClient()
