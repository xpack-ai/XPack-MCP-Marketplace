import logging
import uuid
from fastapi import APIRouter, Depends, Request, Body
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.admin_service.utils.user_utils import UserUtils
from services.common import error_msg
from services.admin_service.services.resource_group_service import ResourceGroupService
from services.admin_service.services.sys_config_service import SysConfigService
from services.admin_service.constants.sys_config_key import KEY_DEFAULT_RESOURCE_GROUP


logger = logging.getLogger(__name__)

router = APIRouter()


def get_sysconfig_service(db: Session = Depends(get_db)) -> SysConfigService:
    return SysConfigService(db)

def get_resource_group_service(db: Session = Depends(get_db)) -> ResourceGroupService:
    return ResourceGroupService(db)


@router.post("", summary="Create resource group")
def create_group(
    request: Request, 
    body: dict = Body(...), 
    svc: ResourceGroupService = Depends(get_resource_group_service), 
    sys_svc: SysConfigService = Depends(get_sysconfig_service)
    ):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    gid = body.get("id")
    if not gid:
        gid = str(uuid.uuid4())
    name = body.get("name")
    description = body.get("description")
    if not name:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    is_default = body.get("is_default", False)
    try:
        svc.create_group(gid=gid, name=name, description=description)
        if is_default:
            sys_svc.set_value_by_key(key=KEY_DEFAULT_RESOURCE_GROUP, value=gid, description="Default resource group")
    except ValueError as e:
        return ResponseUtils.error(message=str(e))
    
    return ResponseUtils.success(data={"id": gid})


@router.put("", summary="Update resource group")
def update_group(request: Request,id: str, body: dict = Body(...), svc: ResourceGroupService = Depends(get_resource_group_service), sys_svc: SysConfigService = Depends(get_sysconfig_service)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    try:
        ok = svc.update_group(id, body)
        if not ok:
            return ResponseUtils.error(code=400,message="Failed to update group, check the input data")
        is_default = body.get("is_default", False)
        if is_default:
            sys_svc.set_value_by_key(key=KEY_DEFAULT_RESOURCE_GROUP, value=id, description="Default resource group")
        return ResponseUtils.success()
    except ValueError as e:
        return ResponseUtils.error(message=str(e))
    except Exception:
        logger.exception("Failed to update group")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)


@router.delete("", summary="Delete resource group")
def delete_group(request: Request, id: str, migrate_id: str | None = None, svc: ResourceGroupService = Depends(get_resource_group_service), sys_svc: SysConfigService = Depends(get_sysconfig_service)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    if not id:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    
    ok = svc.delete_group(id, migrate_id)
    if not ok:
        return ResponseUtils.error(error_msg=error_msg.NOT_FOUND)
    default_group = sys_svc.get_value_by_key(KEY_DEFAULT_RESOURCE_GROUP)
    if id == default_group:
        sys_svc.set_value_by_key(key=KEY_DEFAULT_RESOURCE_GROUP, value="", description="Default resource group")
    return ResponseUtils.success()


@router.get("/info", summary="Get resource group info")
def get_group_info(request: Request, id: str, svc: ResourceGroupService = Depends(get_resource_group_service), sys_svc: SysConfigService = Depends(get_sysconfig_service)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    default_group = sys_svc.get_value_by_key(KEY_DEFAULT_RESOURCE_GROUP)
    
    info = svc.get_info(id, default_group)
    if not info:
        return ResponseUtils.error(error_msg=error_msg.NOT_FOUND)
    return ResponseUtils.success(data=info)


@router.get("/list", summary="Get resource group list")
def get_group_list(request: Request, page: int = 1, page_size: int = 10, keyword: str | None = None, svc: ResourceGroupService = Depends(get_resource_group_service), sys_svc: SysConfigService = Depends(get_sysconfig_service)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    
    default_group = sys_svc.get_value_by_key(KEY_DEFAULT_RESOURCE_GROUP)
    groups, total = svc.list_groups(page=page, page_size=page_size, default_group=default_group, keyword=keyword)
    
    return ResponseUtils.success_page(data=groups, page_num=page, page_size=page_size, total=total)

@router.get("/list/simple", summary="Get resource group simple list")
def get_simple_group_list(request: Request, svc: ResourceGroupService = Depends(get_resource_group_service)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    
    groups = svc.simple_list_groups()
    data = [
        {
            "id": g.id,
            "name": g.name,
            "created_at": str(g.created_at) if g.created_at else None,
        }
        for g in groups
    ]
    return ResponseUtils.success(data=data)

@router.put("/service", summary="Bind services to group")
def bind_services(request: Request,id:str, body: dict = Body(...), svc: ResourceGroupService = Depends(get_resource_group_service)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    if not id:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    sids = body.get("services") or []
    svc.bind_services(id, list(map(str, sids)))
    return ResponseUtils.success()

@router.get("/service/list", summary="List services bound to group")
def list_bind_services(request: Request, id: str, page: int = 1, page_size: int = 10, keyword: str | None = None, svc: ResourceGroupService = Depends(get_resource_group_service)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    services,total = svc.get_bind_services(id, page=page, page_size=page_size, keyword=keyword)

    return ResponseUtils.success_page(data=services, page_num=page, page_size=page_size, total=total)

@router.get("/service/list/unbind", summary="List services bound to group")
def list_unbind_services(request: Request, id: str, svc: ResourceGroupService = Depends(get_resource_group_service)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    services = svc.get_unbind_services(id)

    return ResponseUtils.success(data=services)


@router.delete("/service", summary="Unbind one service from group")
def unbind_service(request: Request,id: str, body: dict = Body(...), svc: ResourceGroupService = Depends(get_resource_group_service)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    sids = body.get("services")
    if not id or not sids:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    svc.unbind_service(id, sids)
    return ResponseUtils.success()


