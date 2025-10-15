from fastapi import APIRouter, Depends, Body,Request
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.admin_service.services.user_task_service import UserTaskService
from services.admin_service.utils.user_utils import UserUtils
from services.admin_service.constants.user_task import user_task_ids

router = APIRouter()

def get_user_task_service(db: Session = Depends(get_db)) -> UserTaskService:
    return UserTaskService(db)


@router.put("/task_update_status")
def skip_task(
    request: Request,
    body: dict = Body(...),
    user_task_service: UserTaskService = Depends(get_user_task_service),
):
    user = UserUtils.get_request_user(request)
    if not user:
        return ResponseUtils.error(message="not found user", code=404)

    task_id = body.get("task_id")
    if task_id:
        if task_id not in user_task_ids:
            return ResponseUtils.error(message="invalid task_id", code=400)
        raw_status = body.get("task_status", 0)
        try:
            status_int = 1 if int(raw_status) == 1 else 0
        except (ValueError, TypeError):
            status_int = 0
        user_task_service.update_task_status(user.id, task_id, status_int)
        return ResponseUtils.success()
    is_skip = body.get("is_skip")
    if is_skip and is_skip == 1:
        for task_id in user_task_ids:
            user_task_service.skip_task(user.id, task_id)
    return ResponseUtils.success()
