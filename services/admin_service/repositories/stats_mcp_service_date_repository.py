from datetime import date, datetime
from typing import Optional, List, Tuple, cast
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.mysql import insert as mysql_insert
from sqlalchemy.sql.schema import Table
from services.common.models.stats_mcp_service_date import StatsMcpServiceDate


class StatsMcpServiceDateRepository:
    """MCP call log repository class"""

    def __init__(self, db: Session):
        self.db = db

    def insert(self, service_id: str, stats_date: datetime, call_count: int = 1) -> StatsMcpServiceDate:
        """Insert a new hourly stats record.

        Raises on duplicate primary key; use update or upsert if unsure.
        """
        record = StatsMcpServiceDate()
        record.service_id = service_id
        record.stats_date = stats_date
        record.call_count = call_count
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def update(self, service_id: str, stats_date: datetime, call_count: int) -> Optional[StatsMcpServiceDate]:
        """Update existing hourly stats record's call_count.

        Returns the updated record, or None if not found.
        """
        record = (
            self.db.query(StatsMcpServiceDate)
            .filter(
                StatsMcpServiceDate.service_id == service_id,
                StatsMcpServiceDate.stats_date == stats_date,
            )
            .first()
        )
        if not record:
            return None
        record.call_count = call_count
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_daily_counts(
        self,
        service_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[Tuple[date, int]]:
        """Get per-day aggregated call counts within optional date range.

        Aggregates hour-level records by DATE(stats_date). Returns list of (day, total_count).
        """
        day_col = func.date(StatsMcpServiceDate.stats_date)
        query = (
            self.db.query(
                day_col.label("stats_day"),
                func.coalesce(func.sum(StatsMcpServiceDate.call_count), 0).label("total_count"),
            )
            .filter(StatsMcpServiceDate.service_id == service_id)
        )
        if start_date is not None:
            query = query.filter(day_col >= start_date)
        if end_date is not None:
            query = query.filter(day_col <= end_date)
        rows = query.group_by(day_col).order_by(day_col.asc()).all()
        return [(row.stats_day, int(row.total_count or 0)) for row in rows]

    def get_total_count(
        self,
        service_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> int:
        """Get total call count for a service within optional date range."""
        day_col = func.date(StatsMcpServiceDate.stats_date)
        query = self.db.query(func.coalesce(func.sum(StatsMcpServiceDate.call_count), 0)).filter(
            StatsMcpServiceDate.service_id == service_id
        )
        if start_date is not None:
            query = query.filter(day_col >= start_date)
        if end_date is not None:
            query = query.filter(day_col <= end_date)
        total = query.scalar()
        return int(total or 0)

    def increment(self, service_id: str, stats_date: datetime, inc: int = 1) -> None:
        """Atomically increment call_count for (service_id, stats_date) under high concurrency.

        Implementation uses MySQL's ON DUPLICATE KEY UPDATE to avoid race conditions.
        If the row does not exist, it will be inserted with call_count=inc; otherwise, call_count is increased.
        """
        # Cast mapped table for typing compatibility with mysql_insert
        table: Table = cast(Table, StatsMcpServiceDate.__table__)
        stmt = mysql_insert(table).values(
            service_id=service_id,
            stats_date=stats_date,
            call_count=inc,
            created_at=func.current_timestamp(),
            updated_at=func.current_timestamp(),
        )
        ondup = stmt.on_duplicate_key_update(
            call_count=table.c.call_count + inc,
            updated_at=func.current_timestamp(),
        )
        self.db.execute(ondup)
        self.db.commit()

    def increment_fallback(self, service_id: str, stats_date: datetime, inc: int = 1) -> None:
        """Fallback increment strategy without dialect-specific upsert.

        Tries to insert; on duplicate key, rolls back and performs an in-place atomic update: call_count = call_count + inc.
        Suitable when MySQL dialect insert is not available.
        """
        try:
            # Try insert first
            self.insert(service_id, stats_date, inc)
        except IntegrityError:
            # Record exists, perform atomic UPDATE
            self.db.rollback()
            self.db.query(StatsMcpServiceDate).filter(
                StatsMcpServiceDate.service_id == service_id,
                StatsMcpServiceDate.stats_date == stats_date,
            ).update(
                {
                    StatsMcpServiceDate.call_count: StatsMcpServiceDate.call_count + inc,
                    StatsMcpServiceDate.updated_at: func.current_timestamp(),
                },
                synchronize_session=False,
            )
            self.db.commit()

    