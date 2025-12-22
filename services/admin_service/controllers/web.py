from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.common.utils.validation_utils import ValidationUtils
from services.admin_service.services.mcp_manager_service import McpManagerService
from services.common.logging_config import get_logger
from services.admin_service.utils.user_utils import UserUtils
from services.admin_service.services.resource_group_service import ResourceGroupService
from services.common import error_msg



logger = get_logger(__name__)

router = APIRouter(tags=["front"])


def get_mcp_manager(db: Session = Depends(get_db)) -> McpManagerService:
    return McpManagerService(db)

def get_resource_group_service(db: Session = Depends(get_db)) -> ResourceGroupService:
    return ResourceGroupService(db)


@router.get("/mcp_services", summary="Get public MCP services list")
def get_public_mcp_services(
    keyword: Optional[str] = Query(None, description="Search keyword"),
    page: Optional[int] = Query(1, description="Page number (starts from 1)"),
    page_size: Optional[int] = Query(10, description="Page size (default 10)"),
    mcp_manager_service: McpManagerService = Depends(get_mcp_manager),
):
    """Get paginated list of public MCP services with keyword search."""

    # Validate pagination parameters using ValidationUtils
    validated_page, validated_page_size = ValidationUtils.validate_pagination(page, page_size)

    # Set default keyword if not provided
    search_keyword = keyword.strip() if keyword else ""

    logger.info(f"Fetching public MCP services - page: {validated_page}, size: {validated_page_size}, keyword: '{search_keyword}'")

    # Get service list - let any exception bubble up to middleware
    service_list, total = mcp_manager_service.get_public_services_paginated(
        keyword=search_keyword, page=validated_page, page_size=validated_page_size
    )

    logger.info(f"Successfully retrieved {len(service_list)} services")
    return ResponseUtils.success_page(data=service_list, page_num=validated_page, page_size=validated_page_size, total=total)


@router.get("/mcp_service_info", summary="Get public MCP service information")
def get_public_mcp_service_info(
    request: Request,
    id: str = Query(..., description="Service ID"),
    mcp_manager_service: McpManagerService = Depends(get_mcp_manager),
    resource_group_service: ResourceGroupService = Depends(get_resource_group_service),
):
    """Get detailed information of a public MCP service by ID."""

    # Validate service ID parameter
    ValidationUtils.require_non_empty_string(id, "id")

    logger.info(f"Fetching public MCP service info for ID: {id}")

    # Get service information - let any exception bubble up to middleware
    service_info = mcp_manager_service.get_public_service_info(id)
    if not service_info:
        return ResponseUtils.error(error_msg=error_msg.RESOURCE_NOT_FOUND)
    
    # Validate that service exists
    ValidationUtils.require_resource_exists(service_info, "service")

    logger.info(f"Successfully retrieved service info for ID: {id}")
    return ResponseUtils.success(data=service_info)
