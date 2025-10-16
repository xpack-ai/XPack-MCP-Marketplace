import json
import ast
import mcp.types as types
from typing import List, Optional
from services.common.models.mcp_tool_api import McpToolApi
from services.common.models.mcp_service import McpService as McpServiceModel
from services.api_service.repositories.mcp_tool_api_repository import McpToolApiRepository
from services.api_service.repositories.mcp_service_repository import McpServiceRepository
from services.common.logging_config import get_logger


class McpService:
    """MCP service business logic layer"""

    def __init__(self, tool_api_repository: McpToolApiRepository, service_repository: McpServiceRepository):
        self.tool_api_repository = tool_api_repository
        self.service_repository = service_repository
        self.logger = get_logger(__name__)

    def _safe_parse_params(self, params_str: str, tool_name: str, param_type: str) -> list:
        """
        Safely parse parameter string that might be in JSON or Python dict format
        
        Args:
            params_str: Parameter string to parse
            tool_name: Tool name for logging
            param_type: Type of parameters (e.g., 'query', 'path', 'body')
            
        Returns:
            list: Parsed parameters or empty list if parsing fails
        """
        if not params_str or params_str.strip() == '':
            return []
        
        # Remove any surrounding whitespace
        params_str = params_str.strip()
        
        # Try different parsing strategies
        
        # Strategy 1: Standard JSON format (with double quotes)
        try:
            result = json.loads(params_str)
            if isinstance(result, list):
                return result
            elif isinstance(result, dict):
                # If it's a single dict, wrap it in a list
                return [result]
            else:
                self.logger.warning(f"Expected list or dict but got {type(result)} for {param_type} parameters in {tool_name}")
                return []
        except json.JSONDecodeError:
            pass  # Try next strategy
        
        # Strategy 2: Python literal format (with single quotes)
        try:
            result = ast.literal_eval(params_str)
            if isinstance(result, list):
                return result
            elif isinstance(result, dict):
                # If it's a single dict, wrap it in a list
                return [result]
            else:
                self.logger.warning(f"Expected list or dict but got {type(result)} for {param_type} parameters in {tool_name}")
                return []
        except (ValueError, SyntaxError):
            pass  # Try next strategy
        
        # Strategy 3: Try to convert Python format to JSON format
        try:
            # Replace single quotes with double quotes for JSON compatibility
            # This is a simple approach that works for most cases
            json_str = params_str.replace("'", '"').replace('True', 'true').replace('False', 'false').replace('None', 'null')
            result = json.loads(json_str)
            if isinstance(result, list):
                return result
            elif isinstance(result, dict):
                return [result]
            else:
                self.logger.warning(f"Expected list or dict but got {type(result)} for {param_type} parameters in {tool_name}")
                return []
        except json.JSONDecodeError:
            pass  # All strategies failed
        
        # If all strategies fail, log the error
        self.logger.warning(f"Failed to parse {param_type} parameters for {tool_name}. Data: {params_str[:100]}...")
        return []

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
            
            # If no schema was built (no parameters), create a minimal schema
            if input_schema is None:
                input_schema = {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            
            return types.Tool(
                name=tool_api.name,
                description=tool_api.description,
                inputSchema=input_schema
            )
        except Exception as e:
            self.logger.error(f"Tool conversion failed for {tool_api.name}: {e}")
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
            path_params = self._safe_parse_params(tool_api.path_parameters, tool_api.name, 'path')
            for param in path_params:
                if isinstance(param, dict) and "name" in param:
                    # Handle both direct type and schema.type formats
                    param_type = "string"  # default
                    if "type" in param:
                        param_type = param["type"]
                    elif "schema" in param and isinstance(param["schema"], dict) and "type" in param["schema"]:
                        param_type = param["schema"]["type"]
                    
                    schema["properties"][param["name"]] = {
                        "type": param_type,
                        "description": param.get("description", f"Path parameter: {param['name']}")
                    }
                    if param.get("required", False):
                        schema["required"].append(param["name"])
        
        # Parse query parameters
        if tool_api.query_parameters:
            query_params = self._safe_parse_params(tool_api.query_parameters, tool_api.name, 'query')
            for param in query_params:
                if isinstance(param, dict) and "name" in param:
                    # Handle both direct type and schema.type formats
                    param_type = "string"  # default
                    if "type" in param:
                        param_type = param["type"]
                    elif "schema" in param and isinstance(param["schema"], dict) and "type" in param["schema"]:
                        param_type = param["schema"]["type"]
                    
                    schema["properties"][param["name"]] = {
                        "type": param_type,
                        "description": param.get("description", f"Query parameter: {param['name']}")
                    }
                    if param.get("required", False):
                        schema["required"].append(param["name"])
        
        # Parse request body parameters
        if tool_api.request_body_schema:
            # Try to parse as parameters list first, then as schema object
            try:
                # First try to parse as parameters list (similar to query/path parameters)
                body_params = self._safe_parse_params(tool_api.request_body_schema, tool_api.name, 'body')
                if body_params:
                    # If it's a list of parameters, process them like query parameters
                    for param in body_params:
                        if isinstance(param, dict) and "name" in param:
                            param_type = "string"  # default
                            if "type" in param:
                                param_type = param["type"]
                            elif "schema" in param and isinstance(param["schema"], dict) and "type" in param["schema"]:
                                param_type = param["schema"]["type"]
                            
                            schema["properties"][param["name"]] = {
                                "type": param_type,
                                "description": param.get("description", f"Body parameter: {param['name']}")
                            }
                            if param.get("required", False):
                                schema["required"].append(param["name"])
                else:
                    # If not a parameters list, try to parse as JSON schema object
                    try:
                        body_schema = json.loads(tool_api.request_body_schema)
                        if isinstance(body_schema, dict) and "properties" in body_schema:
                            schema["properties"].update(body_schema["properties"])
                            if "required" in body_schema:
                                schema["required"].extend(body_schema["required"])
                    except json.JSONDecodeError:
                        pass  # Already logged by _safe_parse_params
            except Exception as e:
                self.logger.warning(f"Failed to parse request body schema for {tool_api.name}: {e}")
        
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
    def get_service_call_params(self, service_id: str) -> dict:
        service = self.service_repository.get_by_id(service_id)
        if not service:
            return {}
        headers = {}
        if service.headers:
            for item in json.loads(service.headers):
                if "name" in item and "value" in item:
                    headers[item["name"]] = item["value"]
        return {
            "base_url": service.base_url or "",
            "headers": headers
        }

