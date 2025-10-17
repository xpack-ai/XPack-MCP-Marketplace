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
from services.admin_service.services.stats_service import StatsService

router = APIRouter()

def get_stats_service(db: Session = Depends(get_db)) -> StatsService:
    return StatsService(db)

@router.get("/stats/analytics")
async def stats(
    stats_service: StatsService = Depends(get_stats_service)
):
    try:
        return ResponseUtils.success(
            {
                "user_register": stats_service.get_registered_user_stats(),
                "user_pay": stats_service.get_deposit_stats(),
                "mcp_call": stats_service.get_call_stats(),
                "top_services": stats_service.get_call_stats_group_by_service()
            }
        )
    except Exception as e:
        return ResponseUtils.error(f"Failed to get stats analytics: {str(e)}", 500)
