import stripe
import logging
from typing import Optional
from sqlalchemy.orm import Session
import stripe.error
from services.admin_service.services import user_service
from services.admin_service.services import user_wallet_history_service
from services.common.models.user_wallet import UserWallet
from services.common.models.user_wallet_history import UserWalletHistory
from services.admin_service.repositories.user_repository import UserRepository
from services.admin_service.repositories.user_wallet_repository import UserWalletRepository
from services.admin_service.repositories.user_wallet_history_repository import UserWalletHistoryRepository
from services.admin_service.services.payment_channel_service import PaymentChannelService

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

            # Trigger fulfillment logic (example)
            try:
                return self.user_wallet_history_repository.deposit_complete(payment_id, payment_intent_id)
            except Exception as e:
                logger.error(f"Failed to fulfill order for payment_id={payment_id}: {str(e)}")
                return False

        # # Handle refund event
        # elif event["type"] == "charge.refunded":
        #     charge = event["data"]["object"]
        #     payment_id = charge.get("payment_intent")
        #     amount_refunded = charge.get("amount_refunded") / 100  # Convert to actual amount
        #     currency = charge.get("currency")

        #     logging.info(f"Refund processed: payment_id={payment_id}, amount_refunded={amount_refunded} {currency}")

        #     # Trigger refund processing logic (example)
        #     try:
        #         # process_refund(payment_id, amount_refunded)
        #         logging.info(f"Refund processed for payment_id={payment_id}")
        #     except Exception as e:
        #         logging.error(f"Failed to process refund for payment_id={payment_id}: {str(e)}")
        #         return False

        return False
