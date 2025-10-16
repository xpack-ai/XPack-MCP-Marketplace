"""
HTTP client utility - Build and handle HTTP requests
"""
import json
import ast
from typing import Dict, Any, Optional
from services.common.logging_config import get_logger

logger = get_logger(__name__)


class HttpRequestBuilder:
    """HTTP request builder"""
    
    def _safe_parse_params(self, params_str: str, param_type: str) -> list:
        """
        Safely parse parameter string that might be in JSON or Python dict format
        
        Args:
            params_str: Parameter string to parse
            param_type: Type of parameters (e.g., 'query', 'path', 'body')
            
        Returns:
            list: Parsed parameters or empty list if parsing fails
        """
        if not params_str or params_str.strip() == '':
            return []
        
        # Remove any surrounding whitespace
        params_str = params_str.strip()
        
        # Strategy 1: Standard JSON format (with double quotes)
        try:
            result = json.loads(params_str)
            if isinstance(result, list):
                return result
            elif isinstance(result, dict):
                return [result]
            else:
                logger.warning(f"Expected list or dict but got {type(result)} for {param_type} parameters")
                return []
        except json.JSONDecodeError:
            pass  # Try next strategy
        
        # Strategy 2: Python literal format (with single quotes)
        try:
            result = ast.literal_eval(params_str)
            if isinstance(result, list):
                return result
            elif isinstance(result, dict):
                return [result]
            else:
                logger.warning(f"Expected list or dict but got {type(result)} for {param_type} parameters")
                return []
        except (ValueError, SyntaxError):
            pass  # Try next strategy
        
        # Strategy 3: Try to convert Python format to JSON format
        try:
            json_str = params_str.replace("'", '"').replace('True', 'true').replace('False', 'false').replace('None', 'null')
            result = json.loads(json_str)
            if isinstance(result, list):
                return result
            elif isinstance(result, dict):
                return [result]
            else:
                logger.warning(f"Expected list or dict but got {type(result)} for {param_type} parameters")
                return []
        except json.JSONDecodeError:
            pass  # All strategies failed
        
        # If all strategies fail, log the error
        logger.warning(f"Failed to parse {param_type} parameters. Data: {params_str[:100]}...")
        return []
    
    def build_request(self, tool_config, arguments: dict, call_params: dict) -> Dict[str, Any]:
        """
        Build HTTP request information
        
        Args:
            tool_config: Tool configuration
            arguments: Tool arguments
            auth_info: Service authentication information
            
        Returns:
            Dict[str, Any]: Request information dictionary
        """
        logger.debug(f"Building HTTP request - Tool: {tool_config.name}")
        logger.debug(f"Original path: {tool_config.path}")
        logger.debug(f"HTTP method: {tool_config.method.value}")
        logger.debug(f"Input arguments: {arguments}")
        logger.debug(f"Call parameters: {call_params}")
        # Build URL
        url = self._build_url(tool_config, arguments, call_params.get("base_url", ""))
        
        # Build headers
        headers = self._build_headers(tool_config, arguments, call_params.get("headers", {}))
        
        # Build query parameters
        query_params = self._build_query_params(tool_config, arguments)
        
        # Build request body
        request_body = self._build_request_body(tool_config, arguments)
        
        request_info = {
            "url": url,
            "method": tool_config.method.value,
            "headers": headers,
            "query_params": query_params,
            "request_body": request_body
        }
        
        logger.debug(f"Built request information: {request_info}")
        return request_info
    
    def _build_url(self, tool_config, arguments: dict, base_url: str) -> str:
        """
        Build request URL
        
        Args:
            tool_config: Tool configuration
            arguments: Tool parameters
            auth_info: Service authentication information
            
        Returns:
            str: Complete request URL
        """
        url = tool_config.path
        
        logger.debug(f"Service Base URL: {base_url}")
        
        # If tool path is not a complete URL, concatenate with base_url
        if not url.startswith(("http://", "https://")) and base_url:
            base_url = base_url.rstrip("/")
            url = url.lstrip("/")
            url = f"{base_url}/{url}"
            logger.debug(f"URL concatenation complete: {url}")
        else:
            logger.debug(f"Using original URL: {url}")
        
        # Replace path parameters
        url = self._replace_path_parameters(url, tool_config, arguments)
        
        return url
    
    def _replace_path_parameters(self, url: str, tool_config, arguments: dict) -> str:
        """
        Replace path parameters in URL
        
        Args:
            url: Original URL
            tool_config: Tool configuration
            arguments: Tool parameters
            
        Returns:
            str: URL after parameter replacement
        """
        if not hasattr(tool_config, 'path_parameters') or not tool_config.path_parameters:
            return url
        
        try:
            path_params = self._safe_parse_params(tool_config.path_parameters, 'path')
            logger.debug(f"Processing path parameters: {path_params}")
            
            for param in path_params:
                if isinstance(param, dict) and "name" in param:
                    param_name = param["name"]
                    if param_name in arguments:
                        url = url.replace(f"{{{param_name}}}", str(arguments[param_name]))
                        logger.debug(f"Path parameter replacement: {param_name} = {arguments[param_name]}")
            
            logger.debug(f"URL after path parameter replacement: {url}")
            
        except Exception as e:
            logger.warning(f"Path parameter parsing failed: {e}")
        
        return url
    
    def _build_headers(self, tool_config, arguments: dict, headers: dict) -> Dict[str, str]:
        """
        Build request headers
        
        Args:
            tool_config: Tool configuration
            arguments: Tool parameters
            auth_info: Service authentication information
            
        Returns:
            Dict[str, str]: Request headers dictionary
        """
        
        # headers = {"User-Agent": "MCP Tool Server (XPack)"}
        headers["User-Agent"] = "MCP Tool Server (XPack)"
        # Add authentication headers
        # self._add_auth_headers(headers, auth_info)
        
        # Add custom headers
        self._add_custom_headers(tool_config, arguments, headers)
        
        logger.debug(f"Final request headers: {headers}")
        return headers
    
    # def _add_auth_headers(self, headers: Dict[str, str], auth_info: dict) -> None:
    #     """
    #     Add authentication headers
        
    #     Args:
    #         headers: Request headers dictionary
    #         auth_info: Authentication information
    #     """
    #     auth_method = auth_info.get("auth_method", "free")
    #     logger.debug(f"Authentication method: {auth_method}")
        
    #     if auth_method != "free":
    #         auth_header = auth_info.get("auth_header")
    #         auth_token = auth_info.get("auth_token")
    #         if auth_header and auth_token:
    #             headers[auth_header] = auth_token
    #             # Hide token details, only show first few characters
    #             token_display = auth_token[:8] + "..." if len(auth_token) > 8 else "***"
    #             logger.debug(f"Added auth header: {auth_header} = {token_display}")
    
    def _add_custom_headers(self, tool_config, arguments: dict, headers: Dict[str, str]) -> None:
        """
        Add custom headers
        
        Args:
            tool_config: Tool configuration
            arguments: Tool parameters
            headers: Request headers dictionary
        """
        if not hasattr(tool_config, 'custom_headers') or not tool_config.custom_headers:
            return
        
        try:
            header_params = self._safe_parse_params(tool_config.custom_headers, 'header')
            logger.debug(f"Processing custom headers: {header_params}")
            
            for param in header_params:
                if isinstance(param, dict) and "name" in param:
                    param_name = param["name"]
                    if param_name in arguments:
                        headers[param_name] = str(arguments[param_name])
                        logger.debug(f"Added custom header: {param_name} = {arguments[param_name]}")
                        
        except Exception as e:
            logger.warning(f"Header parameter parsing failed: {e}")
    
    def _build_query_params(self, tool_config, arguments: dict) -> Dict[str, Any]:
        """
        Build query parameters
        
        Args:
            tool_config: Tool configuration
            arguments: Tool parameters
            
        Returns:
            Dict[str, Any]: Query parameters dictionary
        """
        query_params = {}
        
        if not hasattr(tool_config, 'query_parameters') or not tool_config.query_parameters:
            return query_params
        
        try:
            query_param_defs = self._safe_parse_params(tool_config.query_parameters, 'query')
            logger.debug(f"Processing query parameter definitions: {query_param_defs}")
            
            for param in query_param_defs:
                if isinstance(param, dict) and "name" in param:
                    param_name = param["name"]
                    if param_name in arguments:
                        query_params[param_name] = arguments[param_name]
                        logger.debug(f"Added query parameter: {param_name} = {arguments[param_name]}")
            
            logger.debug(f"Built query parameters: {query_params}")
            
        except Exception as e:
            logger.warning(f"Query parameter parsing failed: {e}")
        
        return query_params
    
    def _build_request_body(self, tool_config, arguments: dict) -> Optional[Dict[str, Any]]:
        """
        Build request body
        
        Args:
            tool_config: Tool configuration
            arguments: Tool parameters
            
        Returns:
            Optional[Dict[str, Any]]: Request body dictionary, returns None if not needed
        """
        if not hasattr(tool_config, 'request_body_schema') or not tool_config.request_body_schema or tool_config.method.value not in ["POST", "PUT", "PATCH"]:
            return None
        
        try:
            # First try to parse as parameters list (similar to query/path parameters)
            body_params = self._safe_parse_params(tool_config.request_body_schema, 'body')
            if body_params:
                # If it's a list of parameters, process them like query parameters
                request_body = {}
                for param in body_params:
                    if isinstance(param, dict) and "name" in param:
                        param_name = param["name"]
                        if param_name in arguments:
                            request_body[param_name] = arguments[param_name]
                
                if request_body:
                    logger.debug(f"Built request body from parameters: {request_body}")
                    return request_body
            else:
                # If not a parameters list, try to parse as JSON schema object
                try:
                    body_schema = json.loads(tool_config.request_body_schema)
                    logger.debug(f"Request body schema: {body_schema}")
                    
                    if isinstance(body_schema, dict) and "properties" in body_schema:
                        request_body = {}
                        for prop_name in body_schema["properties"]:
                            if prop_name in arguments:
                                request_body[prop_name] = arguments[prop_name]
                        
                        if request_body:
                            logger.debug(f"Built request body from schema: {request_body}")
                            return request_body
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse request body schema as JSON")
                    
        except Exception as e:
            logger.warning(f"Request body schema parsing failed: {e}")
        
        return None
