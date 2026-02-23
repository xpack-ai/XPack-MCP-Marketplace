from fastapi import APIRouter, Depends, Request, Body
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.common.response.apikey_response import ApikeyResponse
from services.admin_service.services.user_apikey_service import UserApiKeyService
from services.admin_service.utils.user_utils import UserUtils
from services.common.models.user_apikey import UserApiKey
from services.common import error_msg



router = APIRouter()


def get_apikey_service(db: Session = Depends(get_db)) -> UserApiKeyService:
    return UserApiKeyService(db)


def convert_to_apikey_response(user_apikey: UserApiKey) -> ApikeyResponse:
    """Convert UserApiKey model to ApikeyResponse"""
    return ApikeyResponse(
        apikey_id=user_apikey.id,
        name=user_apikey.name,
        description=user_apikey.description,
        apikey=user_apikey.apikey,
        expire_at=user_apikey.expire_at,
        create_time=user_apikey.created_at,
    )


@router.post("/info", summary="add apikey")
def add_apikey(request: Request, apikey_service: UserApiKeyService = Depends(get_apikey_service), body: dict = Body(...)):
    """Create a new API key for the user."""
    if not UserUtils.is_normal_user(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    user_id = UserUtils.get_request_user_id(request)
    name = body.get("name")
    if name is None:
        return ResponseUtils.error(message="name are required")
    try:
        user_apikey = apikey_service.create(user_id=user_id, name=name)
        if not user_apikey:
            return ResponseUtils.error(message="Create failed")
        return ResponseUtils.success(data=convert_to_apikey_response(user_apikey))
    except ValueError as e:
        return ResponseUtils.error(message=str(e))
    


@router.get("/list", summary="get user apikey list")
def get_user_apikey_list(request: Request, apikey_service: UserApiKeyService = Depends(get_apikey_service)):
    """Get list of API keys for the current user."""
    if not UserUtils.is_normal_user(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    user_id = UserUtils.get_request_user_id(request)
    apikey_list = apikey_service.get_by_user_id(user_id)
    data = [convert_to_apikey_response(item) for item in apikey_list]
    return ResponseUtils.success(data=data)


@router.delete("/info", summary="delete user apikey")
def delete_apikey(request: Request, apikey_service: UserApiKeyService = Depends(get_apikey_service), body: dict = Body(...)):
    """Delete an API key by ID for the current user."""
    if not UserUtils.is_normal_user(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    user_id = UserUtils.get_request_user_id(request)
    id = body.get("apikey_id")
    if id is None:
        return ResponseUtils.error(message="id are required")
    apikey_obj = apikey_service.delete(id, user_id)
    if not apikey_obj:
        return ResponseUtils.error(message="Delete failed or not found or no permission")
    return ResponseUtils.success(data=convert_to_apikey_response(apikey_obj))


@router.put("/info", summary="modify user apikey")
def modify_apikey(request: Request, apikey_service: UserApiKeyService = Depends(get_apikey_service), body: dict = Body(...)):
    """Update API key information for the current user."""
    if not UserUtils.is_normal_user(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    user_id = UserUtils.get_request_user_id(request)
    id = body.get("apikey_id")
    name = body.get("name")
    description = body.get("description")
    expire_at = body.get("expire_at")
    if id is None:
        return ResponseUtils.error(message="id are required")
    try:
        apikey_obj = apikey_service.modify(id, user_id, name=name, description=description, expire_at=expire_at)
        if not apikey_obj:
            return ResponseUtils.error(message="Modify failed or not found or no permission")
        return ResponseUtils.success(data=convert_to_apikey_response(apikey_obj))
    except ValueError as e:
        return ResponseUtils.error(message=str(e))
