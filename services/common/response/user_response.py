import datetime
from services.common.response.user_wallet_response import UserWalletResponse
from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    role_id: Optional[int] = None
    allow_all: Optional[bool] = None
    service_ids: Optional[list] = None
    created_at: Optional[datetime.datetime] = None
    wallet: Optional[UserWalletResponse] = None
    register_type: Optional[str] = None
    onboarding_tasks: Optional[list] = None
