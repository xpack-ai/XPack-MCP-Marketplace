import stripe
import logging
from typing import Optional
from sqlalchemy.orm import Session
from services.admin_service.repositories.user_repository import UserRepository
from services.admin_service.repositories.user_wallet_repository import UserWalletRepository
from services.admin_service.repositories.user_wallet_history_repository import UserWalletHistoryRepository
from services.admin_service.services.payment_channel_service import PaymentChannelService
from services.admin_service.utils.alipay_client import AlipayClient
logger = logging.getLogger(__name__)


class PaymentService:

    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)
        self.user_wallet_repository = UserWalletRepository(db)
        self.user_wallet_history_repository = UserWalletHistoryRepository(db)
        self.payment_channel_service = PaymentChannelService(db)

    def _get_stripe_config(self) -> Optional[dict]:
        """Get Stripe configuration"""
        return self.payment_channel_service.get_stripe_config()

    def _configure_stripe_key(self) -> bool:
        """Configure Stripe API Key"""
        stripe_config = self._get_stripe_config()
        if not stripe_config:
            logger.error("Unable to get Stripe configuration")
            return False

        stripe.api_key = stripe_config.get("secret")
        return True


    logging = logging.getLogger(__name__)

    def create_stripe_payment_link(self, base_url: str, user_id: str, amount: float, currency: str = "usd") -> Optional[dict]:
        if not self._configure_stripe_key():
            raise RuntimeError("Stripe configuration error")

        # get user information
        user = self.user_repository.get_by_id(user_id)
        if not user:
            logger.error(f"User with ID {user_id} not found.")
            raise ValueError("User not found.")

        # create a new user wallet history entry for the deposit
        user_wallet_history = self.user_wallet_history_repository.add_deposit(user_id=user_id, amount=amount, payment_method="stripe")
        if user_wallet_history is None:
            logger.error("Failed to create user wallet history for deposit.")
            raise RuntimeError("Failed to create payment.")

        # create Stripe Checkout Session
        params = {
            "success_url": base_url,
            "client_reference_id": user_wallet_history.id,
            "line_items": [
                {
                    "price_data": {
                        "currency": currency,
                        "product_data": {"name": "One-Time Payment"},
                        "unit_amount": int(amount * 100),  # Convert amount to cents (note: some currencies like JPY don't need to multiply by 100)
                    },
                    "quantity": 1,
                }
            ],
            "customer_email": user.email,
            "mode": "payment",
        }

        try:
            session = stripe.checkout.Session.create(**params)
            return {"payment_link": session.url, "payment_id": user_wallet_history.id}
        except Exception as e:
            raise RuntimeError(f"Failed to create payment URL: {str(e)}")

    def stripe_payment_callback(self, payload: str, sig_header: str) -> bool:
        # Get Stripe configuration
        stripe_config = self._get_stripe_config()
        if not stripe_config:
            logger.error("Unable to get Stripe configuration, cannot verify webhook")
            return False

        webhook_secret = stripe_config.get("webhook_secret")
        if not webhook_secret:
            logger.error("Stripe webhook_secret configuration missing")
            return False

        try:
            # Verify Webhook signature
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except Exception as e:
            logger.error("Invalid payload or signature")
            return False

        # Handle payment success event
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            payment_id = session.get("client_reference_id")
            customer_email = session.get("customer_email")
            amount = session.get("amount_total") / 100  # Convert to actual amount
            currency = session.get("currency")
            payment_intent_id = session.get("payment_intent")

            logger.info(f"Payment succeeded: payment_id={payment_id}, email={customer_email}, amount={amount} {currency}")

            return self._add_wallet_balance(payment_id=payment_id, payment_channel_id=payment_intent_id)
        return False

    def create_alipay_payment_link(self,  user_id: str, amount: float, currency: str = "usd") -> Optional[dict]:
        config = self.payment_channel_service.get_config("alipay")
        if config is None or not config.get("enable"):
            logger.error("Alipay payment channel is not enabled or configured")
            return None
        # get user information
        user = self.user_repository.get_by_id(user_id)
        if not user:
            logger.error(f"User with ID {user_id} not found.")
            raise ValueError("User not found.")

        # create a new user wallet history entry for the deposit
        user_wallet_history = self.user_wallet_history_repository.add_deposit(user_id=user_id, amount=amount, payment_method="alipay")
        if user_wallet_history is None:
            logger.error("Failed to create user wallet history for deposit.")
            raise RuntimeError("Failed to create payment.")

        app_id = config.get("app_id")
        if not app_id:
            logger.error("Alipay app_id is not configured")
            return None
        app_private_key = config.get("app_private_key")
        if not app_private_key:
            logger.error("Alipay app_private_key is not configured")
            return None
        alipay_public_key = config.get("alipay_public_key")
        if not alipay_public_key:
            logger.error("Alipay alipay_public_key is not configured")
            return None
        client = AlipayClient(app_id, app_private_key, alipay_public_key)
        response_url = client.create_trade(out_trade_no= user_wallet_history.id, total_amount=amount, subject="One-Time Payment", body="Payment for service")
        return {"payment_link": response_url, "payment_id": user_wallet_history.id}

    def payment_callback(self, payment_id: str, payment_channel_id: str, status: int = 1) -> bool:
        """
        Handle Alipay payment webhook callback.
        Args:
            payment_id (str): The unique identifier for the payment.
            payment_channel_id (str): The identifier for the payment channel.
            status (int): The status of the payment, 1 for success, 2 for failure.
        """
        if not payment_id or not payment_channel_id:
            logger.error("Payment ID and Payment Channel ID cannot be empty")
            return False

        # Check if the transaction ID already exists
        if self.check_transaction_id_exists(payment_id):
            logger.error(f"Transaction ID {payment_id} already exists")
            return False
        if status == 1:
            # Add wallet balance and complete the deposit
            return self._add_wallet_balance(payment_id, payment_channel_id)
        self.user_wallet_history_repository.set_status(payment_id, payment_channel_id, status)
        return True


    def check_transaction_id_exists(self, transaction_id: str) -> bool:
        """
        Check if a transaction ID already exists in the user wallet history.

        Args:
            transaction_id (str): The transaction ID to check.

        Returns:
            bool: True if the transaction ID exists, False otherwise.
        """
        return self.user_wallet_history_repository.get_by_id(transaction_id) is not None

    def _add_wallet_balance(self, payment_id: str, payment_channel_id: str, max_retries: int = 3) -> bool:
        history = self.user_wallet_history_repository.get_by_id(payment_id)
        if history is None:
            logger.error(f"Payment history not found for payment_id {payment_id}")
            return False
        if history.status == 1:
            logger.warning(f"Payment history already completed for payment_id {payment_id}")
            return True
        user_id = history.user_id
        amount = history.amount
        user_wallet = self.user_wallet_repository.get_by_user_id(user_id)
        if not user_wallet:
            logger.error(f"User wallet not found for user_id {user_id}")
            return False

        # Retry mechanism for optimistic locking
        for attempt in range(max_retries):
            try:
                # Get current wallet with row-level lock
                current_wallet = self.user_wallet_repository.get_by_user_id_with_lock(user_id)
                if not current_wallet:
                    logger.error(f"User wallet not found for user_id {user_id}")
                    return False

                # Calculate new balance based on operation type
                new_balance = current_wallet.balance + amount

                # Atomic update with optimistic locking
                success = self.user_wallet_repository.update_balance_atomic(
                    user_id=user_id,
                    new_balance=new_balance,
                    expected_balance=current_wallet.balance
                )

                if success:
                    # Create wallet history record after successful balance update
                    return self.user_wallet_history_repository.deposit_complete(payment_id, payment_channel_id)
                else:
                    # Balance was modified by another transaction, retry
                    logger.warning(f"Balance conflict detected for user_id {user_id}, attempt {attempt + 1}")
                    continue
            except Exception as e:
                logger.error(f"Transaction failed for user_id {user_id}, attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries - 1:
                    logger.error(f"All retry attempts failed for user_id {user_id}")
                    return False
                continue

        logger.error(f"Failed to update balance after {max_retries} attempts for user_id {user_id}")
        return False

    def platform_payment(self, user_id: str, amount: float, transaction_id: str, typ: str = "incr", payment_method: str = "platform",  max_retries: int = 3) -> bool:
        """
        Process platform payment for user wallet with high-concurrency transaction safety.
        Args:
            user_id (str): User ID
            amount (float): Amount to add or reduce
            transaction_id (str): Unique transaction ID for the operation
            typ (str): Transaction type, "incr" for deposit, "reduce" for withdrawal, "set" for set balance
            max_retries (int): Maximum retry attempts for optimistic locking
        """
        if transaction_id == "":
            logger.error("Transaction ID cannot be empty")
            return False
        if self.user_wallet_history_repository.get_by_id(transaction_id) is not None:
            logger.error(f"Transaction ID {transaction_id} already exists")
            return False
        # Validate user wallet exists
        user_wallet = self.user_wallet_repository.get_by_user_id(user_id)
        if not user_wallet:
            logger.error(f"User wallet not found for user_id {user_id}")
            return False

        # Retry mechanism for optimistic locking
        for attempt in range(max_retries):
            try:
                # Get current wallet with row-level lock
                current_wallet = self.user_wallet_repository.get_by_user_id_with_lock(user_id)
                if not current_wallet:
                    logger.error(f"User wallet not found for user_id {user_id}")
                    return False
                
                # Calculate new balance based on operation type
                new_balance = current_wallet.balance
                match typ:
                    case "incr":
                        new_balance = current_wallet.balance + amount
                    case "set":
                        new_balance = amount
                    case _:
                        logger.error(f"Invalid transaction type: {typ}")
                        return False
                
                # Atomic update with optimistic locking
                success = self.user_wallet_repository.update_balance_atomic(
                    user_id=user_id, 
                    new_balance=new_balance,
                    expected_balance=current_wallet.balance
                )
                
                if success:
                    # Create wallet history record after successful balance update
                    try:
                        if typ == "incr":
                            self.user_wallet_history_repository.add_deposit(
                                user_id=user_id, amount=amount, payment_method=payment_method, transaction_id=transaction_id,status=1
                            )
                        elif typ == "set":
                            self.user_wallet_history_repository.set_balance(
                                user_id=user_id, amount=amount, payment_method=payment_method, transaction_id=transaction_id,status=1
                            )
                        
                        logger.info(f"Successfully updated balance for user_id {user_id}: {current_wallet.balance} -> {new_balance}")
                        return True
                        
                    except Exception as history_error:
                        logger.error(f"Failed to create wallet history for user_id {user_id}: {str(history_error)}")
                        # Balance was updated but history creation failed
                        # This is not critical for the balance update itself
                        return True
                else:
                    # Balance was modified by another transaction, retry
                    logger.warning(f"Balance conflict detected for user_id {user_id}, attempt {attempt + 1}")
                    continue
                    
            except Exception as e:
                logger.error(f"Transaction failed for user_id {user_id}, attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries - 1:
                    logger.error(f"All retry attempts failed for user_id {user_id}")
                    return False
                continue
        
        logger.error(f"Failed to update balance after {max_retries} attempts for user_id {user_id}")
        return False