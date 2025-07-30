"""
"""
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass
class BillingMessage:
    user_id: str
    service_id: str
    api_id: str
    tool_name: str
    input_params: str
    call_success: bool
    unit_price: Decimal
    call_start_time: datetime
    call_end_time: Optional[datetime] = None
    call_log_id: Optional[str] = None
    apikey_id: Optional[str] = None


@dataclass
class ApiCallLogInfo:
    user_id: str
    service_id: str
    api_id: str
    tool_name: str
    input_params: str
    unit_price: Decimal
    input_token_amount: Decimal
    output_token_amount: Decimal
    call_start_time: datetime
    call_end_time: Optional[datetime] = None
    apikey_id: Optional[str] = None


@dataclass
class PreDeductResult:
    success: bool
    message: str
    service_price: Decimal
    user_balance: Decimal
    input_token_price: Decimal
    output_token_price: Decimal
    charge_type: str
