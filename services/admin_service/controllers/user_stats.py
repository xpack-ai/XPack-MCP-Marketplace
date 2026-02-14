"""
User statistics controller
"""

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.admin_service.services.user_stats_service import UserStatsService
from services.admin_service.utils.user_utils import UserUtils
from services.common.logging_config import get_logger
from services.common import error_msg

logger = get_logger(__name__)
router = APIRouter()


@router.get("/key_call_tool")
async def get_key_call_tool(
    request: Request,
    apikey_id: str = Query(..., description="apikey ID (not the apikey itself)"),
    last_day: int = Query(30, description="Days to query, default 30"),
    db: Session = Depends(get_db),
):
    if not UserUtils.is_normal_user(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    """
    Get tool call statistics by apikey
    """
    try:
        logger.info(f"Received request for apikey call stats - apikey_id: {apikey_id}, last_day: {last_day}")

        # Parameter validation
        if not apikey_id or not apikey_id.strip():
            logger.warning("Empty apikey_id provided in request")
            return ResponseUtils.error("apikey_id is required and cannot be empty", code=400)

        if last_day <= 0:
            logger.warning(f"Invalid last_day value: {last_day}")
            return ResponseUtils.error("last_day must be greater than 0", code=400)

        # Limit query range to avoid performance issues
        if last_day > 365:
            logger.warning(f"Requested last_day ({last_day}) exceeds maximum limit (365)")
            return ResponseUtils.error("last_day cannot exceed 365 days", code=400)

        # Call service layer
        stats_service = UserStatsService(db)
        days_stats = stats_service.get_apikey_call_tool_stats(apikey_id, last_day)

        response_data = {"days": days_stats}

        logger.info(f"Successfully retrieved stats for apikey_id: {apikey_id}, returned {len(days_stats)} days")
        # Create OpenAPI compliant success response
        return {"success": True, "error_message": "", "code": "200", "data": response_data}

    except ValueError as e:
        # Handle business logic errors (invalid apikey_id)
        err_msg = str(e)
        logger.error(f"Business logic error: {err_msg}")
        return ResponseUtils.error(err_msg, code=400)

    except Exception as e:
        # Handle unexpected errors
        err_msg = f"Failed to retrieve call tool statistics: {str(e)}"
        logger.error(f"Unexpected error in get_key_call_tool_count: {err_msg}", exc_info=True)
        return ResponseUtils.error("Internal server error occurred while retrieving statistics", code=500)
