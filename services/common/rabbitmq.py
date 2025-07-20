import pika
import logging
from .config import Config

logger = logging.getLogger(__name__)


class RabbitMQClient:
    def __init__(self):
        self.connection = None
        self.channel = None
        self._setup_connection()

    def _setup_connection(self):
        """Establish RabbitMQ connection"""
        try:
            credentials = pika.PlainCredentials(Config.RABBITMQ_USER, Config.RABBITMQ_PASSWORD)
            parameters = pika.ConnectionParameters(
                host=Config.RABBITMQ_HOST,
                port=Config.RABBITMQ_PORT,
                virtual_host=Config.RABBITMQ_VHOST,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300,
            )
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            logger.info("RabbitMQ connection established successfully")
        except Exception as e:
            logger.error(f"Failed to establish RabbitMQ connection: {str(e)}")
            raise

    def publish(self, queue: str, message: str, persistent: bool = True):
        """Publish message to queue"""
        try:
            # Ensure connection is available
            if not self.connection or self.connection.is_closed:
                self._setup_connection()

            if not self.channel:
                raise Exception("RabbitMQ channel is not available")

            # Declare queue (durable)
            self.channel.queue_declare(queue=queue, durable=True)

            # Publish message
            properties = None
            if persistent:
                properties = pika.BasicProperties(delivery_mode=2)

            self.channel.basic_publish(exchange="", routing_key=queue, body=message, properties=properties)
            logger.info(f"Message successfully published to queue: {queue}, message length: {len(message)} bytes")

        except Exception as e:
            logger.error(f"Message publish failed: {str(e)}")
            # Attempt reconnection
            try:
                self._setup_connection()
                if not self.channel:
                    raise Exception("Unable to establish RabbitMQ channel")

                # Retry sending
                self.channel.queue_declare(queue=queue, durable=True)
                properties = pika.BasicProperties(delivery_mode=2) if persistent else None
                self.channel.basic_publish(exchange="", routing_key=queue, body=message, properties=properties)
                logger.info(f"Message retry successful to queue {queue}")
            except Exception as retry_error:
                logger.error(f"Message retry failed: {str(retry_error)}")
                raise

    def close(self):
        """Close connection"""
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                logger.info("RabbitMQ connection closed")
        except Exception as e:
            logger.warning(f"Error closing RabbitMQ connection: {str(e)}")


rabbitmq_client = RabbitMQClient()
