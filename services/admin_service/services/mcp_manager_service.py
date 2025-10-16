import logging
import uuid
import json
import re
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import Optional, Tuple, List
from services.admin_service.repositories.mcp_service_repository import McpServiceRepository
from services.admin_service.repositories.mcp_tool_api_repository import McpToolApiRepository
from services.admin_service.repositories.temp_mcp_service_repository import TempMcpServiceRepository
from services.admin_service.repositories.temp_mcp_tool_api_repository import TempMcpToolApiRepository
from services.common.models.mcp_service import McpService, AuthMethod, ChargeType
from services.common.models.mcp_tool_api import McpToolApi, HttpMethod
from services.common.models.temp_mcp_service import TempMcpService, AuthMethod as TempAuthMethod, ChargeType as TempChargeType
from services.common.models.temp_mcp_tool_api import TempMcpToolApi, HttpMethod as TempHttpMethod
from services.admin_service.services.openapi_helper import OpenApiForAI

logger = logging.getLogger(__name__)

# Utility function: Convert tags string to array
def parse_tags_to_array(tags_str: Optional[str]) -> List[str]:
    """
    Convert tags string to array
    
    Args:
        tags_str: tags string, separated by commas
        
    Returns:
        List[str]: tags array
    """
    if not tags_str:
        return []
    
    # Split by comma, remove whitespace
    tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
    return tags


# Utility function: Convert tags array to string
def parse_tags_to_string(tags_array: Optional[list]) -> str:
    """
    Convert tags array to string
    
    Args:
        tags_array: tags array
        
    Returns:
        str: tags string, separated by commas
    """
    if not tags_array or not isinstance(tags_array, list):
        return ""
    
    # Filter empty strings, remove whitespace, join with commas
    tags = [str(tag).strip() for tag in tags_array if str(tag).strip()]
    return ','.join(tags)


def normalize_slug_name(text: str) -> str:
    """Convert text to slug-suitable English string"""
    # Remove non-English characters, keep only letters, numbers, spaces, hyphens, underscores
    normalized = re.sub(r"[^\w\s\-]", "", text, flags=re.ASCII)
    # Convert spaces and hyphens to underscores, convert to lowercase
    normalized = normalized.lower().replace(" ", "_").replace("-", "_")
    # Remove extra underscores
    normalized = re.sub(r"_+", "_", normalized).strip("_")
    # If result is empty or too short, use default value
    if not normalized or len(normalized) < 3:
        normalized = f"service_{str(uuid.uuid4())[:8]}"
    return normalized


