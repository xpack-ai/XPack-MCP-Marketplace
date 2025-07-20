import datetime
from pydantic import BaseModel
from typing import Optional


class ApikeyResponse(BaseModel):
    apikey_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    apikey: Optional[str] = None
    expire_at: Optional[datetime.datetime] = None
    create_time: Optional[datetime.datetime] = None
