from pydantic import BaseModel
from typing import Optional


class UserWalletResponse(BaseModel):
    balance: Optional[float] = None
