"""
Billing service - Handle user API call billing logic
"""

import json
import uuid
import asyncio
from datetime import datetime, timezone
from decimal import Decimal
from typing import Tuple, Optional
from contextlib import asynccontextmanager

from services.common.redis import redis_client
from services.common.rabbitmq import rabbitmq_client
from services.common.models.billing import BillingMessage, PreDeductResult, ApiCallLogInfo
from services.common.models.mcp_service import ChargeType
from services.common.models.user_wallet import UserWallet
from services.common.database import get_db
from services.api_service.repositories.mcp_service_repository import McpServiceRepository
from services.api_service.repositories.user_wallet_repository import UserWalletRepository
from services.common.logging_config import get_logger

logger = get_logger(__name__)


class BillingService:
    """Billing service class"""

    # Configuration constants
    BILLING_LOCK_TIMEOUT = 5  # Distributed lock timeout (seconds)
    WALLET_CACHE_EXPIRE = 300  # Wallet cache expiration time (seconds)
    SERVICE_CACHE_EXPIRE = 3600  # Service price cache expiration time (seconds)
    BILLING_QUEUE_NAME = "billing.api.calls"

    def __init__(self):
        self.redis = redis_client
        self.rabbitmq = rabbitmq_client

    async def check_and_pre_deduct(self, user_id: str, service_id: str, tool_name: str) -> PreDeductResult:
        """
        Check balance and perform pre-deduction

        Args:
            user_id: User ID
            service_id: Service ID
            tool_name: Tool name

        Returns:
            PreDeductResult: Pre-deduction result
        """
        try:
            # Get service price information
            price, input_token_price, output_token_price, charge_type = await self._get_service_price(service_id)
            service_price = price
            match charge_type:
                case ChargeType.FREE:
                    logger.info(f"Free service, skip billing check - User ID: {user_id}, Service ID: {service_id}")
                    return PreDeductResult(
                        success=True,
                        message="Free service",
                        service_price=Decimal("0"),
                        user_balance=Decimal("0"),
                        input_token_price=input_token_price,
                        output_token_price=output_token_price,
                        charge_type=charge_type.value
                    )
                case ChargeType.PER_TOKEN:
                    # 计算预估费用（按每百万Token计费）
                    estimated_input_cost = (Decimal(100) / Decimal("1000000")) * input_token_price
                    estimated_output_cost = (Decimal(500) / Decimal("1000000")) * output_token_price
                    service_price = estimated_input_cost + estimated_output_cost

            async with self._acquire_billing_lock(user_id):
                # Get user balance
                user_balance = await self._get_user_wallet_balance(user_id)

                # Check if balance is sufficient
                if user_balance < service_price:
                    logger.warning(f"User balance insufficient - User ID: {user_id}, Balance: {user_balance}, Required: {service_price}")
                    return PreDeductResult(
                        success=False,
                        message=f"Insufficient balance, current balance: {user_balance}, required: {service_price}",
                        service_price=service_price,
                        user_balance=user_balance,
                        input_token_price=input_token_price,
                        output_token_price=output_token_price,
                        charge_type=charge_type.value
                    )

                # Pre-deduct amount in Redis
                new_balance = user_balance - service_price
                await self._update_wallet_cache(user_id, new_balance)

                logger.info(f"Pre-deduction successful - User ID: {user_id}, Deduction: {service_price}, Balance: {user_balance} -> {new_balance}")
                return PreDeductResult(
                    success=True,
                    message="Pre-deduction successful",
                    service_price=service_price,
                    user_balance=new_balance,
                    input_token_price=input_token_price,
                    output_token_price=output_token_price,
                    charge_type=charge_type.value
                )

        except Exception as e:
            logger.error(f"Pre-deduction check failed - User ID: {user_id}, Service ID: {service_id}: {str(e)}", exc_info=True)
            return PreDeductResult(
                success=False,
                message=f"System error: {str(e)}",
                service_price=Decimal("0"),
                user_balance=Decimal("0"),
                input_token_price=Decimal("0"),
                output_token_price=Decimal("0"),
                charge_type=ChargeType.FREE.value
            )

    async def send_billing_message(self, call_log: ApiCallLogInfo, call_success: bool, call_end_time: datetime) -> None:
        """
        Send billing message to RabbitMQ

        Args:
            call_log: API call log information
            call_success: Whether the call was successful
            call_end_time: Call end time
        """
        try:
            message = BillingMessage(
                user_id=call_log.user_id,
                service_id=call_log.service_id,
                api_id=call_log.api_id,
                tool_name=call_log.tool_name,
                input_params=call_log.input_params,
                call_success=call_success,
                unit_price=call_log.unit_price,
                call_start_time=call_log.call_start_time,
                call_end_time=call_end_time,
                apikey_id=call_log.apikey_id,
            )

            # Serialize message
            message_json = json.dumps(
                {
                    "user_id": message.user_id,
                    "service_id": message.service_id,
                    "api_id": message.api_id,
                    "tool_name": message.tool_name,
                    "input_params": message.input_params,
                    "call_success": message.call_success,
                    "unit_price": str(message.unit_price),
                    "call_start_time": message.call_start_time.isoformat(),
                    "call_end_time": message.call_end_time.isoformat() if message.call_end_time else None,
                    "apikey_id": message.apikey_id,
                }
            )

            # Send to RabbitMQ
            self.rabbitmq.publish(self.BILLING_QUEUE_NAME, message_json)
            logger.info(f"Billing message sent successfully - User ID: {call_log.user_id}, Tool: {call_log.tool_name}")

        except Exception as e:
            logger.error(f"Failed to send billing message: {str(e)}", exc_info=True)
            # Consider saving failed messages to local queue for retry

    async def _get_service_price(self, service_id: str) -> Tuple[Decimal, Decimal, Decimal, ChargeType]:
        """
        Get service price and charge type

        Args:
            service_id: Service ID

        Returns:
            Tuple[Decimal, ChargeType]: Price and charge type
        """
        # Try to get from Redis cache
        cache_key = f"service:price:{service_id}"
        cached_data = self.redis.get(cache_key)
        if cached_data:
            try:
                data = json.loads(cached_data)
                return Decimal(data["price"]), Decimal(data["input_token_price"]), Decimal(data["output_token_price"]), ChargeType(data["charge_type"])
            except (json.JSONDecodeError, KeyError, ValueError):
                logger.warning(f"Service price cache data anomaly, re-fetch from database - Service ID: {service_id}")

        # Get from database
        db = next(get_db())
        try:
            service_repo = McpServiceRepository(db)
            service = service_repo.get_by_id(service_id)

            if not service:
                raise ValueError(f"Service not found: {service_id}")

            price = Decimal(str(service.price))
            input_token_price = Decimal(str(service.input_token_price))
            output_token_price = Decimal(str(service.output_token_price))
            charge_type = service.charge_type

            # Cache to Redis
            cache_data = {
                "price": str(price),
                "input_token_price": str(input_token_price),
                "output_token_price":str(output_token_price),
                "charge_type": charge_type.value
            }
            self.redis.set(cache_key, json.dumps(cache_data), ex=self.SERVICE_CACHE_EXPIRE)

            return price,input_token_price,output_token_price, charge_type

        finally:
            db.close()

    async def _get_user_wallet_balance(self, user_id: str) -> Decimal:
        """
        Get user wallet balance

        Args:
            user_id: User ID

        Returns:
            Decimal: User balance
        """
        # Try to get from Redis cache
        cache_key = f"wallet:balance:{user_id}"
        cached_balance = self.redis.get(cache_key)

        if cached_balance:
            try:
                return Decimal(cached_balance)
            except (ValueError, TypeError):
                logger.warning(f"Wallet balance cache data anomaly, re-fetch from database - User ID: {user_id}")

        # Get from database
        db = next(get_db())
        try:
            wallet_repo = UserWalletRepository(db)
            wallet = wallet_repo.get_by_user_id(user_id)

            if not wallet:
                # User wallet doesn't exist, create a new one
                wallet = wallet_repo.create(user_id)
                logger.info(f"Created new wallet for user - User ID: {user_id}")

            balance = Decimal(str(wallet.balance))

            # Cache to Redis
            self.redis.set(cache_key, str(balance), ex=self.WALLET_CACHE_EXPIRE)

            return balance

        finally:
            db.close()

    async def _update_wallet_cache(self, user_id: str, new_balance: Decimal) -> None:
        """
        Update wallet balance cache

        Args:
            user_id: User ID
            new_balance: New balance
        """
        cache_key = f"wallet:balance:{user_id}"
        self.redis.set(cache_key, str(new_balance), ex=self.WALLET_CACHE_EXPIRE)

    @asynccontextmanager
    async def _acquire_billing_lock(self, user_id: str):
        """
        Acquire billing distributed lock

        Args:
            user_id: User ID

        Yields:
            Lock context
        """
        lock_key = f"billing:lock:{user_id}"
        lock_value = str(uuid.uuid4())

        try:
            # Try to acquire lock (using Redis SET command with NX and EX options)
            lua_script = """
            return redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[2])
            """
            acquired = self.redis.client.eval(lua_script, 1, lock_key, lock_value, str(self.BILLING_LOCK_TIMEOUT))
            if not acquired:
                raise Exception(f"Cannot acquire billing lock, user may have other operations in progress - User ID: {user_id}")

            logger.debug(f"Acquired billing lock successfully - User ID: {user_id}")
            yield

        finally:
            # Release lock (only the process holding the lock can release it)
            lua_script = """
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
            """
            self.redis.client.eval(lua_script, 1, lock_key, lock_value)
            logger.debug(f"Released billing lock - User ID: {user_id}")


# Global instance
billing_service = BillingService()
