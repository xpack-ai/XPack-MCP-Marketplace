from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.admin_service.services.payment_service import PaymentService
from services.admin_service.services.user_wallet_history_service import UserWalletHistoryService

router = APIRouter()


def get_payment(db: Session = Depends(get_db)) -> PaymentService:
    return PaymentService(db)


def get_user_wallet_history(db: Session = Depends(get_db)) -> UserWalletHistoryService:
    return UserWalletHistoryService(db)


class CreatePaymentLinkRequest(BaseModel):
    amount: float
    currency: str = "usd"
    payment_method: str = "stripe"
    success_url: str = ""


@router.post("/create_payment_link", response_model=dict)
def create_payment_link(
    request: Request,
    body: CreatePaymentLinkRequest,
    payment: PaymentService = Depends(get_payment),
):
    """Create Stripe payment link for the user."""
    user = request.scope.get("user")
    if not user:
        return ResponseUtils.error(message="User not found", code=404)
    try:
        match body.payment_method:
            case "alipay":
                payment_info = payment.create_alipay_payment_link(user_id=user.id, amount=body.amount, currency=body.currency)
                if not payment_info:
                    return ResponseUtils.error(message="Failed to create Alipay payment link", code=500)
                from services.admin_service.tasks.alipay_order_monitor_task import AlipayOrderMonitorTask
                alipay_monitor_task = AlipayOrderMonitorTask.get_instance()
                alipay_monitor_task.add_order_to_monitor(payment_id=payment_info.get("payment_id"))
            case _:
                if not body.success_url:
                    return ResponseUtils.error(message="Success URL is required for Stripe payments", code=400)
                payment_info = payment.create_stripe_payment_link(body.success_url, user_id=user.id, amount=body.amount, currency=body.currency)
        if payment_info:
            return ResponseUtils.success({"pay_url": payment_info.get("payment_link"), "payment_id": payment_info.get("payment_id")})
        return ResponseUtils.error(message="Failed to create payment link", code=500)
    except Exception as e:
        return ResponseUtils.error(message=str(e), code=500)

@router.post("/callback_stripe", response_model = dict)
async def callback_stripe(
    request: Request,
    payment: PaymentService = Depends(get_payment),
):
    """Handle Stripe payment webhook callback."""
    payload = (await request.body()).decode("utf-8")
    sig_header = request.headers.get("Stripe-Signature") or ""
    result = payment.stripe_payment_callback(payload, sig_header)
    if result:
        return ResponseUtils.success()
    else:
        return ResponseUtils.error(message="Stripe callback failed", code=500)

@router.post("/callback_alipay", response_model=dict)
async def callback_alipay(request: Request, payment: PaymentService = Depends(get_payment)):
    """Handle Alipay payment webhook callback."""
    payload = (await request.body()).decode("utf-8")
    result = payment.alipay_payment_callback(payload)
    if result:
        return ResponseUtils.success()
    else:
        return ResponseUtils.error(message="Alipay callback failed", code=500)


@router.get("/order_status", response_model=dict)
async def order_status(
    payment_id: str,
    get_user_wallet_history: UserWalletHistoryService = Depends(get_user_wallet_history),
):
    """Check payment order completion status."""
    if get_user_wallet_history.check_order_complete(payment_id):
        return ResponseUtils.success({"status": 1})
    return ResponseUtils.success({"status": 0})
