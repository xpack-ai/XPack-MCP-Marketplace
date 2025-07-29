import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from services.common.models.mcp_call_log import McpCallLog, ProcessStatus


class McpCallLogRepository:
    """MCP call log repository class"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, call_log: McpCallLog) -> McpCallLog:
        self.db.add(call_log)
        self.db.commit()
        self.db.refresh(call_log)
        return call_log

    def get_by_id(self, log_id: str) -> Optional[McpCallLog]:
        return self.db.query(McpCallLog).filter(McpCallLog.id == log_id).first()

    def update_status(
        self, log_id: str, status: ProcessStatus, error_msg: Optional[str] = None, wallet_history_id: Optional[str] = None
    ) -> bool:
        log_record = self.get_by_id(log_id)
        if log_record:
            log_record.process_status = status
            if error_msg:
                log_record.error_msg = error_msg
            if wallet_history_id:
                log_record.wallet_history_id = wallet_history_id
            self.db.commit()
            return True
        return False

    def get_user_call_history(self, user_id: str, page: int = 1, page_size: int = 20) -> Tuple[int, List[McpCallLog]]:
        total = self.db.query(McpCallLog).filter(McpCallLog.user_id == user_id).count()

        offset = (page - 1) * page_size
        records = (
            self.db.query(McpCallLog)
            .filter(McpCallLog.user_id == user_id)
            .order_by(McpCallLog.call_start_time.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        return total, records

    def get_pending_logs(self, limit: int = 100) -> List[McpCallLog]:
        return (
            self.db.query(McpCallLog)
            .filter(McpCallLog.process_status == ProcessStatus.PENDING)
            .order_by(McpCallLog.created_at.asc())
            .limit(limit)
            .all()
        )
