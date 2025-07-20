from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.common.models.user import User
from services.common.models.user_wallet import UserWallet
from services.common.models.mcp_service import McpService
from services.common.models.mcp_call_log import McpCallLog

router = APIRouter()


@router.get("/platform")
async def get_platform_overview(db: Session = Depends(get_db)):
    """Get platform overview statistics and metrics."""
    try:
        # Get total users (non-admin and not deleted)
        total_user = db.query(User).filter(User.role_id != 1, User.is_deleted == 0).count()  # Non-admin (role_id 1 is admin), not deleted

        # Get total balance
        total_balance_result = db.query(func.sum(UserWallet.balance)).scalar()
        total_balance = int(total_balance_result) if total_balance_result else 0

        # Get total number of services
        total_service = db.query(McpService).count()

        # Get today's invocation count
        today = date.today()
        today_invoke_count = db.query(McpCallLog).filter(func.date(McpCallLog.created_at) == today).count()

        # Build response data
        response_data = {
            "total_user": total_user,
            "total_balance": total_balance,
            "total_service": total_service,
            "invoke_count": {"today": today_invoke_count},
        }

        return ResponseUtils.success(response_data)

    except Exception as e:
        return ResponseUtils.error(f"Failed to get platform overview: {str(e)}", 500)
