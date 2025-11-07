"""
MCP tool service - Business logic for executing MCP tool calls
"""
import json
from typing import List, Dict, Any
import mcp.types as types
from mcp.shared._httpx_utils import create_mcp_http_client
from services.api_service.utils.http_client import HttpRequestBuilder
from services.common.logging_config import get_logger

logger = get_logger(__name__)


class McpToolService:
    """MCP tool service class"""
    
    def __init__(self):
        self.http_builder = HttpRequestBuilder()
    
    async def execute_tool(self, tool_config, arguments: dict, call_params: dict) -> tuple[List[types.Content],dict]:
        """
        Execute tool call
        
        Args:
            tool_config: Tool configuration
            arguments: Tool parameters
            auth_info: Service authentication information
            
        Returns:
            List[types.Content]: Execution result
        """
        try:
            logger.info(f"Starting tool execution: {tool_config.name}")
            
            # Build HTTP request
            request_info = self.http_builder.build_request(tool_config, arguments, call_params)
            
            # Send HTTP request
            response_text = await self._send_http_request(request_info)
            if response_text:
                response_data = json.loads(response_text)
            else:
                response_data = {}
            logger.info("Tool execution completed successfully")
            return [types.TextContent(type="text", text=response_text)],response_data
            
        except Exception as e:
            error_msg = f"Tool execution failed: {str(e)}"
            logger.error(f"Tool execution failed: {error_msg}", exc_info=True)
            return [types.TextContent(type="text", text=error_msg)],{}
    
    async def _send_http_request(self, request_info: Dict[str, Any]) -> str:
        """
        Send HTTP request
        
        Args:
            request_info: Request information dictionary
            
        Returns:
            str: Response text
        """
        url = request_info["url"]
        method = request_info["method"]
        headers = request_info["headers"]
        query_params = request_info.get("query_params")
        request_body = request_info.get("request_body")
        
        logger.info(f"Sending HTTP request: {method} {url}")
        logger.debug(f"Query parameters: {query_params}")
        logger.debug(f"Request body: {request_body}")
        
        async with create_mcp_http_client(headers=headers) as client:
            if method == "GET":
                response = await client.get(url, params=query_params)
            elif method == "POST":
                response = await client.post(url, params=query_params, json=request_body)
            elif method == "PUT":
                response = await client.put(url, params=query_params, json=request_body)
            elif method == "DELETE":
                response = await client.delete(url, params=query_params)
            elif method == "PATCH":
                response = await client.patch(url, params=query_params, json=request_body)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            logger.info(f"HTTP response status code: {response.status_code}")
            if response.text != "":
                logger.debug(f"Response content: {response.text}")
            response.raise_for_status()
            
            response_text = response.text
            logger.debug(f"Response content length: {len(response_text)} characters")
            
            return response_text
