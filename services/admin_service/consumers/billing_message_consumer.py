"""
RabbitMQ billing message consumer
"""

import json
import pika
import threading
import time
import logging
from typing import Callable

from services.common.config import Config
from services.common.database import get_db
from services.admin_service.services.billing_message_handler import BillingMessageHandler

logger = logging.getLogger(__name__)


class BillingMessageConsumer:
    """Billing message consumer"""

    def __init__(self):
        self.queue_name = "billing.api.calls"
        self.connection = None
        self.channel = None
        self.consuming = False
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
                    channel.basic_ack(delivery_tag=method.delivery_tag)
                    logger.info(f"Message processed and acknowledged: {message_data.get('user_id')}")
                else:
                    # If failed, ack and drop (avoid infinite retry)
                    channel.basic_ack(delivery_tag=method.delivery_tag)
                    logger.error(f"Message processing failed, message dropped: {message_data.get('user_id')}")

            finally:
                db.close()

        except json.JSONDecodeError as e:
            logger.error(f"Message format error: {str(e)}, body: {body}")
            # Format error, ack directly (do not requeue)
            channel.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            logger.error(f"Exception occurred while processing message: {str(e)}", exc_info=True)
            # On exception, ack and drop (avoid infinite retry)
            try:
                channel.basic_ack(delivery_tag=method.delivery_tag)
                logger.error(f"Exception handling failed, message dropped")
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
            return properties.headers.get("x-retry-count", 0)
        return 0


def start_billing_consumer():
    """Start billing message consumer"""
    consumer = BillingMessageConsumer()
    consumer.start_consuming()


if __name__ == "__main__":
    start_billing_consumer()
