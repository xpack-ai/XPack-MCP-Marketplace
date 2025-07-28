import logging
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from services.common.models.user_wallet_history import UserWalletHistory
from services.common.models.user_wallet import UserWallet
from services.common.models.user_wallet_history import TransactionType, PaymentMethod
from services.common.redis import redis_client
from uuid import uuid4
from datetime import datetime, timezone


class UserWalletHistoryRepository:
    """
    Repository for managing user wallet history records.
    Handles deposit, refund, and consumption transaction history.
    """

    # Cache configuration constants
    WALLET_CACHE_EXPIRE = 300  # Wallet cache expiration time (seconds), keep consistent with billing_service
    WALLET_LOCK_TIMEOUT = 5  # Wallet lock timeout (seconds)

    logging = logging.getLogger(__name__)

    def __init__(self, db: Session):
        self.db = db
        self.redis = redis_client
        self._lock_values = {}  # Store lock values for proper release

    def add_deposit(self, user_id: str, amount: float, payment_method: str) -> UserWalletHistory:
        """
        Create a new deposit record.

        Args:
            user_id: User ID
            amount: Deposit amount
            payment_method: Payment method

        Returns:
            UserWalletHistory: Created deposit record
        """
        now = datetime.now(timezone.utc)
        history = UserWalletHistory(
            id=str(uuid4()),
            user_id=user_id,
            payment_method=PaymentMethod(payment_method),
            amount=amount,
            balance_after=0.00,
            type=TransactionType.DEPOSIT,
            status=0,
            transaction_id=None,
            channel_user_id=None,
            created_at=now,
            updated_at=now,
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def add_refund(self, user_id: str, amount: float, payment_method: str, transaction_id: str) -> UserWalletHistory:
        """
        Create a new refund record.

        Args:
            user_id: User ID
            amount: Refund amount
            payment_method: Payment method
            transaction_id: Transaction ID from payment platform

        Returns:
            UserWalletHistory: Created refund record
        """
        now = datetime.now(timezone.utc)
        history = UserWalletHistory(
            id=str(uuid4()),
            user_id=user_id,
            payment_method=PaymentMethod(payment_method),
            amount=amount,
            balance_after=0.00,
            type=TransactionType.REFUND,
            status=0,  # 0=new, 1=completed, 2=refunded
            transaction_id=transaction_id,
            channel_user_id=None,
            created_at=now,
            updated_at=now,
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def deposit_complete(self, id: str, transaction_id: str) -> bool:
        """
        Mark deposit order as completed and safely update balance_after.

        Args:
            id: Primary key ID of user_wallet_history
            transaction_id: Payment platform transaction ID, optional

        Returns:
            bool: True if success, False if not found or failed
        """
        try:
            # First check order status without lock to fail fast
            obj = self.db.query(UserWalletHistory).filter(UserWalletHistory.id == id).first()
            if not obj:
                self.logging.error(f"UserWalletHistory not found: id={id}")
                return False

            # Check if order is already completed to avoid duplicate processing
            if obj.status == 1:
                self.logging.warning(f"Order already completed: id={id}")
                return True

            # Only process deposit type orders
            if obj.type != TransactionType.DEPOSIT:
                self.logging.error(f"Order type is not deposit: id={id}, type={obj.type}")
                return False

            user_id = obj.user_id

            # Use shorter lock timeout and retry mechanism for better concurrency
            max_retries = 3
            retry_count = 0
            lock_acquired = False  # Initialize variable

            while retry_count < max_retries:
                lock_acquired = self._acquire_wallet_lock_with_timeout(user_id, timeout=2)  # Shorter timeout
                if lock_acquired:
                    break

                retry_count += 1
                if retry_count < max_retries:
                    # Short delay before retry
                    import time

                    time.sleep(0.1 * retry_count)  # Exponential backoff
                    self.logging.debug(f"Retrying wallet lock acquisition - User ID: {user_id}, Attempt: {retry_count + 1}")

            if not lock_acquired:
                self.logging.error(f"Failed to acquire wallet lock after {max_retries} attempts - User ID: {user_id}")
                return False

            try:
                # Re-check with lock to ensure consistency
                obj = self.db.query(UserWalletHistory).filter(UserWalletHistory.id == id).with_for_update().first()
                if not obj or obj.status == 1:
                    self.logging.warning(f"Order status changed during lock acquisition: id={id}")
                    return obj is not None and obj.status == 1

                wallet = self.db.query(UserWallet).filter(UserWallet.user_id == user_id).with_for_update().first()
                if not wallet:
                    self.logging.error(f"UserWallet not found: user_id={user_id}")
                    return False

                # Update wallet balance and order status
                wallet.balance = float(wallet.balance) + float(obj.amount)
                obj.status = 1  # 1=completed
                obj.balance_after = float(wallet.balance)
                obj.transaction_id = transaction_id

                self.db.commit()

                # Update wallet balance cache in Redis after successful database update
                self._update_wallet_cache_async(user_id, wallet.balance)

                self.logging.info(f"Deposit completed successfully: id={id}, amount={obj.amount}, new_balance={wallet.balance}")
                return True

            finally:
                # Always release the lock
                self._release_wallet_lock(user_id)

        except Exception as e:
            self.logging.error(f"Error completing deposit: id={id}, error={str(e)}")
            self.db.rollback()
            return False

    def success_order_list(self, offset: int, limit: int) -> tuple[int, list[UserWalletHistory]]:
        """
        Get list of successful orders.

        Args:
            offset: Offset for pagination
            limit: Limit for pagination

        Returns:
            tuple: (total_count, order_list)
        """
        total = self.db.query(UserWalletHistory).filter(UserWalletHistory.status == 1).count()
        if total < offset:
            return total, []
        history = (
            self.db.query(UserWalletHistory)
            .filter(UserWalletHistory.status == 1)
            .order_by(UserWalletHistory.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return total, history

    def get_by_id(self, history_id: str) -> Optional[UserWalletHistory]:
        """
        Get user wallet history record by ID.

        Args:
            history_id: History record ID

        Returns:
            Optional[UserWalletHistory]: UserWalletHistory object or None
        """
        return self.db.query(UserWalletHistory).filter(UserWalletHistory.id == history_id).first()

    def add_consume_record(self, wallet_history: UserWalletHistory) -> Optional[UserWalletHistory]:
        """
        Add consume record to database.

        Args:
            wallet_history: Wallet history record object

        Returns:
            Optional[UserWalletHistory]: Created record, None if failed
        """
        try:
            # Add the wallet history record to database
            # The created_at and updated_at fields should be set by the caller
            self.db.add(wallet_history)
            self.db.commit()
            self.db.refresh(wallet_history)
            return wallet_history
        except Exception as e:
            self.logging.error(f"Failed to add consume record: {str(e)}")
            self.db.rollback()
            return None

    def _update_wallet_cache(self, user_id: str, new_balance: float) -> None:
        """
        Update wallet balance cache in Redis

        Args:
            user_id: User ID
            new_balance: New balance amount
        """
        try:
            cache_key = f"wallet:balance:{user_id}"
            self.redis.set(cache_key, str(new_balance), ex=self.WALLET_CACHE_EXPIRE)
            self.logging.info(f"Updated wallet cache successfully - User ID: {user_id}, Balance: {new_balance}")
        except Exception as e:
            self.logging.warning(f"Failed to update wallet cache - User ID: {user_id}, Balance: {new_balance}: {str(e)}")
            # Cache update failure doesn't affect main flow, just log the warning

    def _acquire_wallet_lock_with_timeout(self, user_id: str, timeout: int = 2) -> bool:
        """
        Acquire distributed lock for wallet operations with custom timeout

        Args:
            user_id: User ID
            timeout: Lock timeout in seconds

        Returns:
            bool: True if lock acquired successfully, False otherwise
        """
        lock_key = f"wallet:lock:{user_id}"
        lock_value = str(uuid.uuid4())

        try:
            # Try to acquire lock using Redis SET command with NX and EX options
            lua_script = """
            return redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[2])
            """
            acquired = self.redis.client.eval(lua_script, 1, lock_key, lock_value, str(timeout))
            if acquired:
                # Store lock value for proper release
                self._lock_values[user_id] = lock_value
                self.logging.debug(f"Acquired wallet lock successfully - User ID: {user_id}, Timeout: {timeout}s")
                return True
            else:
                self.logging.debug(f"Failed to acquire wallet lock - User ID: {user_id}")
                return False
        except Exception as e:
            self.logging.error(f"Error acquiring wallet lock - User ID: {user_id}: {str(e)}")
            return False

    def _update_wallet_cache_async(self, user_id: str, new_balance: float) -> None:
        """
        Update wallet balance cache in Redis asynchronously (non-blocking)

        Args:
            user_id: User ID
            new_balance: New balance amount
        """
        try:
            cache_key = f"wallet:balance:{user_id}"
            # Simple set operation, Redis is already very fast
            self.redis.set(cache_key, str(new_balance), ex=self.WALLET_CACHE_EXPIRE)
            self.logging.debug(f"Updated wallet cache successfully - User ID: {user_id}, Balance: {new_balance}")
        except Exception as e:
            self.logging.warning(f"Failed to update wallet cache - User ID: {user_id}, Balance: {new_balance}: {str(e)}")
            # Cache update failure doesn't affect main flow, just log the warning

    def _acquire_wallet_lock(self, user_id: str) -> bool:
        """
        Acquire distributed lock for wallet operations

        Args:
            user_id: User ID

        Returns:
            bool: True if lock acquired successfully, False otherwise
        """
        lock_key = f"wallet:lock:{user_id}"
        lock_value = str(uuid.uuid4())

        try:
            # Try to acquire lock using Redis SET command with NX and EX options
            lua_script = """
            return redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[2])
            """
            acquired = self.redis.client.eval(lua_script, 1, lock_key, lock_value, str(self.WALLET_LOCK_TIMEOUT))
            if acquired:
                # Store lock value for proper release
                self._lock_values[user_id] = lock_value
                self.logging.debug(f"Acquired wallet lock successfully - User ID: {user_id}")
                return True
            else:
                self.logging.warning(f"Failed to acquire wallet lock - User ID: {user_id}")
                return False
        except Exception as e:
            self.logging.error(f"Error acquiring wallet lock - User ID: {user_id}: {str(e)}")
            return False

    def _release_wallet_lock(self, user_id: str) -> None:
        """
        Release distributed lock for wallet operations

        Args:
            user_id: User ID
        """
        lock_key = f"wallet:lock:{user_id}"
        lock_value = self._lock_values.get(user_id)

        if not lock_value:
            self.logging.warning(f"No lock value found for user - User ID: {user_id}")
            return

        try:
            # Release lock (only the process holding the lock can release it)
            lua_script = """
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
            """
            released = self.redis.client.eval(lua_script, 1, lock_key, lock_value)
            if released:
                self.logging.debug(f"Released wallet lock successfully - User ID: {user_id}")
            else:
                self.logging.warning(f"Lock was already released or expired - User ID: {user_id}")

            # Clean up lock value
            self._lock_values.pop(user_id, None)

        except Exception as e:
            self.logging.error(f"Error releasing wallet lock - User ID: {user_id}: {str(e)}")
            # Clean up lock value even if release failed
            self._lock_values.pop(user_id, None)