class McpManagerService:
    def __init__(self, db: Session):
        self.db = db
        self.mcp_service_repository = McpServiceRepository(db)
        self.mcp_tool_api_repository = McpToolApiRepository(db)
        self.temp_mcp_service_repository = TempMcpServiceRepository(db)
        self.temp_mcp_tool_api_repository = TempMcpToolApiRepository(db)

    def update_enabled(self, id: str, enabled: int) -> McpService:
        return self.mcp_service_repository.update_enabled(id, enabled)

    def delete(self, id: str) -> Optional[McpService]:
        return self.mcp_service_repository.delete(id)

    def update(self, body: dict) -> bool:
        # Update mcp_service
        service_id = body.get("id")
        if not service_id:
            raise ValueError("Service ID is required")

        # Get update type, default is "default"
        update_type = body.get("update_type", "default")

        # Get existing service
        existing_service = self.mcp_service_repository.get_by_id(service_id)
        if not existing_service:
            raise ValueError("Service not found")

        # If it's an openapi type update, need to migrate data from temporary table first
        if update_type == "openapi":
            # 1. Verify temporary data exists
            temp_service = self.temp_mcp_service_repository.get_by_id(service_id)
            if not temp_service:
                raise ValueError("No temporary data found for OpenAPI update")

            # 2. Delete existing API data
            self.mcp_tool_api_repository.delete_by_service_id(service_id)

            # 3. Update service information with temporary table data
            existing_service.name = temp_service.name
            existing_service.short_description = temp_service.short_description
            existing_service.long_description = temp_service.long_description
            existing_service.headers = temp_service.headers
            # existing_service.auth_method = AuthMethod(temp_service.auth_method.value)
            existing_service.base_url = temp_service.base_url
            # existing_service.auth_header = temp_service.auth_header
            # existing_service.auth_token = temp_service.auth_token
            existing_service.charge_type = ChargeType(temp_service.charge_type.value)
            existing_service.price = temp_service.price
            existing_service.input_token_price = temp_service.input_token_price
            existing_service.output_token_price = temp_service.output_token_price
            existing_service.enabled = temp_service.enabled
            existing_service.tags = temp_service.tags

            # 4. Migrate API data from temporary table to formal table
            temp_apis = self.temp_mcp_tool_api_repository.get_by_service_id(service_id)
            for temp_api in temp_apis:
                new_api = McpToolApi()
                new_api.id = temp_api.id
                new_api.service_id = temp_api.service_id
                new_api.name = temp_api.name
                new_api.description = temp_api.description
                new_api.path = temp_api.path
                new_api.method = HttpMethod(temp_api.method.value)
                new_api.header_parameters = temp_api.header_parameters
                new_api.query_parameters = temp_api.query_parameters
                new_api.path_parameters = temp_api.path_parameters
                new_api.request_body_schema = temp_api.request_body_schema
                new_api.response_schema = temp_api.response_schema
                new_api.response_examples = temp_api.response_examples
                new_api.response_headers = temp_api.response_headers
                new_api.operation_examples = temp_api.operation_examples
                new_api.enabled = temp_api.enabled
                new_api.is_deleted = temp_api.is_deleted

                # Save new API record
                self.mcp_tool_api_repository.create(new_api)

            # 5. Clean up temporary table data
            self.temp_mcp_service_repository.delete_by_service_id(service_id)
            self.temp_mcp_tool_api_repository.delete_by_service_id(service_id)

        # Execute regular update logic (applies to both types)
        # Only update provided fields
        if "name" in body and body["name"] is not None:
            existing_service.name = body["name"]
        if "slug_name" in body and body["slug_name"] is not None:
            existing_service.slug_name = body["slug_name"]
        if "enabled" in body and body["enabled"] is not None:
            existing_service.enabled = body["enabled"]
        if "short_description" in body and body["short_description"] is not None:
            existing_service.short_description = body["short_description"]
        if "long_description" in body and body["long_description"] is not None:
            existing_service.long_description = body["long_description"]
        if "headers" in body and body["headers"] is not None:
            if isinstance(body["headers"], str):
                existing_service.headers = body["headers"]
            elif isinstance(body["headers"], list):
                existing_service.headers = json.dumps(body["headers"])
        else:
            existing_service.headers = "[]"
        
        if "base_url" in body and body["base_url"] is not None:
            existing_service.base_url = body["base_url"]
       
        if "charge_type" in body and body["charge_type"] is not None:
            charge_type_value = body["charge_type"]
            try:
                if isinstance(charge_type_value, str):
                    existing_service.charge_type = ChargeType(charge_type_value.lower())
                else:
                    existing_service.charge_type = charge_type_value
            except ValueError:
                # If the provided value is not a valid ChargeType, default to FREE
                existing_service.charge_type = ChargeType.FREE
        match existing_service.charge_type:
            case ChargeType.PER_CALL:
                if "price" in body and body["price"] is not None:
                    existing_service.price = body["price"]
            case ChargeType.PER_TOKEN:
                if "input_token_price" in body and body["input_token_price"] is not None:
                    existing_service.input_token_price = body["input_token_price"]
                if "output_token_price" in body and body["output_token_price"] is not None:
                    existing_service.output_token_price = body["output_token_price"]
        if "tags" in body and body["tags"] is not None:
            # If provided as array, convert to string for storage
            if isinstance(body["tags"], list):
                existing_service.tags = parse_tags_to_string(body["tags"])
            else:
                # If provided as string, store directly
                existing_service.tags = body["tags"]

        # Commit changes
        self.db.commit()
        self.db.refresh(existing_service)

        # Update mcp_tool_api list (if provided and not openapi type update)
        # For openapi type, APIs have already been migrated from temporary table above
        if update_type != "openapi" and "apis" in body and body["apis"] is not None:
            for tool_api_data in body["apis"]:
                api_id = tool_api_data.get("id")
                if not api_id:
                    continue

                existing_api = self.mcp_tool_api_repository.get_by_id(api_id)
                if not existing_api:
                    continue

                # Only update provided API fields
                if "name" in tool_api_data and tool_api_data["name"] is not None:
                    existing_api.name = tool_api_data["name"]
                if "description" in tool_api_data and tool_api_data["description"] is not None:
                    existing_api.description = tool_api_data["description"]
                if "path" in tool_api_data and tool_api_data["path"] is not None:
                    existing_api.path = tool_api_data["path"]
                if "method" in tool_api_data and tool_api_data["method"] is not None:
                    existing_api.method = tool_api_data["method"]
                if "header_parameters" in tool_api_data and tool_api_data["header_parameters"] is not None:
                    existing_api.header_parameters = tool_api_data["header_parameters"]
                if "query_parameters" in tool_api_data and tool_api_data["query_parameters"] is not None:
                    existing_api.query_parameters = tool_api_data["query_parameters"]
                if "path_parameters" in tool_api_data and tool_api_data["path_parameters"] is not None:
                    existing_api.path_parameters = tool_api_data["path_parameters"]
                if "request_body_schema" in tool_api_data and tool_api_data["request_body_schema"] is not None:
                    existing_api.request_body_schema = tool_api_data["request_body_schema"]
                if "response_schema" in tool_api_data and tool_api_data["response_schema"] is not None:
                    # If passed as dict, convert to JSON string
                    if isinstance(tool_api_data["response_schema"], dict):
                        existing_api.response_schema = json.dumps(tool_api_data["response_schema"])
                    else:
                        existing_api.response_schema = str(tool_api_data["response_schema"])
                if "response_examples" in tool_api_data and tool_api_data["response_examples"] is not None:
                    existing_api.response_examples = tool_api_data["response_examples"]
                if "response_headers" in tool_api_data and tool_api_data["response_headers"] is not None:
                    existing_api.response_headers = tool_api_data["response_headers"]
                if "operation_examples" in tool_api_data and tool_api_data["operation_examples"] is not None:
                    existing_api.operation_examples = tool_api_data["operation_examples"]
                if "enabled" in tool_api_data and tool_api_data["enabled"] is not None:
                    existing_api.enabled = tool_api_data["enabled"]

                # Commit API changes
                self.db.commit()
                self.db.refresh(existing_api)

        return True

    def get_by_id(self, id: str) -> Optional[McpService]:
        return self.mcp_service_repository.get_by_id(id)

    def get_service_info(self, id: str) -> Optional[dict]:
        """Get service details including API list"""
        service = self.mcp_service_repository.get_by_id(id)
        if not service:
            return None

        # Get service's API list
        apis = self.mcp_tool_api_repository.get_by_service_id(id)
        # Build return data
        service_info = {
            "id": service.id,
            "name": service.name,
            "slug_name": service.slug_name,
            "short_description": service.short_description,
            "long_description": service.long_description,
            "base_url": service.base_url,
            "headers":json.loads(service.headers) if service.headers else [],
            "charge_type": service.charge_type.value if service.charge_type else None,
            "price": str(float(service.price)) if service.price and service.charge_type == ChargeType.PER_CALL else "0.00",
            "input_token_price": str(float(service.input_token_price)) if service.input_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",
            "output_token_price": str(float(service.output_token_price)) if service.output_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",
            "enabled": service.enabled,
            "tags": parse_tags_to_array(service.tags),
            "apis": [{"id": api.id, "name": api.name, "description": api.description,"url":api.path} for api in apis],
        }

        return service_info

    def get_all(self) -> List[McpService]:
        return self.mcp_service_repository.get_all()

    def get_all_paginated(self, page: int = 1, page_size: int = 10) -> Tuple[List[McpService], int]:
        """Get service list with pagination"""
        return self.mcp_service_repository.get_all_paginated(page=page, page_size=page_size)

    def create_service_from_openapi(self, openapi_data: OpenApiForAI) -> str:
        # Convert OpenApiForAI info to McpService object and McpToolApi object list, return service ID or exception.
        try:
            # Generate service ID
            service_id = str(uuid.uuid4())

            # Create MCP service
            mcp_service = McpService()
            mcp_service.id = service_id
            mcp_service.name = openapi_data.title

            # Generate unique slug_name
            base_slug = normalize_slug_name(openapi_data.title)
            slug_name = base_slug
            counter = 1

            while True:
                # Check if slug_name already exists
                try:
                    existing_service = self.mcp_service_repository.get_by_slug_name(slug_name)
                    if not existing_service:
                        break
                except AttributeError:
                    # If method doesn't exist, directly break and use current slug_name
                    break
                # If exists, append number
                slug_name = f"{base_slug}-{counter}"
                counter += 1

            mcp_service.slug_name = slug_name
            mcp_service.short_description = openapi_data.description[:255] if openapi_data.description else openapi_data.title
            mcp_service.long_description = openapi_data.description
            mcp_service.base_url = ""  # Requires user configuration later
            mcp_service.headers = "[]"
            mcp_service.charge_type = ChargeType.FREE  # Default to free
            mcp_service.price = 0.0
            mcp_service.enabled = 0  # Default disabled, requires manual activation by user

            # Save service
            self.mcp_service_repository.create(mcp_service)

            # Create API endpoints
            for api in openapi_data.apis:
                tool_api = McpToolApi()
                tool_api.id = str(uuid.uuid4())
                tool_api.service_id = service_id
                tool_api.name = api.summary or f"{api.method} {api.path}"
                tool_api.description = api.description or api.summary
                tool_api.path = api.path
                tool_api.method = HttpMethod(api.method)
                tool_api.header_parameters = json.dumps(api.header_parameters) if api.header_parameters else ""
                tool_api.query_parameters = json.dumps(api.query_parameters) if api.query_parameters else ""
                tool_api.path_parameters = json.dumps(api.path_parameters) if api.path_parameters else ""
                tool_api.request_body_schema = json.dumps(api.request_body_schema) if api.request_body_schema else ""
                tool_api.response_schema = json.dumps(api.response_schema) if api.response_schema else ""
                tool_api.response_examples = json.dumps(api.response_examples) if api.response_examples else ""
                tool_api.response_headers = json.dumps(api.response_headers) if api.response_headers else ""
                tool_api.operation_examples = json.dumps(api.operation_examples) if api.operation_examples else ""
                tool_api.enabled = 1  # Default enabled
                tool_api.is_deleted = 0

                # Save API
                self.mcp_tool_api_repository.create(tool_api)

            return service_id

        except Exception as e:
            logger.error(f"Failed to create service from OpenAPI: {str(e)}")
            raise ValueError(f"Failed to create service from OpenAPI: {str(e)}")

    def update_service_from_openapi(self, service_id: str, openapi_data: OpenApiForAI) -> dict:
        """
        Update existing service based on OpenAPI data, save updated data to temporary table

        Args:
            service_id: ID of service to update
            openapi_data: Parsed OpenAPI data

        Returns:
            dict: Dictionary containing complete service info and API list

        Raises:
            ValueError: When service doesn't exist or update fails
        """
        try:
            # 1. Check if original service exists
            existing_service = self.mcp_service_repository.get_by_id(service_id)
            if not existing_service:
                raise ValueError(f"Service with ID {service_id} not found")

            # 2. Clean up old temporary data for this service
            self.temp_mcp_service_repository.delete_by_service_id(service_id)
            self.temp_mcp_tool_api_repository.delete_by_service_id(service_id)

            # 3. Create updated temporary service record
            temp_service = TempMcpService()
            temp_service.id = service_id
            temp_service.name = openapi_data.title or existing_service.name
            temp_service.slug_name = existing_service.slug_name  # Keep original slug_name
            temp_service.short_description = openapi_data.description or existing_service.short_description
            temp_service.long_description = openapi_data.description or existing_service.long_description
            # temp_service.auth_method = TempAuthMethod(existing_service.auth_method.value)  # Keep original auth method
            temp_service.base_url = existing_service.base_url  # Keep original base_url
            # temp_service.auth_header = existing_service.auth_header
            # temp_service.auth_token = existing_service.auth_token
            temp_service.headers = existing_service.headers  # Keep original headers
            temp_service.charge_type = TempChargeType(existing_service.charge_type.value)  # Keep original charge type
            temp_service.price = existing_service.price  # Keep original price
            temp_service.enabled = existing_service.enabled  # Keep original enabled status
            temp_service.tags = existing_service.tags  # Keep original tags

            # Save temporary service record
            self.temp_mcp_service_repository.create(temp_service)

            # 4. Create updated temporary API records
            temp_apis = []
            for api in openapi_data.apis:
                temp_api = TempMcpToolApi()
                temp_api.id = str(uuid.uuid4())
                temp_api.service_id = service_id
                temp_api.name = api.summary or api.path
                temp_api.description = api.description or api.summary or ""
                temp_api.path = api.path
                temp_api.method = TempHttpMethod(api.method.upper())
                temp_api.header_parameters = json.dumps(api.header_parameters) if api.header_parameters else ""
                temp_api.query_parameters = json.dumps(api.query_parameters) if api.query_parameters else ""
                temp_api.path_parameters = json.dumps(api.path_parameters) if api.path_parameters else ""
                temp_api.request_body_schema = json.dumps(api.request_body_schema) if api.request_body_schema else ""
                temp_api.response_schema = json.dumps(api.response_schema) if api.response_schema else ""
                temp_api.response_examples = json.dumps(api.response_examples) if api.response_examples else ""
                temp_api.response_headers = json.dumps(api.response_headers) if api.response_headers else ""
                temp_api.operation_examples = json.dumps(api.operation_examples) if api.operation_examples else ""
                temp_api.enabled = 0  # Default disabled, requires admin confirmation
                temp_api.is_deleted = 0

                temp_apis.append(temp_api)

            # Batch save temporary API records
            if temp_apis:
                self.temp_mcp_tool_api_repository.create_batch(temp_apis)

            # 5. Build return data
            apis_list = []
            for temp_api in temp_apis:
                api_dict = {"id": temp_api.id, "name": temp_api.name, "description": temp_api.description}
                apis_list.append(api_dict)

            result = {
                "id": temp_service.id,
                "name": temp_service.name,
                "short_description": temp_service.short_description,
                "long_description": temp_service.long_description,
                "base_url": temp_service.base_url,
                "headers": json.loads(temp_service.headers) if temp_service.headers else [],
                "charge_type": temp_service.charge_type.value if temp_service.charge_type else None,
                "price": str(float(temp_service.price)) if temp_service.price and temp_service.charge_type == ChargeType.PER_CALL else "0.00",
                "input_token_price": str(float(temp_service.input_token_price)) if temp_service.input_token_price and temp_service.charge_type == ChargeType.PER_TOKEN else "0.00",
                "output_token_price": str(float(temp_service.output_token_price)) if temp_service.output_token_price and temp_service.charge_type == ChargeType.PER_TOKEN else "0.00",
                "enabled": temp_service.enabled,
                "tags": parse_tags_to_array(temp_service.tags),
                "apis": apis_list,
            }

            return result

        except Exception as e:
            logger.error(f"Failed to update service from OpenAPI: {str(e)}")
            raise ValueError(f"Failed to update service from OpenAPI: {str(e)}")

    def get_public_services_paginated(self, keyword: str, page: int = 1, page_size: int = 10) -> Tuple[List[dict], int]:
        """Get public services list with pagination, returns formatted data with API info"""
        services, total = self.mcp_service_repository.get_public_services_paginated(keyword, page, page_size)

        service_list = []
        for service in services:
            # Get service's API list
            apis = self.mcp_tool_api_repository.get_by_service_id(service.id)

            # Build API info
            api_list = []
            for api in apis:
                if api.enabled == 1:  # Only return enabled APIs
                    api_info = {"id": api.id, "name": api.name, "description": api.description}
                    api_list.append(api_info)

            # Build service info
            service_info = {
                "id": service.slug_name,
                "name": service.name,
                "short_description": service.short_description,
                "long_description": service.long_description,
                "tags": parse_tags_to_array(service.tags),
                "slug_name": service.slug_name,
                "charge_type": service.charge_type.value if service.charge_type else "free",
                "price": str(float(service.price)) if service.price and service.charge_type == ChargeType.PER_CALL else "0.00",
                "input_token_price": str(float(service.input_token_price)) if service.input_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",
                "output_token_price": str(float(service.output_token_price)) if service.output_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",

                "apis": api_list,
            }
            service_list.append(service_info)

        return service_list, total

    def get_public_service_info(self, id: str) -> Optional[dict]:
        """Get public service details (only returns enabled services and APIs)"""
        service = self.mcp_service_repository.get_by_id(id)
        if not service:
            service = self.mcp_service_repository.get_by_slug_name(id)
            if not service:
                return None
        if service.enabled != 1:
            return None

        # Get service's API list (only return enabled APIs)
        all_apis = self.mcp_tool_api_repository.get_by_service_id(service.id)
        apis = [api for api in all_apis if api.enabled == 1]

        # Build API info (according to API specification format)
        api_list = []
        for api in apis:
            api_info = {"id": api.id, "name": api.name, "description": api.description}
            api_list.append(api_info)

        # Build return data (according to API specification format)
        service_info = {
            "id": service.slug_name,
            "name": service.name,
            "short_description": service.short_description,
            "long_description": service.long_description,
            "slug_name": service.slug_name,
            "charge_type": service.charge_type.value if service.charge_type else "free",
            "price": str(float(service.price)) if service.price and service.charge_type == ChargeType.PER_CALL else "0.00",
            "input_token_price": str(float(service.input_token_price)) if service.input_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",
            "output_token_price": str(float(service.output_token_price)) if service.output_token_price and service.charge_type == ChargeType.PER_TOKEN else "0.00",

            "tags": parse_tags_to_array(service.tags),
            "apis": api_list,
        }

        return service_info
