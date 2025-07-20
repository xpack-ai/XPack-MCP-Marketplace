import json
import mcp.types as types
from typing import List, Optional
from services.common.models.mcp_tool_api import McpToolApi
from services.common.models.mcp_service import McpService as McpServiceModel
from services.api_service.repositories.mcp_tool_api_repository import McpToolApiRepository
from services.api_service.repositories.mcp_service_repository import McpServiceRepository


class McpService:
    """MCP service business logic layer"""

    def __init__(self, tool_api_repository: McpToolApiRepository, service_repository: McpServiceRepository):
        self.tool_api_repository = tool_api_repository
        self.service_repository = service_repository

    def get_tools_by_service_id(self, service_id: str) -> List[types.Tool]:
        """
        Get all tools list for the service by service ID
        
        Args:
            service_id: Service ID
            
        Returns:
            List[types.Tool]: MCP tools list
        """
        # Get tool configuration from database
        tool_apis = self.tool_api_repository.get_by_service_id(service_id)
        
        # Convert to MCP tool format
        tools = []
        for tool_api in tool_apis:
            tool = self._convert_api_to_tool(tool_api)
            if tool:
                tools.append(tool)
        
        return tools

    def _convert_api_to_tool(self, tool_api: McpToolApi) -> Optional[types.Tool]:
        """
        Convert API configuration from database to MCP tool
        
        Args:
            tool_api: API configuration from database
            
        Returns:
            Optional[types.Tool]: Converted MCP tool, returns None if conversion fails
        """
        try:
            # Build input schema
            input_schema = self._build_input_schema(tool_api)
            
            return types.Tool(
                name=tool_api.name,
                title=tool_api.name.replace('_', ' ').title(),
                description=tool_api.description,
                inputSchema=input_schema
            )
        except Exception as e:
            print(f"Tool conversion failed {tool_api.name}: {e}")
            return None

    def _build_input_schema(self, tool_api: McpToolApi) -> dict:
        """
        Build input schema based on API configuration
        
        Args:
            tool_api: API configuration
            
        Returns:
            dict: Input definition in JSON Schema format
        """
        schema = {
            "type": "object",
            "properties": {},
            "required": []
        }
        
        # Parse path parameters
        if tool_api.path_parameters:
            try:
                path_params = json.loads(tool_api.path_parameters)
                for param in path_params:
                    if isinstance(param, dict) and "name" in param:
                        schema["properties"][param["name"]] = {
                            "type": param.get("type", "string"),
                            "description": param.get("description", f"Path parameter: {param['name']}")
                        }
                        if param.get("required", False):
                            schema["required"].append(param["name"])
            except (json.JSONDecodeError, TypeError):
                pass
        
        # Parse query parameters
        if tool_api.query_parameters:
            try:
                query_params = json.loads(tool_api.query_parameters)
                for param in query_params:
                    if isinstance(param, dict) and "name" in param:
                        schema["properties"][param["name"]] = {
                            "type": param.get("type", "string"),
                            "description": param.get("description", f"Query parameter: {param['name']}")
                        }
                        if param.get("required", False):
                            schema["required"].append(param["name"])
            except (json.JSONDecodeError, TypeError):
                pass
        
        # Parse request body parameters
        if tool_api.request_body_schema:
            try:
                body_schema = json.loads(tool_api.request_body_schema)
                if isinstance(body_schema, dict) and "properties" in body_schema:
                    schema["properties"].update(body_schema["properties"])
                    if "required" in body_schema:
                        schema["required"].extend(body_schema["required"])
            except (json.JSONDecodeError, TypeError):
                pass
        return schema

    def get_tool_by_name(self, service_id: str, tool_name: str) -> Optional[McpToolApi]:
        """
        Get tool configuration by service ID and tool name
        
        Args:
            service_id: Service ID
            tool_name: Tool name
            
        Returns:
            Optional[McpToolApi]: Tool configuration, returns None if not found
        """
        tool_apis = self.tool_api_repository.get_by_service_id(service_id)
        for tool_api in tool_apis:
            if tool_api.name == tool_name:
                return tool_api
        return None

    def get_service_by_id(self, service_id: str) -> Optional[McpServiceModel]:
        """
        Get service information by service ID
        
        Args:
            service_id: Service ID
            
        Returns:
            Optional[McpServiceModel]: Service information, returns None if not found
        """
        return self.service_repository.get_by_id(service_id)

    def get_service_auth_info(self, service_id: str) -> dict:
        """
        Get service authentication information
        
        Args:
            service_id: Service ID
            
        Returns:
            dict: Dictionary containing base_url and authentication information
        """
        service = self.service_repository.get_by_id(service_id)
        if not service:
            return {}
        
        auth_info = {
            "base_url": service.base_url or "",
            "auth_method": service.auth_method.value if service.auth_method else "free",
            "auth_header": service.auth_header or "",
            "auth_token": service.auth_token or ""
        }
        
        return auth_info
