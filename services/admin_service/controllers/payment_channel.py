from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.admin_service.services.payment_channel_service import PaymentChannelService
from services.common.utils.secure_config import decrypt_config, encrypt_config
from services.admin_service.tasks.order_monitor_task import OrderMonitorTask
import json

router = APIRouter()


def get_payment_channel(db: Session = Depends(get_db)) -> PaymentChannelService:
    return PaymentChannelService(db)


@router.get("/list")
async def payment_channel_list(
    page: int = Query(1, description="Current page number"),
    page_size: int = Query(15, description="Number of items per page"),
    payment_channel_service: PaymentChannelService = Depends(get_payment_channel),
):
    """Get paginated list of payment channels."""
    total, list = payment_channel_service.list()
    if total == 0:
        return ResponseUtils.success_page(data=[], total=0, page_num=page, page_size=page_size)
    result = []
    for item in list:
        enable = item.status == 1
        cfg = {}
        if item.config:
            cfg = decrypt_config(item.config) or {}
        result.append(
            {
                "id": item.id,
                "name": item.name,
                "config": cfg,
                "is_enabled": enable,
                "updated_time": item.updated_at,
            }
        )
    return ResponseUtils.success_page(data=result, total=total, page_num=page, page_size=page_size)


@router.put("/enable")
async def payment_channel_enable(
    payment_channel_service: PaymentChannelService = Depends(get_payment_channel),
    body: dict = Body(..., description="Payment channel configuration"),
):
    """Enable a payment channel by ID."""
    id = body.get("id")
    if not id:
        return ResponseUtils.error("Payment channel id cannot be empty")
    data = payment_channel_service.update_status(id, 1)

    if data:
        if id == "alipay":
            monitor = OrderMonitorTask.get_instance()
            # Ensure monitor is running and enable Alipay client
            monitor.start_monitor()
            monitor.enable_client("alipay")
        cfg = decrypt_config(data.config) if data.config else {}
        return ResponseUtils.success(
            {
                "id": id,
                "name": data.name,
                "config": cfg or {},
                "is_enabled": data.status == 1,
                "updated_time": data.updated_at,
            }
        )
    return ResponseUtils.success(data={})


@router.put("/disable")
async def payment_channel_disable(
    payment_channel_service: PaymentChannelService = Depends(get_payment_channel),
    body: dict = Body(..., description="Payment channel configuration"),
):
    """Disable a payment channel by ID."""
    id = body.get("id")
    if not id:
        return ResponseUtils.error("Payment channel id cannot be empty")
    data = payment_channel_service.update_status(id, 0)
    if data:
        if id == "alipay":
            monitor = OrderMonitorTask.get_instance()
            # Disable Alipay client without stopping global monitor
            monitor.disable_client("alipay")
        cfg = decrypt_config(data.config) if data.config else {}
        return ResponseUtils.success(
            {
                "id": id,
                "name": data.name,
                "config": cfg or {},
                "is_enabled": data.status == 1,
                "updated_time": data.updated_at,
            }
        )
    return ResponseUtils.success(data={})


@router.put("/info")
async def payment_channel_config(
    payment_channel_service: PaymentChannelService = Depends(get_payment_channel),
    body: dict = Body(..., description="Payment channel configuration"),
):
    """Update payment channel configuration."""
    id = body.get("id")
    if not id:
        return ResponseUtils.error("Payment channel id cannot be empty")
    config = body.get("config")
    if config:
        # Encrypt config before persisting to DB
        try:
            encrypted = encrypt_config(config)
        except Exception as e:
            return ResponseUtils.error(f"Failed to encrypt config: {str(e)}")
        data = payment_channel_service.update_config(id=id, config=encrypted)
        if data:
            # Convert str to object
            return ResponseUtils.success(
                {
                    "id": id,
                    "name": data.name,
                    "config": config,
                    "is_enabled": data.status == 1,
                    "updated_time": data.updated_at,
                }
            )
        return ResponseUtils.success(data={})
    return ResponseUtils.success(data={})
