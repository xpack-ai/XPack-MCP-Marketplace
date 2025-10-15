from fastapi import APIRouter, Depends, Request,Body
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.admin_service.constants.user_task import user_task_ids
from services.common.utils.response_utils import ResponseUtils
from services.common.response.user_response import UserResponse
from services.common.response.user_wallet_response import UserWalletResponse
from services.admin_service.utils.user_utils import UserUtils
from services.admin_service.services.user_wallet_service import UserWalletService
from services.admin_service.services.user_task_service import UserTaskService
from services.admin_service.services.auth_service import AuthService

router = APIRouter()



def get_user_wallet(db: Session = Depends(get_db)) -> UserWalletService:
    return UserWalletService(db)

def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)

def get_user_task_service(db: Session = Depends(get_db)) -> UserTaskService:
    return UserTaskService(db)

@router.get("/info", response_model=dict)
def get_user(request: Request, user_wallet: UserWalletService = Depends(get_user_wallet), user_task: UserTaskService = Depends(get_user_task_service)):
    """Get current user information and wallet balance."""
    user_response = UserResponse()
    user_wallet_resp = UserWalletResponse()
    user_wallet_resp.balance = 0.00

    user = UserUtils.get_request_user(request)
    if user:
        user_wallet_info = user_wallet.get_by_user_id(user.id)
        if user_wallet_info:
            user_wallet_resp.balance = user_wallet_info.balance

        user_response.user_id = user.id
        user_response.user_name = user.name
        user_response.user_email = user.email
        user_response.created_at = getattr(user, "created_at", None)
        
        user_response.register_type = user.register_type.value
        
        user_tasks = user_task.user_tasks_by_id(user.id)
        completed_task_ids = {t.task_id for t in user_tasks if getattr(t, "task_status", 0) == 1}
        user_response.onboarding_tasks = [{"task_id": tid, "task_status": 1 if tid in completed_task_ids else 0} for tid in user_task_ids]

        # print("register_type",user.register_type)
        # if user.register_type:
        #     user_response.register_type = user.register_type.value
        user_response.wallet = user_wallet_resp
        return ResponseUtils.success(user_response)
    return ResponseUtils.error(message="not found user", code=500)

@router.put("/password",response_model=dict)
def update_password(
    request: Request,
    body: dict = Body(...),
    auth_service: AuthService = Depends(get_auth_service),
    ) -> dict:
    """Update user password."""
    password = body.get("password")
    if not password:
        return ResponseUtils.error(message="password is required", code=400)
    user = UserUtils.get_request_user(request)
    if user:
        token = auth_service.update_password(user.id, password)
        if token is None:
            return ResponseUtils.error(message="update password failed", code=403)
        user_token = UserUtils.get_request_user_token(request)
        auth_service.logout(user_token)
        return ResponseUtils.success(data={"user_token":token})

    return ResponseUtils.error(message="not found user", code=404)

