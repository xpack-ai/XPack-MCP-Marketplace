from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

from yarl import Query
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.admin_service.services.stats_service import StatsService

router = APIRouter()

def get_stats_service(db: Session = Depends(get_db)) -> StatsService:
    return StatsService(db)

@router.get("/stats/analytics")
async def stats(
    start: int= 0,
    end: int=0,
    stats_service: StatsService = Depends(get_stats_service)
):
    if end == 0:
        end = int(datetime.now().timestamp())
    if start == 0:
        # 30天前
        start = int(end - 30 * 24 * 60 * 60)
    
    try:
        start_dt = datetime.fromtimestamp(start)
        end_dt = datetime.fromtimestamp(end)
        return ResponseUtils.success(
            {
                "user_register": stats_service.get_registered_user_stats(start_dt, end_dt),
                "user_pay": stats_service.get_deposit_stats(start_dt, end_dt),
                "mcp_call": stats_service.get_call_stats(start_dt, end_dt),
                "top_services": stats_service.get_call_stats_group_by_service(start_dt, end_dt)
            }
        )
    except Exception as e:
        return ResponseUtils.error(f"Failed to get stats analytics: {str(e)}", 500)
