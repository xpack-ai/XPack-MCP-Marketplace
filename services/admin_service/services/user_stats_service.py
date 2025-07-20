"""
User statistics service
"""

from datetime import datetime, date, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from services.common.models.mcp_call_log import McpCallLog
from services.common.models.user_apikey import UserApiKey
from services.common.logging_config import get_logger

logger = get_logger(__name__)


class UserStatsService:
    """User statistics service class"""

    def __init__(self, db: Session):
        self.db = db

    def get_apikey_call_tool_stats(self, apikey_id: str, last_day: int = 30) -> List[Dict]:
        """
        Get tool call statistics by apikey_id

        Args:
            apikey_id: API key ID
            last_day: Recent days, default 30

        Returns:
            List[Dict]: Daily call count statistics

        Raises:
            ValueError: When apikey_id is invalid
        """
        logger.info(f"Getting tool call stats for apikey_id: {apikey_id}, last_day: {last_day}")

        # Validate apikey_id exists
        apikey = self.db.query(UserApiKey).filter(UserApiKey.id == apikey_id).first()
        if not apikey:
            logger.warning(f"Invalid apikey_id provided: {apikey_id}")
            raise ValueError(f"Invalid apikey_id: {apikey_id}")

        # Calculate date range
        end_date = date.today()
        start_date = end_date - timedelta(days=last_day - 1)

        logger.info(f"Querying stats from {start_date} to {end_date}")

        # Query statistics data
        stats_query = (
            self.db.query(func.date(McpCallLog.call_start_time).label("stats_day"), func.count(McpCallLog.id).label("call_tool_count"))
            .join(UserApiKey, UserApiKey.id == McpCallLog.apikey_id)
            .filter(
                and_(
                    UserApiKey.id == apikey_id,
                    func.date(McpCallLog.call_start_time) >= start_date,
                    func.date(McpCallLog.call_start_time) <= end_date,
                )
            )
            .group_by(func.date(McpCallLog.call_start_time))
            .all()
        )

        # Convert to dictionary for easy lookup
        stats_dict = {str(row.stats_day): row.call_tool_count for row in stats_query}

        # Generate complete date sequence, including dates with no calls
        result = []
        current_date = start_date

        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            call_count = stats_dict.get(date_str, 0)

            result.append({"stats_day": date_str, "call_tool_count": call_count})

            current_date += timedelta(days=1)

        logger.info(f"Generated stats for {len(result)} days, total calls: {sum(item['call_tool_count'] for item in result)}")

        return result
