"""Admin MCP service management controller.

Includes endpoints to enable/disable services, update/delete services,
import OpenAPI definitions, and query service info and lists.
"""
import logging
from fastapi import APIRouter, Depends, Request, Body, UploadFile, File, HTTPException, Form
from pydantic import BaseModel, HttpUrl
from typing import Optional
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.common.utils.validation_utils import ValidationUtils
from services.admin_service.services.openapi_manager import openapi_manager
from services.admin_service.services.mcp_manager_service import McpManagerService, parse_tags_to_array
from services.admin_service.utils.user_utils import UserUtils
from services.common import error_msg
from services.common.models.mcp_service import ChargeType
from services.admin_service.services.resource_group_service import ResourceGroupService

logger = logging.getLogger(__name__)

router = APIRouter()


class OpenApiRequest(BaseModel):
    url: Optional[HttpUrl] = None
    description: Optional[str] = None


def get_mcp_manager(db: Session = Depends(get_db)) -> McpManagerService:
    return McpManagerService(db)

def get_resource_group_service(db: Session = Depends(get_db)) -> ResourceGroupService:
    return ResourceGroupService(db)

@router.put("/service/enabled", summary="On/Off MCP service")
def update_mcp_service_enabled(request: Request, body: dict = Body(...), mcp_manager_service: McpManagerService = Depends(get_mcp_manager)):
    """Enable or disable MCP service by ID."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)

    id = body.get("id")
    enabled = body.get("enabled")
    if id is None or enabled is None:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)

    mcp_manager_service.update_enabled(id=id, enabled=enabled)
    return ResponseUtils.success()


@router.put("/service", summary="Update MCP service information")
def update_mcp_service_info(request: Request, body: dict = Body(...), mcp_manager_service: McpManagerService = Depends(get_mcp_manager)):
    """Update MCP service information and configuration."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)

    # Validate ID is required
    if not body.get("id"):
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    # Validate price is a positive number if charge_type is per_token
    if body.get("charge_type") == ChargeType.PER_CALL:
        price = body.get("price")
        if price is None or price < 0:
            return ResponseUtils.error(error_msg=error_msg.INVALID_PRICE)
    if body.get("charge_type") == ChargeType.PER_TOKEN:
        input_token = body.get("input_token")
        output_token = body.get("output_token")
        
        if input_token is None or input_token < 0:
            return ResponseUtils.error(error_msg=error_msg.INVALID_INPUT_TOKEN)
        if output_token is None or output_token < 0:
            return ResponseUtils.error(error_msg=error_msg.INVALID_OUTPUT_TOKEN)
            
    base_url = body.get("base_url")
    if base_url is not None:
        try:
            ValidationUtils.validate_url(base_url, "url")
        except Exception:
            return ResponseUtils.error(error_msg=error_msg.INVALID_URL)

    try:
        mcp_manager_service.update(body)
        return ResponseUtils.success()
    except ValueError as e:
        return ResponseUtils.error(message=str(e))
    except Exception as e:
        logger.error(f"Failed to update service: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)


@router.delete("/service", summary="Delete MCP service")
def delete_mcp_service(request: Request, body: dict = Body(...), mcp_manager_service: McpManagerService = Depends(get_mcp_manager)):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    """Delete MCP service by ID."""
    id = body.get("id")
    if not id:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)

    mcp_manager_service.delete(id)
    return ResponseUtils.success()


