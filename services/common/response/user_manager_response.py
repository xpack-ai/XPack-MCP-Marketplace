import datetime
from pydantic import BaseModel, field_serializer
from typing import Optional
from decimal import Decimal

class UserManagerResponse(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    balance: Optional[Decimal] = None
    created_at: Optional[datetime.datetime] = None

    @field_serializer('balance', when_used='json')
    def serialize_balance(self, v: Optional[Decimal]) -> Optional[float]:
        return float(v) if v is not None else None
