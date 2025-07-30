"""
Billing message handler service
"""

import json
import uuid
import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session

from services.common.models.billing import BillingMessage
from services.common.models.mcp_call_log import McpCallLog, ProcessStatus
from services.common.models.user_wallet_history import UserWalletHistory, TransactionType, PaymentMethod
from services.admin_service.repositories.mcp_call_log_repository import McpCallLogRepository
from services.admin_service.repositories.user_wallet_repository import UserWalletRepository
from services.admin_service.repositories.user_wallet_history_repository import UserWalletHistoryRepository
from services.common.redis import redis_client

logger = logging.getLogger(__name__)


class BillingMessageHandler:
    """Billing message handler"""

    def __init__(self, db: Session):
        self.db = db
        self.call_log_repo = McpCallLogRepository(db)
        self.wallet_repo = UserWalletRepository(db)
        self.wallet_history_repo = UserWalletHistoryRepository(db)
        self.redis = redis_client

    def process_billing_message(self, message_data: dict) -> bool:
        """
        Process billing message

        Args:
            message_data: Message data

        Returns:
            bool: Whether processing was successful
        """
        try:
            # Parse message
            billing_message = self._parse_message(message_data)
            if not billing_message:
                return False

            # Create API call log
            call_log_id = self._create_call_log(billing_message)
            if not call_log_id:
                return False

            # Process billing logic
            if billing_message.call_success and billing_message.unit_price > 0:
                success = self._process_billing(billing_message, call_log_id)
                if not success:
                    # Update record status to failed
                    self.call_log_repo.update_status(call_log_id, ProcessStatus.FAILED, "Billing processing failed")
                    return False

            # Update record status to processed
            self.call_log_repo.update_status(call_log_id, ProcessStatus.PROCESSED)
            logger.info(f"Billing message processed successfully - User ID: {billing_message.user_id}, Tool: {billing_message.tool_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to process billing message: {str(e)}", exc_info=True)
            return False

    def _parse_message(self, message_data: dict) -> Optional[BillingMessage]:
        """
        Parse RabbitMQ message

        Args:
            message_data: Message data

        Returns:
            Optional[BillingMessage]: Parsed billing message
        """
        try:
            call_start_time = datetime.fromisoformat(message_data["call_start_time"].replace("Z", "+00:00"))
            call_end_time = None
            if message_data.get("call_end_time"):
                call_end_time = datetime.fromisoformat(message_data["call_end_time"].replace("Z", "+00:00"))

            return BillingMessage(
                user_id=message_data["user_id"],
                service_id=message_data["service_id"],
                api_id=message_data["api_id"],
                tool_name=message_data["tool_name"],
                input_params=message_data["input_params"], 
                call_success=message_data["call_success"],
                unit_price=Decimal(message_data["unit_price"]),
                input_token=Decimal(message_data["input_token"]),
                output_token=Decimal(message_data["output_token"]),
                charge_type=message_data["charge_type"],
                call_start_time=call_start_time,
                call_end_time=call_end_time,
                apikey_id=message_data.get("apikey_id"),  # Support older version messages that don't have this field
            )
        except (KeyError, ValueError, TypeError) as e:
            logger.error(f"Failed to parse message: {str(e)}, message content: {message_data}")
            return None

    def _create_call_log(self, billing_message: BillingMessage) -> Optional[str]:
        """
        Create API call log record

        Args:
            billing_message: Billing message

        Returns:
            Optional[str]: Created record ID
        """
        try:
            log_id = str(uuid.uuid4())
            call_log = McpCallLog(
                id=log_id,
                user_id=billing_message.user_id,
                service_id=billing_message.service_id,
                api_id=billing_message.api_id,
                tool_name=billing_message.tool_name,
                input_params=billing_message.input_params,
                call_success=billing_message.call_success,
                unit_price=float(billing_message.unit_price),
                actual_cost=0.0,  # Initially 0, updated later
                call_start_time=billing_message.call_start_time,
                call_end_time=billing_message.call_end_time,
                process_status=ProcessStatus.PENDING,
                apikey_id=billing_message.apikey_id,
            )

            created_log = self.call_log_repo.create(call_log)
            return created_log.id

        except Exception as e:
            logger.error(f"Failed to create API call log record: {str(e)}")
            return None

    def _process_billing(self, billing_message: BillingMessage, call_log_id: str) -> bool:
        """
        Process actual billing logic

        Args:
            billing_message: Billing message
            call_log_id: Call log ID

        Returns:
            bool: Whether processing was successful
        """
        try:
            user_id = billing_message.user_id
            amount = billing_message.unit_price

            # Get user wallet
            wallet = self.wallet_repo.get_by_user_id(user_id)
            if not wallet:
                logger.error(f"User wallet not found - User ID: {user_id}")
                return False

            current_balance = Decimal(str(wallet.balance))

            # Check if balance is sufficient (theoretically already pre-deducted, but check again to ensure data consistency)
            if current_balance < amount:
                logger.warning(f"Insufficient balance for billing - User ID: {user_id}, Balance: {current_balance}, Required: {amount}")
                return False

            # Execute deduction
            new_balance = current_balance - amount
            success = self.wallet_repo.update_balance(user_id, float(new_balance))
            if not success:
                logger.error(f"Failed to update user wallet balance - User ID: {user_id}")
                return False

            # Create wallet change history record
            history_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc)
            wallet_history = UserWalletHistory(
                id=history_id,
                user_id=user_id,
                payment_method=PaymentMethod.PLATFORM,
                amount=float(-amount),  # Negative value indicates deduction
                balance_after=float(new_balance),
                type=TransactionType.API_CALL,
                status=1,  # Completed
                transaction_id=call_log_id,
                channel_user_id=None,
                callback_data=json.dumps(self._billing_message_to_dict(billing_message)),
                created_at=now,
                updated_at=now,
            )

            created_history = self.wallet_history_repo.add_consume_record(wallet_history)
            if not created_history:
                logger.error(f"Failed to create wallet history record - User ID: {user_id}")
                # Rollback balance update
                self.wallet_repo.update_balance(user_id, float(current_balance))
                return False

            logger.info(f"Wallet history record created successfully - User ID: {user_id}, History ID: {history_id}, Created at: {now}")

            # Update API call record's actual deduction amount and associated history record ID
            self.call_log_repo.update_status(call_log_id, ProcessStatus.PROCESSED, None, history_id)

            # Update wallet balance cache in Redis
            self._update_wallet_cache(user_id, new_balance)

            logger.info(
                f"Billing processing completed successfully - User ID: {user_id}, Amount deducted: {amount}, Balance: {current_balance} -> {new_balance}"
            )
            return True

        except Exception as e:
            logger.error(f"Billing processing failed - User ID: {billing_message.user_id}: {str(e)}", exc_info=True)
            return False

    def _update_wallet_cache(self, user_id: str, new_balance: Decimal) -> None:
        """
        Update wallet balance cache in Redis

        Args:
            user_id: User ID
            new_balance: New balance
        """
        try:
            cache_key = f"wallet:balance:{user_id}"
            self.redis.set(cache_key, str(new_balance), ex=300)  # 5 minutes expiration
        except Exception as e:
            logger.warning(f"Failed to update wallet cache - User ID: {user_id}: {str(e)}")
            # Cache update failure doesn't affect main flow

    def _billing_message_to_dict(self, billing_message: BillingMessage) -> dict:
        """
        Convert BillingMessage to JSON serializable dictionary

        Args:
            billing_message: BillingMessage object

        Returns:
            dict: JSON serializable dictionary
        """
        return {
            "user_id": billing_message.user_id,
            "service_id": billing_message.service_id,
            "api_id": billing_message.api_id,
            "tool_name": billing_message.tool_name,
            "input_params": billing_message.input_params,
            "call_success": billing_message.call_success,
            "unit_price": str(billing_message.unit_price),
            "input_token": str(billing_message.input_token),
            "output_token": str(billing_message.output_token),
            "charge_type": billing_message.charge_type,
            "call_start_time": billing_message.call_start_time.isoformat(),
            "call_end_time": billing_message.call_end_time.isoformat() if billing_message.call_end_time else None,
            "call_log_id": billing_message.call_log_id,
            "apikey_id": billing_message.apikey_id,
        }
