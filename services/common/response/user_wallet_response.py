from pydantic import BaseModel, field_serializer
from typing import Optional
from decimal import Decimal


class UserWalletResponse(BaseModel):
    balance: Optional[Decimal] = None

    @field_serializer('balance', when_used='json')
    def serialize_balance(self, v: Optional[Decimal]) -> Optional[float]:
        return float(v) if v is not None else None
