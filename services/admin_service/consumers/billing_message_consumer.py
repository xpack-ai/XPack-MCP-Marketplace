"""
RabbitMQ billing message consumer
"""

import json
import pika
import threading
import time
import logging
from typing import Callable
import os
from services.common.config import Config
from services.common.database import get_db
from services.admin_service.services.billing_message_handler import BillingMessageHandler

logger = logging.getLogger(__name__)


class BillingMessageConsumer:
    """Billing message consumer"""

    def __init__(self):
        self.queue_name = os.getenv("BILLING_QUEUE_NAME") or "billing.api.calls"
        self.retry_queue_name = f"{self.queue_name}.retry"
        self.connection = None
        self.channel = None
        self.consuming = False
        # retry times from env, default 3
        self.max_retries = int(os.getenv("BILLING_RETRY_TIMES", "3"))
        self.retry_base_delay_seconds = int(os.getenv("BILLING_RETRY_BASE_DELAY_SECONDS", "30"))
        self.retry_max_delay_seconds = int(os.getenv("BILLING_RETRY_MAX_DELAY_SECONDS", "1800"))
        self._setup_connection()

    def _setup_connection(self):
        """Setup RabbitMQ connection"""
        max_retries = 3
        retry_delay = 5

        for attempt in range(max_retries):
            try:
                credentials = pika.PlainCredentials(Config.RABBITMQ_USER, Config.RABBITMQ_PASSWORD)
                parameters = pika.ConnectionParameters(
                    host=Config.RABBITMQ_HOST,
                    port=Config.RABBITMQ_PORT,
                    virtual_host=Config.RABBITMQ_VHOST,
                    credentials=credentials,
                    heartbeat=600,  # Increase heartbeat interval
                    blocked_connection_timeout=300,  # Connection blocked timeout
                )

                self.connection = pika.BlockingConnection(parameters)
                self.channel = self.connection.channel()

                # Declare queue
                self.channel.queue_declare(queue=self.queue_name, durable=True)
                self.channel.queue_declare(
                    queue=self.retry_queue_name,
                    durable=True,
                    arguments={
                        "x-dead-letter-exchange": "",
                        "x-dead-letter-routing-key": self.queue_name,
                    },
                )

                # Set QoS, only process one message at a time
                self.channel.basic_qos(prefetch_count=1)

                logger.info("RabbitMQ connection established successfully")
                return

            except Exception as e:
                logger.error(f"Failed to establish RabbitMQ connection (attempt {attempt + 1}/{max_retries}): {str(e)}")

                if attempt < max_retries - 1:
                    logger.info(f"Waiting {retry_delay} seconds before retry...")
                    time.sleep(retry_delay)
                else:
                    logger.error("All connection attempts failed")
                    raise

    def start_consuming(self):
        """Start consuming messages"""
        try:
            # Ensure connection is established
            if not self.connection or self.connection.is_closed:
                self._setup_connection()

            if not self.channel:
                raise Exception("RabbitMQ channel is not available")

            self.consuming = True

            # Set message callback
            self.channel.basic_consume(queue=self.queue_name, on_message_callback=self._process_message, auto_ack=False)  # Manual ack

            logger.info(f"Start consuming queue: {self.queue_name}")
            logger.info("Consumer is now waiting for messages. Press CTRL+C to exit")

            # Periodically log heartbeat to ensure consumer thread is running
            import threading

            def log_heartbeat():
                while self.consuming:
                    time.sleep(30)  # Log heartbeat every 30 seconds
                    if self.consuming:
                        logger.info(f"Consumer heartbeat - listening on queue: {self.queue_name}")

            heartbeat_thread = threading.Thread(target=log_heartbeat, daemon=True)
            heartbeat_thread.start()

            self.channel.start_consuming()

        except KeyboardInterrupt:
            logger.info("Received interrupt signal, stopping consumption")
            self.stop_consuming()
        except Exception as e:
            logger.error(f"Exception occurred while consuming messages: {str(e)}", exc_info=True)
            raise

    def stop_consuming(self):
        """Stop consuming messages"""
        self.consuming = False
        if self.channel:
            self.channel.stop_consuming()
        if self.connection and not self.connection.is_closed:
            self.connection.close()
        logger.info("Message consumption stopped")

    def _process_message(self, channel, method, properties, body):
        """
        Process a single message

        Args:
            channel: Channel object
            method: Method object
            properties: Properties object
            body: Message body
        """
        message_data = None
        settled = False
        raw_body = body.decode("utf-8", errors="replace") if isinstance(body, (bytes, bytearray)) else str(body)

        def _safe_ack() -> None:
            nonlocal settled
            if settled:
                return
            settled = True
            try:
                channel.basic_ack(delivery_tag=method.delivery_tag)
            except Exception:
                logger.error("Failed to ack message", exc_info=True)

        def _safe_nack(requeue: bool) -> None:
            nonlocal settled
            if settled:
                return
            settled = True
            try:
                channel.basic_nack(delivery_tag=method.delivery_tag, requeue=requeue)
            except Exception:
                logger.error("Failed to nack message", exc_info=True)

        try:
            # Parse message
            message_data = json.loads(body)
            logger.info(f"Received billing message: user_id={message_data.get('user_id')}, tool={message_data.get('tool_name')}")

            # Get DB session and process message
            db = next(get_db())
            try:
                handler = BillingMessageHandler(db)
                success = handler.process_billing_message(message_data)

                if success:
                    # Ack if processed successfully
                    _safe_ack()
                    logger.info(f"Message processed and acknowledged: {message_data.get('user_id')}")
                else:
                    # Retry with limited attempts
                    retry_count = self._get_retry_count(properties)
                    if retry_count < self.max_retries:
                        try:
                            delay_ms = self._get_retry_delay_ms(retry_count)
                            self._publish_delayed_retry(channel, message_data, retry_count + 1, delay_ms)
                            _safe_ack()
                            logger.warning(
                                f"Message processing failed, scheduled retry {retry_count + 1}/{self.max_retries} after {delay_ms}ms: {message_data.get('user_id')}, tool={message_data.get('tool_name')}, "
                            )
                        except Exception as pub_err:
                            logger.error(f"Failed to requeue message for retry: {pub_err}", exc_info=True)
                            # Requeue original message
                            _safe_nack(requeue=True)
                    else:
                        # Exceeded retries; ack and drop
                        _safe_ack()
                        self._log_retry_exceeded(
                            reason="handler_returned_false",
                            retry_count=retry_count,
                            properties=properties,
                            method=method,
                            message_data=message_data,
                            raw_body=raw_body,
                        )

            finally:
                try:
                    db.close()
                except Exception:
                    logger.error("Failed to close db session", exc_info=True)

        except json.JSONDecodeError as e:
            logger.error(f"Message format error: {str(e)}, body: {body}")
            # Format error, ack directly (do not requeue)
            _safe_ack()

        except Exception as e:
            logger.error(f"Exception occurred while processing message: {str(e)}", exc_info=True)
            try:
                retry_count = self._get_retry_count(properties)
                if message_data is not None and retry_count < self.max_retries:
                    delay_ms = self._get_retry_delay_ms(retry_count)
                    self._publish_delayed_retry(channel, message_data, retry_count + 1, delay_ms, error=str(e))
                    _safe_ack()
                    logger.warning(
                        f"Exception during processing, scheduled retry {retry_count + 1}/{self.max_retries} after {delay_ms}ms: {message_data.get('user_id')}"
                    )
                else:
                    _safe_ack()
                    self._log_retry_exceeded(
                        reason="exception",
                        retry_count=retry_count,
                        properties=properties,
                        method=method,
                        message_data=message_data,
                        error=str(e),
                        raw_body=raw_body,
                    )
            except:
                # If even ack fails, log error but do not raise
                logger.error("Unable to acknowledge message", exc_info=True)

    def _get_retry_count(self, properties):
        """
        Get message retry count

        Args:
            properties: Message properties

        Returns:
            int: Retry count
        """
        if properties and properties.headers:
            raw = properties.headers.get("x-retry-count", 0)
            try:
                return int(raw)
            except Exception:
                return 0
        return 0

    def _get_retry_delay_ms(self, current_retry_count: int) -> int:
        delay_seconds = self.retry_base_delay_seconds * (2 ** current_retry_count)
        if delay_seconds > self.retry_max_delay_seconds:
            delay_seconds = self.retry_max_delay_seconds
        return int(delay_seconds * 1000)

    def _publish_delayed_retry(self, channel, message_data: dict, next_retry_count: int, delay_ms: int, error: str | None = None) -> None:
        headers: dict[str, str | int] = {"x-retry-count": next_retry_count}
        if error:
            headers["x-last-error"] = error
        props = pika.BasicProperties(
            delivery_mode=2,
            headers=headers,
            expiration=str(delay_ms),
        )
        channel.basic_publish(exchange="", routing_key=self.retry_queue_name, body=json.dumps(message_data), properties=props)

    def _log_retry_exceeded(self, reason: str, retry_count: int, properties, method, message_data: dict | None, error: str | None = None, raw_body: str | None = None) -> None:
        headers = {}
        if properties and properties.headers:
            try:
                headers = dict(properties.headers)
            except Exception:
                headers = {}
        event = {
            "reason": reason,
            "retry_count": retry_count,
            "max_retries": self.max_retries,
            "queue": self.queue_name,
            "routing_key": getattr(method, "routing_key", None),
            "delivery_tag": getattr(method, "delivery_tag", None),
            "headers": headers,
            "user_id": (message_data or {}).get("user_id"),
            "service_id": (message_data or {}).get("service_id"),
            "api_id": (message_data or {}).get("api_id"),
            "tool_name": (message_data or {}).get("tool_name"),
            "call_start_time": (message_data or {}).get("call_start_time"),
            "call_end_time": (message_data or {}).get("call_end_time"),
        }
        if error:
            event["error"] = error
        if raw_body is not None:
            event["raw_body"] = raw_body
        try:
            payload = json.dumps(event, ensure_ascii=False, default=str)
        except Exception:
            payload = repr(event)
        logger.error(f"ALERT billing message retries exceeded: {payload}")


def start_billing_consumer():
    """Start billing message consumer"""
    consumer = BillingMessageConsumer()
    consumer.start_consuming()


if __name__ == "__main__":
    start_billing_consumer()
