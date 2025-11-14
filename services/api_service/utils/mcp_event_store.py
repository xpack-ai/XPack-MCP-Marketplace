import json

from mcp.server.streamable_http import (
    EventStore,
    EventId,
    StreamId,
    EventMessage,
    EventCallback,
)
from mcp.types import JSONRPCMessage
from services.common.redis import redis_client


class RedisEventStore(EventStore):
    def __init__(self, namespace: str, ttl_seconds: int = 900):
        self.namespace = namespace
        self.ttl_seconds = ttl_seconds

    # Typed helpers to normalize Redis sync results
    def _rpush(self, key: str, value: str) -> int:
        return int(redis_client.client.rpush(key, value))

    def _expire(self, key: str, seconds: int) -> None:
        try:
            redis_client.client.expire(key, int(seconds))
        except Exception:
            # Ignore expiration errors
            pass

    def _llen(self, key: str) -> int:
        return int(redis_client.client.llen(key) or 0)

    def _lrange(self, key: str, start: int, end: int) -> list[str]:
        items = redis_client.client.lrange(key, int(start), int(end))
        # decode_responses=True ensures str, but cast defensively
        return [str(i) for i in (items or [])]

    def _key(self, stream_id: StreamId) -> str:
        return f"xpack:mcp:event:{self.namespace}:{stream_id}"

    def _event_id(self, stream_id: StreamId, seq: int) -> EventId:
        return f"{stream_id}:{seq}"

    async def store_event(self, stream_id: StreamId, message: JSONRPCMessage) -> EventId:
        key = self._key(stream_id)
        payload = json.dumps(message.model_dump(by_alias=True, exclude_none=True))
        # Redis list append is synchronous
        seq: int = self._rpush(key, payload)
        # rpush returns new length; sequence index is length-1
        self._expire(key, self.ttl_seconds)
        return self._event_id(stream_id, seq - 1)

    async def replay_events_after(
        self,
        last_event_id: EventId,
        send_callback: EventCallback,
    ) -> StreamId | None:
        # Parse last_event_id of format "<stream_id>:<seq>"
        try:
            stream_id_str, seq_str = last_event_id.rsplit(":", 1)
            stream_id: StreamId = stream_id_str
            start_idx = int(seq_str) + 1
        except Exception:
            return None

        key = self._key(stream_id)
        try:
            length: int = self._llen(key)
        except Exception:
            # Redis unavailable or key type mismatch; cannot replay
            return stream_id
        if length <= 0 or start_idx >= length:
            return stream_id

        # Fetch range [start_idx, length-1]
        try:
            items: list[str] = self._lrange(key, start_idx, length - 1)
        except Exception:
            return stream_id
        for item in items:
            try:
                data = json.loads(item)
                msg = JSONRPCMessage.model_validate(data)
                # send_callback is async and expects EventMessage
                await send_callback(EventMessage(message=msg, event_id=None))
            except Exception:
                # Skip malformed entries
                continue
        return stream_id