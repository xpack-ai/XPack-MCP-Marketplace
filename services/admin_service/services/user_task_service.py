from sqlalchemy.orm import Session
from typing import Optional, Tuple, List
from services.common.models.user_task import UserTask
from services.common.database import SessionLocal

from services.admin_service.repositories.user_task_repository import UserTaskRepository

import logging
logger = logging.getLogger(__name__)

class UserTaskService:
    def __init__(self, db: Session):
        self.db = db
        self.user_task_repo = UserTaskRepository(db)
        
    def user_tasks_by_id(self, user_id: str) -> List[UserTask]:
        return self.user_task_repo.user_tasks_by_id(user_id)
    
    def skip_task(self, user_id: str, task_id: str):
        return self.user_task_repo.skip_task(user_id, task_id)

    def update_task_status(self, user_id: str, task_id: str, task_status: int):
        return self.user_task_repo.update_task_status(user_id, task_id, task_status)

    