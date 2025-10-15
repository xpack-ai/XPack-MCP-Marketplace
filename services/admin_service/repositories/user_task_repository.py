from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import  List
from services.common.models.user_task import UserTask

class UserTaskRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def user_tasks_by_id(self, user_id: str) -> List[UserTask]:
        return self.db.query(UserTask).filter(UserTask.user_id == user_id).all()

    def skip_task(self, user_id: str, task_id: str):
        user_task = self.db.query(UserTask).filter(UserTask.user_id == user_id, UserTask.task_id == task_id).first()
        if user_task:
            user_task.task_status = 1
            user_task.updated_at = datetime.now(timezone.utc)
        else:
            user_task = UserTask(user_id=user_id, task_id=task_id, task_status=1)
            self.db.add(user_task)
        self.db.commit()
    def update_task_status(self, user_id: str, task_id: str, task_status: int):
        user_task = self.db.query(UserTask).filter(UserTask.user_id == user_id, UserTask.task_id == task_id).first()
        status_int = 1 if int(task_status) == 1 else 0
        if user_task:
            user_task.task_status = status_int
            user_task.updated_at = datetime.now(timezone.utc)
        else:
            user_task = UserTask(user_id=user_id, task_id=task_id, task_status=status_int)
            self.db.add(user_task)
        self.db.commit()