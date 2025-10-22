"""
MCP Server Factory - Create and configure MCP server instances
"""

import uuid
import json
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from mcp.server.lowlevel import Server
import mcp.types as types
from services.common.database import get_db
from services.api_service.repositories.mcp_tool_api_repository import McpToolApiRepository
from services.api_service.repositories.mcp_service_repository import McpServiceRepository
from services.api_service.services.mcp_service import McpService
from services.api_service.services.mcp_tool_service import McpToolService
from services.api_service.services.billing_service import billing_service
from services.common.models.billing import ApiCallLogInfo
from services.common.logging_config import get_logger

logger = get_logger(__name__)


class McpServerFactory:
    """MCP server factory class"""

    def __init__(self):
        self.tool_service = McpToolService()
        self.billing_service = billing_service

    async def create_server(self, service_id: str, user_id: Optional[str] = None, apikey_id: Optional[str] = None) -> Server:
        """
        Create MCP server for specified service_id

        Args:
            service_id: Service ID
            user_id: User ID (for billing, optional)
            apikey_id: API key ID for billing records (optional)

        Returns:
            Server: Configured MCP server instance
        """
        logger.info(f"Creating MCP server instance - Service ID: {service_id}, User ID: {user_id}, API Key ID: {apikey_id}...")

        app = Server(f"mcp-service-{service_id}")

        # Register tools list handler
        @app.list_tools()
        async def list_tools() -> List[types.Tool]:
            """Return available tools list for this service"""
            return await self._handle_list_tools(service_id)

        # Register resources list handler (optional, return empty when not configured)
        @app.list_resources()
        async def list_resources() -> List[types.Resource]:
            return []

        # Register tool call handler
        @app.call_tool()
        async def call_tool(name: str, arguments: dict) -> List[types.Content]:
            """Execute specified tool"""
            # user_id must exist, otherwise we shouldn't reach here
            if not user_id:
                error_msg = "Missing user authentication"
                logger.error(error_msg)
                return [types.TextContent(type="text", text=error_msg)]
            
            return await self._handle_call_tool_with_billing(service_id, name, arguments, user_id, apikey_id)

        logger.info("MCP server instance created successfully")
        return app

    async def _handle_list_tools(self, service_id: str) -> List[types.Tool]:
        """
        Handle tools list query

        Args:
            service_id: Service ID

        Returns:
            List[types.Tool]: Tools list
        """
        logger.info(f"Received tools list query request - Service ID: {service_id}")

        db = next(get_db())
        try:
            # Create service instance
            mcp_service = self._create_mcp_service(db)

            # Get tools list
            tools = mcp_service.get_tools_by_service_id(service_id)
            logger.info(f"Found {len(tools)} tools")

            for tool in tools:
                logger.debug(f"Tool: {tool.name} - {tool.description}")

            return tools

        except Exception as e:
            logger.error(f"Failed to get tools list: {str(e)}", exc_info=True)
            raise
        finally:
            db.close()

    async def _handle_call_tool_with_billing(self, service_id: str, name: str, arguments: dict, user_id: str, apikey_id: Optional[str] = None) -> List[types.Content]:
        """
        Handle tool call with billing logic

        Args:
            service_id: Service ID
            name: Tool name
            arguments: Tool arguments
            user_id: User ID
            apikey_id: API key ID for billing records

        Returns:
            List[types.Content]: Execution result
        """
        call_start_time = datetime.now(timezone.utc)

        logger.info(f"Received tool call request with billing - User ID: {user_id}, Service ID: {service_id}, Tool name: {name}")
        logger.debug(f"Tool arguments: {arguments}")

        # 1. Pre-deduction check
        pre_deduct_result = await self.billing_service.check_and_pre_deduct(user_id, service_id, name)
        if not pre_deduct_result.success:
            logger.warning(f"Pre-deduction failed: {pre_deduct_result.message}")
            error_msg = f"Billing check failed: {pre_deduct_result.message}"

            # Send failed billing message
            # Lookup tool API id for logging
            api_id_for_log = None
            db_lookup = next(get_db())
            try:
                mcp_service = self._create_mcp_service(db_lookup)
                tool_cfg = mcp_service.get_tool_by_name(service_id, name)
                if tool_cfg:
                    api_id_for_log = tool_cfg.id
                else:
                    logger.error(f"Unknown tool for billing log: {name}")
            except Exception as lookup_err:
                logger.error(f"Failed to lookup tool API id for billing log: {lookup_err}")
            finally:
                db_lookup.close()

            # If tool API id not found, skip sending billing message to avoid FK errors
            if not api_id_for_log:
                return [types.TextContent(type="text", text=error_msg)]

            call_log = ApiCallLogInfo(
                user_id=user_id,
                service_id=service_id,
                api_id=api_id_for_log,
                tool_name=name,
                input_params=json.dumps(arguments),
                unit_price=pre_deduct_result.service_price,
                call_start_time=call_start_time,
                call_end_time=datetime.now(timezone.utc),
                input_token=Decimal("0"),
                output_token=Decimal("0"),
                charge_type=pre_deduct_result.charge_type,
                apikey_id=apikey_id,
            )
            await self.billing_service.send_billing_message(call_log, False, datetime.now(timezone.utc))

            return [types.TextContent(type="text", text=error_msg)]

        logger.info(f"Pre-deduction successful - User ID: {user_id}, Deduction amount: {pre_deduct_result.service_price}")
        amount = pre_deduct_result.service_price
        # 2. Execute tool call
        db = next(get_db())
        call_success = False
        result: List[types.ContentBlock] = []
        # calculate input token amount
        input_token_amount = Decimal("0")
        output_token_amount = Decimal("0")
        input_token  = Decimal("0")
        output_token  = Decimal("0")
        
        # Calculate input token amount based on charge type
        if pre_deduct_result.charge_type == "per_token":
            # Estimate input tokens from arguments
            input_text = json.dumps(arguments)
            estimated_input_tokens = len(input_text.split()) * 1.3  # Rough estimation: 1.3 tokens per word
            input_token = estimated_input_tokens
            # Calculate input token amount (prices are per million tokens)
            input_token_amount = (Decimal(str(estimated_input_tokens)) / Decimal("1000000")) * pre_deduct_result.input_token_price
            amount = input_token_amount

        # Create service instance and find tool configuration before try/except
        mcp_service = self._create_mcp_service(db)
        tool_config = mcp_service.get_tool_by_name(service_id, name)
        if not tool_config:
            error_msg = f"Unknown tool: {name}"
            logger.error(error_msg)
            # Close DB and return error without sending billing message to avoid FK violation
            db.close()
            return [types.TextContent(type="text", text=error_msg)]

        try:
            logger.info(f"Found tool configuration: {tool_config.name}")

            # Get service authentication info
            call_params = mcp_service.get_service_call_params(service_id)
            logger.debug(f"Call params: {call_params}")

            # Execute tool
            result = await self.tool_service.execute_tool(tool_config, arguments, call_params)
            call_success = True
            logger.info(f"Tool call successful - User ID: {user_id}, Tool: {name}")
            
            # Calculate output token amount after tool execution
            if pre_deduct_result.charge_type == "per_token" and result:
                output_text = ""
                for content in result:
                    if isinstance(content, types.TextContent):
                        output_text += content.text
                estimated_output_tokens = len(output_text.split()) * 1.3  # Rough estimation: 1.3 tokens per word
                output_token = estimated_output_tokens
                # Calculate output token amount (prices are per million tokens)
                output_token_amount = (Decimal(str(estimated_output_tokens)) / Decimal("1000000")) * pre_deduct_result.output_token_price
                amount += output_token_amount

        except Exception as e:
            logger.error(f"Tool call failed - User ID: {user_id}, Tool: {name}: {str(e)}", exc_info=True)
            call_success = False
            # Return error message instead of throwing exception to maintain MCP protocol stability
            error_msg = f"Tool execution failed: {str(e)}"
            result = [types.TextContent(type="text", text=error_msg)]

        finally:
            db.close()

        # 3. Send billing message
        call_end_time = datetime.now(timezone.utc)
        # Send billing message only when tool_config was found (api_id exists)
        if tool_config:
            call_log = ApiCallLogInfo(
                user_id=user_id,
                service_id=service_id,
                api_id=tool_config.id,
                tool_name=name,
                input_params=json.dumps(arguments),
                unit_price=amount.quantize(Decimal('0.000001')),
                input_token=Decimal(str(input_token)).quantize(Decimal('0')),
                output_token=Decimal(str(output_token)).quantize(Decimal('0')),
                charge_type=pre_deduct_result.charge_type,
                call_start_time=call_start_time,
                call_end_time=call_end_time,
                apikey_id=apikey_id,
            )

            await self.billing_service.send_billing_message(call_log, call_success, call_end_time)
        logger.info(f"Billing message sent - User ID: {user_id}, Tool: {name}, Success: {call_success}")

        # Ensure return type is correct
        return result

    def _create_mcp_service(self, db) -> McpService:
        """
        Create MCP service instance

        Args:
            db: Database connection

        Returns:
            McpService: MCP service instance
        """
        tool_api_repository = McpToolApiRepository(db)
        service_repository = McpServiceRepository(db)
        return McpService(tool_api_repository, service_repository)
