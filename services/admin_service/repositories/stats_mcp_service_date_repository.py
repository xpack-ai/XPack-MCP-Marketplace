from datetime import date, datetime, timedelta
from typing import Optional, List, Tuple, cast
from sqlalchemy.orm import Session
from sqlalchemy import func, literal_column
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
        # Logger for debug purposes
        print(f"Incrementing call count for service {service_id} on {stats_date} by {inc}")

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
    
    def stats_call_count(
        self,
        start_at: Optional[datetime] = None,
        end_at: Optional[datetime] = None,
    ) -> int:
        """Get total call count within optional local-time range for a service.

        Applies server timezone offset to stored UTC hourly timestamps and
        filters by local datetime range before summing call_count.
        """
        # Convert stored UTC timestamp to server-local time for range filtering
        offset_td = datetime.now().astimezone().utcoffset() or timedelta(0)
        offset_minutes = int(offset_td.total_seconds() // 60)
        local_dt = func.timestampadd(literal_column('MINUTE'), offset_minutes, StatsMcpServiceDate.stats_date)

        query = (
            self.db.query(func.coalesce(func.sum(StatsMcpServiceDate.call_count), 0))
        )

        if start_at is not None:
            start_local = start_at.astimezone().replace(tzinfo=None) if start_at.tzinfo is not None else start_at
            query = query.filter(local_dt >= start_local)

        if end_at is not None:
            end_local = end_at.astimezone().replace(tzinfo=None) if end_at.tzinfo is not None else end_at
            query = query.filter(local_dt <= end_local)

        total = query.scalar()
        return int(total or 0)

    def stats_call_count_trend(
        self,
        start_at: Optional[datetime] = None,
        end_at: Optional[datetime] = None,
    ) -> list:
        """
        Get per-day call count trend for a service, filling missing dates with zero.

        Grouping and range filtering use server-local timezone: stored UTC hourly
        timestamps are shifted by the server offset, then aggregated by DATE.
        """
        # Shift UTC to local time for consistent day grouping and filtering
        offset_td = datetime.now().astimezone().utcoffset() or timedelta(0)
        offset_minutes = int(offset_td.total_seconds() // 60)
        local_dt = func.timestampadd(literal_column('MINUTE'), offset_minutes, StatsMcpServiceDate.stats_date)
        day_col = func.date(local_dt)

        query = (
            self.db.query(
                day_col.label("stats_day"),
                func.coalesce(func.sum(StatsMcpServiceDate.call_count), 0).label("total_count"),
            )
        )

        # Apply local-time range filters to match grouping
        if start_at is not None:
            start_local = start_at.astimezone().replace(tzinfo=None) if start_at.tzinfo is not None else start_at
            query = query.filter(local_dt >= start_local)
        if end_at is not None:
            end_local = end_at.astimezone().replace(tzinfo=None) if end_at.tzinfo is not None else end_at
            query = query.filter(local_dt <= end_local)

        rows = query.group_by(day_col).order_by(day_col.asc()).all()
        counts_by_day = {row.stats_day: int(row.total_count or 0) for row in rows}

        # Determine start/end days (local date)
        if start_at is not None:
            start_day = start_at.astimezone().date() if start_at.tzinfo is not None else start_at.date()
        else:
            start_day = rows[0].stats_day if rows else None

        if end_at is not None:
            end_day = end_at.astimezone().date() if end_at.tzinfo is not None else end_at.date()
        else:
            end_day = rows[-1].stats_day if rows else start_day

        if start_day is None or end_day is None:
            return []

        # Generate continuous date sequence with zero-fill for missing days
        result = []
        current_day = start_day
        while current_day <= end_day:
            result.append({"stats_day": current_day, "count": counts_by_day.get(current_day, 0)})
            current_day += timedelta(days=1)
        return result
        
    def stats_call_count_group_by_service(
        self,
        start_at: Optional[datetime] = None,
        end_at: Optional[datetime] = None,
    ) -> list:
        """
        Get total call counts grouped by service within optional local-time range.

        Applies server-local timezone offset when filtering by datetime range to
        match aggregation semantics used elsewhere.

        Returns:
            list: [{"service_id": str, "count": int}, ...]
        """
        # Shift stored UTC timestamps to server-local time for range filtering
        offset_td = datetime.now().astimezone().utcoffset() or timedelta(0)
        offset_minutes = int(offset_td.total_seconds() // 60)
        local_dt = func.timestampadd(literal_column('MINUTE'), offset_minutes, StatsMcpServiceDate.stats_date)

        query = (
            self.db.query(
                StatsMcpServiceDate.service_id.label("service_id"),
                func.coalesce(func.sum(StatsMcpServiceDate.call_count), 0).label("total_count"),
            )
        )

        # Apply local-time range filters if provided
        if start_at is not None:
            start_local = start_at.astimezone().replace(tzinfo=None) if start_at.tzinfo is not None else start_at
            query = query.filter(local_dt >= start_local)
        if end_at is not None:
            end_local = end_at.astimezone().replace(tzinfo=None) if end_at.tzinfo is not None else end_at
            query = query.filter(local_dt <= end_local)

        rows = query.group_by(StatsMcpServiceDate.service_id).order_by(func.sum(StatsMcpServiceDate.call_count).desc()).all()

        return [{"service_id": row.service_id, "count": int(row.total_count or 0)} for row in rows]
