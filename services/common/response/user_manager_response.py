import datetime
from pydantic import BaseModel
from typing import Optional

class UserManagerResponse(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    balance: Optional[float] = None
    created_at: Optional[datetime.datetime] = None