@router.post("/openapi_parse", summary="openapi import", response_model=dict)
async def openapi_parse(
    request: Request,
    url: Optional[HttpUrl] = Form(None, description="OpenAPI document URL (optional)"),
    file: Optional[UploadFile] = File(None, description="OpenAPI document file (JSON/YAML, optional)"),
    mcp_manager_service: McpManagerService = Depends(get_mcp_manager),
):
    """Parse and import OpenAPI document from URL or file upload."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    try:
        if url:
            url_str = str(url)
            is_valid = await openapi_manager.validate_openapi_url(url_str)
            if not is_valid:
                return ResponseUtils.error(error_msg=error_msg.INVALID_URL)
            openapi_for_ai = await openapi_manager.download_openapi_from_url(url_str)
        elif file:
            openapi_for_ai = await openapi_manager.parse_openapi_from_upload(file)
        else:
            return ResponseUtils.error(error_msg=error_msg.MISSING_URL_OR_FILE)

        # Create MCP service
        service_id = mcp_manager_service.create_service_from_openapi(openapi_for_ai)

        result = {"service_id": service_id}

        return ResponseUtils.success(data=result)
    except HTTPException as e:
        logger.error(f"Request failed: {e.detail}")
        return ResponseUtils.error(message=f"Request failed, please contact the administrator.", code=e.status_code)
    except Exception as e:
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)


@router.post("/openapi_parse_update", summary="OpenAPI parse (update)", response_model=dict)
async def openapi_parse_update(
    request: Request,
    id: str = Form(..., description="Service ID"),
    url: Optional[HttpUrl] = Form(None, description="OpenAPI document URL (optional)"),
    file: Optional[UploadFile] = File(None, description="OpenAPI document file (JSON/YAML, optional)"),
    mcp_manager_service: McpManagerService = Depends(get_mcp_manager),
):
    """Parse OpenAPI document and update existing service with temporary data."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)

    try:
        # Validate URL or file must be provided
        if not url and not file:
            return ResponseUtils.error(error_msg=error_msg.MISSING_URL_OR_FILE)

        # Parse OpenAPI document
        if url:
            url_str = str(url)
            is_valid = await openapi_manager.validate_openapi_url(url_str)
            if not is_valid:
                return ResponseUtils.error(error_msg=error_msg.INVALID_URL)
            openapi_for_ai = await openapi_manager.download_openapi_from_url(url_str)
        elif file:  # file is not None here
            openapi_for_ai = await openapi_manager.parse_openapi_from_upload(file)
        else:
            return ResponseUtils.error(error_msg=error_msg.MISSING_URL_OR_FILE)

        # Update service and save into temporary table
        result = mcp_manager_service.update_service_from_openapi(id, openapi_for_ai)

        return ResponseUtils.success(data=result)
    except ValueError as e:
        return ResponseUtils.error(message=str(e))
    except HTTPException as e:
        logger.error(f"Request failed: {e.detail}")
        return ResponseUtils.error(message=f"Request failed, please contact the administrator.", code=e.status_code)
    except Exception as e:
        logger.error(f"Failed to update service from OpenAPI: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)


@router.get("/service/info", summary="Get MCP service information")
def get_mcp_service_info(request: Request, id: str, mcp_manager_service: McpManagerService = Depends(get_mcp_manager)):
    """Get detailed information of a specific MCP service including API list."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)

    try:
        if not id:
            return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)

        service_info = mcp_manager_service.get_service_info(id)
        if not service_info:
            return ResponseUtils.error(error_msg=error_msg.NOT_FOUND)

        return ResponseUtils.success(data=service_info)
    except Exception as e:
        logger.error(f"Failed to get service info: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)


@router.get("/service/list", summary="Get MCP service list")
def get_mcp_service_list(
    request: Request, page: int = 1, page_size: int = 10,keyword: str = "",filter_status: str = "", mcp_manager_service: McpManagerService = Depends(get_mcp_manager)
):
    """Get paginated list of all MCP services."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    status = None
    if filter_status:
        status = filter_status.split(",")
    try:
        # Fetch paginated data
        try:
            services, total = mcp_manager_service.get_all_paginated(page=page, page_size=page_size,keyword=keyword,filter_status=status)
        except AttributeError:
            # Fallback to non-paginated method when missing
            all_services = mcp_manager_service.get_all()
            total = len(all_services)
            start = (page - 1) * page_size
            end = start + page_size
            services = all_services[start:end]
        service_list = []

        for service in services:
            service_dict = {
                "id": service.id,
                "name": service.name,
                "slug_name": service.slug_name,
                "short_description": service.short_description,
                "long_description": service.long_description,
                "base_url": service.base_url,
                "charge_type": service.charge_type.value if service.charge_type else None,
                "price": str(float(service.price)) if service.price and service.charge_type == ChargeType.PER_CALL else "0.00",
                "input_token_price": str(float(service.input_token_price)) if service.input_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",
                "output_token_price": str(float(service.output_token_price)) if service.output_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",
                "enabled": service.enabled,
                "tags": parse_tags_to_array(service.tags),
                "created_at": str(service.created_at) if service.created_at else None,
                "updated_at": str(service.updated_at) if service.updated_at else None,
            }
            service_list.append(service_dict)

        return ResponseUtils.success_page(data=service_list, page_num=page, page_size=page_size, total=total)
    except Exception as e:
        logger.error(f"Failed to get service list: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)

@router.get("/service/list/simple", summary="Get MCP service simple list")
def get_mcp_service_simple_list(
    request: Request, mcp_manager_service: McpManagerService = Depends(get_mcp_manager)
):
    """Get paginated list of all MCP services."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)

    try:
        # Fetch paginated data
        services = mcp_manager_service.get_all()
        service_list = [
            {
                "id": service.id,
                "name": service.name,
                "slug_name": service.slug_name,
                "base_url": service.base_url,
                "charge_type": service.charge_type.value if service.charge_type else None,
                "price": str(float(service.price)) if service.price and service.charge_type == ChargeType.PER_CALL else "0.00",
                "input_token_price": str(float(service.input_token_price)) if service.input_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",
                "output_token_price": str(float(service.output_token_price)) if service.output_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",
                "enabled": service.enabled,
            }
            for service in services
        ]
        return ResponseUtils.success(data=service_list)
    except Exception as e:
        logger.error(f"Failed to get service simple list: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)

@router.get("/service/tags", summary="Get MCP service tags")
def get_mcp_service_tags(
    request: Request,
    mcp_manager_service: McpManagerService = Depends(get_mcp_manager),
):
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    try:
        tags = mcp_manager_service.get_tags_list(enabled_only=False)
        return ResponseUtils.success(data=tags)
    except Exception as e:
        logger.error(f"Failed to get service tags: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)

@router.get("/service/resource_group/list", summary="Get MCP service's resource group list")
def get_mcp_service_resource_group_list(
    request: Request,
    id: str,
    page: int = 1,
    page_size: int = 10,
    keyword: Optional[str] = None,
    resource_group_service: ResourceGroupService = Depends(get_resource_group_service),
):
    """Get paginated list of all MCP services' resource groups."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    if not id:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    try:
        # Fetch paginated data
        list,total = resource_group_service.get_bind_groups(id, page=page, page_size=page_size, keyword=keyword)
        
        return ResponseUtils.success_page(data=list, page_num=page, page_size=page_size, total=total)
    except Exception as e:
        logger.error(f"Failed to get service simple list: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)

@router.get("/service/resource_group/list/unbind", summary="Get MCP service's unbind resource group list")
def get_mcp_service_unbind_resource_group_list(
    request: Request,
    id: str,
    resource_group_service: ResourceGroupService = Depends(get_resource_group_service),
):
    """Get paginated list of all MCP services' unbind resource groups."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    if not id:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    try:
        # Fetch paginated data
        list = resource_group_service.get_unbind_groups(id)
        
        return ResponseUtils.success(data=list)
    except Exception as e:
        logger.error(f"Failed to get unbind resource group list: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)
        

@router.put("/service/resource_group", summary="Bind resource groups to MCP service")
def bind_group(
    request: Request,
    id: str,
    body: dict = Body(...),
    resource_group_service: ResourceGroupService = Depends(get_resource_group_service),
):
    """Bind resource groups to MCP service."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    if not id:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    group_ids = body.get("resource_groups") 
    if not group_ids:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    try:
        # Fetch paginated data
        resource_group_service.bind_groups(id, group_ids)
        
        return ResponseUtils.success()
    except Exception as e:
        logger.error(f"Failed to bind resource groups: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)

@router.delete("/service/resource_group", summary="Unbind resource groups from MCP service")
def unbind_group(
    request: Request,
    id: str,
    body: dict = Body(...),
    resource_group_service: ResourceGroupService = Depends(get_resource_group_service),
):
    """Unbind resource groups from MCP service."""
    if not UserUtils.is_admin(request):
        return ResponseUtils.error(error_msg=error_msg.NO_PERMISSION)
    if not id:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    group_ids = body.get("resource_groups")
    if not group_ids:
        return ResponseUtils.error(error_msg=error_msg.MISSING_PARAMETER)
    try:
        # Fetch paginated data
        resource_group_service.unbind_groups(id, group_ids)
        
        return ResponseUtils.success()
    except Exception as e:
        logger.error(f"Failed to unbind resource groups: {str(e)}")
        return ResponseUtils.error(error_msg=error_msg.INTERNAL_ERROR)
