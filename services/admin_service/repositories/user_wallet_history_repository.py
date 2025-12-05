import logging
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from services.common.models.user_wallet_history import UserWalletHistory
from services.common.models.user_wallet import UserWallet
from services.common.models.user_wallet_history import TransactionType, PaymentMethod
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from sqlalchemy import func, literal_column

class UserWalletHistoryRepository:
    """
    Repository for managing user wallet history records.
    Handles deposit, refund, and consumption transaction history.
    """

    logging = logging.getLogger(__name__)

    def __init__(self, db: Session):
        self.db = db

    def add_deposit(self, user_id: str, amount: float, payment_method: str, transaction_id: str = "", status: int = 0) -> UserWalletHistory:
        """
        Create a new deposit record.

        Args:
            user_id: User ID
            amount: Deposit amount
            payment_method: Payment method
            transaction_id: Transaction ID from payment platform, optional
            status: Transaction status (0=new, 1=completed, 2=refunded), default is 0
        Returns:
            UserWalletHistory: Created deposit record
        """
        now = datetime.now(timezone.utc)
        if transaction_id == "":
            transaction_id = str(uuid4())
        history = UserWalletHistory(
            id=transaction_id,
            user_id=user_id,
            payment_method=PaymentMethod(payment_method),
            amount=amount,
            balance_after=0.00,
            type=TransactionType.DEPOSIT,
            transaction_id=transaction_id,
            status=status,
            created_at=now,
            updated_at=now,
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def add_withdrawal(self, user_id: str, amount: float, payment_method: str) -> UserWalletHistory:
        """
        Create a new withdrawal/consume record.

        Args:
            user_id: User ID
            amount: Withdrawal amount (positive value)
            payment_method: Payment method

        Returns:
            UserWalletHistory: Created withdrawal record
        """
        now = datetime.now(timezone.utc)
        history = UserWalletHistory(
            id=str(uuid4()),
            user_id=user_id,
            payment_method=PaymentMethod(payment_method),
            amount=amount,  # Store as positive value
            balance_after=0.00,
            type=TransactionType.CONSUME,
            status=1,  # Mark as completed immediately for platform withdrawals
            created_at=now,
            updated_at=now,
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def set_balance(self,user_id: str,amount:float, payment_method: str, transaction_id: str = "", status: int = 0) -> UserWalletHistory:
        """
        Create a new balance record.

        Args:
            user_id: User ID
            amount: Balance amount
            payment_method: Payment method
            transaction_id: Transaction ID from payment platform, optional
            status: Status of the transaction (0=new, 1=completed, 2=refunded)
        Returns:
            UserWalletHistory: Created balance record
        """
        now = datetime.now(timezone.utc)
        if transaction_id == "":
            transaction_id = str(uuid4())
        history = UserWalletHistory(
            id=transaction_id,
            user_id=user_id,
            payment_method=PaymentMethod(payment_method),
            amount=amount,
            balance_after=0.00,
            type=TransactionType.RESET,
            status=status,  # 0=new, 1=completed, 2=refunded
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

    def set_status(self, payment_id: str, payment_channel_id: str, status: int) -> Optional[UserWalletHistory]:
        """
        Update the status of a trade record by payment ID.

        Args:
            payment_id: Payment ID to identify the record
            payment_channel_id: Payment channel ID (not used in this method, but can be useful for logging)
            status: New status to set (0=new, 1=completed, 2=refunded)
        Returns:
            Optional[UserWalletHistory]: Updated record or None if not found
        """
        history = self.db.query(UserWalletHistory).filter(UserWalletHistory.id == payment_id).first()
        if not history:
            self.logging.error(f"UserWalletHistory not found for payment_id={payment_id}")
            return None

        if payment_channel_id != "":
            history.channel_user_id = payment_channel_id
        history.status = status
        history.updated_at = datetime.now(timezone.utc)
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
            obj = self.db.query(UserWalletHistory).filter(UserWalletHistory.id == id).with_for_update().first()
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

            wallet = self.db.query(UserWallet).filter(UserWallet.user_id == obj.user_id).with_for_update().first()
            if not wallet:
                self.logging.error(f"UserWallet not found: user_id={obj.user_id}")
                return False

            # Update wallet balance and order status
            wallet.balance = float(wallet.balance) + float(obj.amount)
            obj.status = 1  # 1=completed
            obj.balance_after = float(wallet.balance)
            obj.transaction_id = transaction_id

            self.db.commit()
            self.logging.info(f"Deposit completed successfully: id={id}, amount={obj.amount}, new_balance={wallet.balance}")
            return True

        except Exception as e:
            self.logging.error(f"Error completing deposit: id={id}, error={str(e)}")
            self.db.rollback()
            return False

    def success_deposit_order_list(self, offset: int, limit: int) -> Tuple[int, List[UserWalletHistory]]:
        """
        Get list of successful orders.

        Args:
            offset: Offset for pagination
            limit: Limit for pagination

        Returns:
            tuple: (total_count, order_list)
        """
        query = self.db.query(UserWalletHistory).filter(
            UserWalletHistory.status == 1,
            UserWalletHistory.type == TransactionType.DEPOSIT,
        )
        total = query.count()
        if total < offset:
            return total, []
        history = (
            query
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

    def order_list(self, payment_method: str, status: int, start: Optional[datetime] = None, end: Optional[datetime] = None) -> List[UserWalletHistory]:
        """
        Get list of orders based on filters.

        Args:
            payment_method: Payment method filter
            status: Order status filter (0=new, 1=completed, 2=refunded)
            start: Start date for filtering
            end: End date for filtering
        Returns:
            tuple: (total_count, order_list)
        """
        query = self.db.query(UserWalletHistory)

        if payment_method:
            query = query.filter(UserWalletHistory.payment_method == PaymentMethod(payment_method))

        if status >= 0:
            query = query.filter(UserWalletHistory.status == status)

        if start:
            query = query.filter(UserWalletHistory.created_at >= start)

        if end:
            query = query.filter(UserWalletHistory.created_at <= end)

        return query.order_by(UserWalletHistory.created_at.desc()).all()

    def stats_deposit_amount(self, start: Optional[datetime] = None, end: Optional[datetime] = None) -> float:
        """
        Get total deposit amount within optional date range.

        Args:
            start: Start date for filtering
            end: End date for filtering

        Returns:
            float: Total deposit amount
        """
        # Apply server-local time when filtering by range to match UI expectations
        offset_td = datetime.now().astimezone().utcoffset() or timedelta(0)
        offset_minutes = int(offset_td.total_seconds() // 60)
        local_dt = func.timestampadd(literal_column('MINUTE'), offset_minutes, UserWalletHistory.created_at)

        query = self.db.query(func.sum(UserWalletHistory.amount)).filter(
            UserWalletHistory.type == TransactionType.DEPOSIT,
            UserWalletHistory.status == 1,
        )

        if start is not None:
            start_local = start.astimezone().replace(tzinfo=None) if start.tzinfo is not None else start
            query = query.filter(local_dt >= start_local)

        if end is not None:
            end_local = end.astimezone().replace(tzinfo=None) if end.tzinfo is not None else end
            query = query.filter(local_dt <= end_local)

        result = query.scalar()
        self.logging.info(f"stats_deposit_amount: {result},{start}")
        return float(result) if result is not None else 0.0

    def stats_deposit_amount_trend(self, start: Optional[datetime] = None, end: Optional[datetime] = None) -> List[dict]:
        """
        Get daily deposit amount trend within date range, filling missing dates with 0 amount.
        Uses server-local day boundaries, consistent with registered user trend.
        """
        # Shift UTC created_at by server timezone offset and group by local DATE
        offset_td = datetime.now().astimezone().utcoffset() or timedelta(0)
        offset_minutes = int(offset_td.total_seconds() // 60)
        local_dt = func.timestampadd(literal_column('MINUTE'), offset_minutes, UserWalletHistory.created_at)
        day_col = func.date(local_dt)

        query = (
            self.db.query(
                day_col.label("stats_day"),
                func.coalesce(func.sum(UserWalletHistory.amount), 0).label("amount"),
            )
            .filter(
                UserWalletHistory.type == TransactionType.DEPOSIT,
                UserWalletHistory.status == 1,
            )
        )

        # Apply range filters using server-local time for consistency with grouping
        if start is not None:
            start_local = start.astimezone().replace(tzinfo=None) if start.tzinfo is not None else start
            query = query.filter(local_dt >= start_local)
        if end is not None:
            end_local = end.astimezone().replace(tzinfo=None) if end.tzinfo is not None else end
            query = query.filter(local_dt <= end_local)

        rows = query.group_by(day_col).order_by(day_col.asc()).all()

        amounts_by_day = {row.stats_day: float(row.amount or 0.0) for row in rows}

        # Determine start and end days (server-local date)
        if start is not None:
            start_day = (start.astimezone().date() if start.tzinfo is not None else start.date())
        else:
            start_day = rows[0].stats_day if rows else None

        if end is not None:
            end_day = (end.astimezone().date() if end.tzinfo is not None else end.date())
        else:
            end_day = rows[-1].stats_day if rows else start_day

        # If no data and no explicit range, return empty
        if start_day is None or end_day is None:
            return []

        # Generate continuous date sequence with zero-fill
        result = []
        current_day = start_day
        while current_day <= end_day:
            result.append({"stats_day": current_day, "count": amounts_by_day.get(current_day, 0.0)})
            current_day += timedelta(days=1)

        return result