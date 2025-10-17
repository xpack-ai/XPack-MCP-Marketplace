"""
MCP Controller - Handle MCP Streamable HTTP protocol SSE connections and messages
Supports both service_id (UUID) and slug_name service identifiers
"""

from typing import Optional
from datetime import datetime, timezone
from starlette.requests import Request
from starlette.responses import Response
from mcp.server.sse import SseServerTransport
from services.api_service.services.mcp_server_factory import McpServerFactory
from services.common.logging_config import get_logger
from services.api_service.repositories.user_apikey_repository import UserApiKeyRepository
from services.api_service.utils.connection_manager import connection_manager
from services.common.database import get_db

logger = get_logger(__name__)


class McpController:
    """MCP Streamable HTTP controller class - Handle SSE connections and message routing"""

    def __init__(self):
        self.sse = SseServerTransport("/messages/")
        self.server_factory = McpServerFactory()

    async def handle_sse_connection(self, request: Request):
        """Handle MCP Streamable HTTP SSE connection with resume capability."""
        # Get connection identification info
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        service_id = None
        
        try:
            # Extract service_id from URL path (supports both ID and slug_name)
            service_id = self._extract_service_id(request)
            if not service_id:
                logger.error("Missing service_id parameter or service not found")
                # For SSE connection errors, we need to send response directly via ASGI interface
                await self._send_error_response(request, 400, "Missing service_id parameter or service not found")
                return

            logger.info(f"Received SSE connection request - Service ID: {service_id}, Client: {client_ip}, UA: {user_agent[:50]}...")

            # Extract user ID (for billing) - must provide valid apikey
            user_info = self._extract_user_info(request)
            if not user_info:
                logger.error("Missing or invalid apikey, connection rejected")
                await self._send_error_response(request, 401, "Missing or invalid apikey parameter")
                return

            user_id, apikey_id = user_info

            # Get apikey for logging (extract first 10 characters for audit)
            apikey = request.query_params.get("apikey", "")
            if not apikey:
                apikey = request.query_params.get("authkey","")
            apikey_for_log = apikey[:10] if apikey else None

            # Create MCP server instance (pass user_id and apikey_id for billing and logging)
            mcp_server = await self.server_factory.create_server(service_id, user_id, apikey_id)

            # Register connection to manager
            connection_key = connection_manager.register_connection(service_id, user_id, client_ip)

            # Establish SSE connection and run MCP server
            async with self.sse.connect_sse(request.scope, request.receive, request._send) as streams:
                logger.info(f"SSE connection established - Service ID: {service_id}, User ID: {user_id}, Client: {client_ip}")

                # Configure server initialization options
                init_options = mcp_server.create_initialization_options()
                init_options.server_name = f"mcp-service-{service_id}"
                
                # Add connection recovery hint info
                logger.info(f"Server name set to: {init_options.server_name}")
                logger.info(f"MCP server startup complete, waiting for client messages... (Connection ID: {connection_key})")

                try:
                    # Run MCP server
                    await mcp_server.run(streams[0], streams[1], init_options)
                    logger.info(f"MCP server run completed - Service ID: {service_id}, User ID: {user_id}")
                except Exception as e:
                    logger.error(f"Error occurred during MCP server operation: {str(e)}", exc_info=True)
                finally:
                    # Unregister connection
                    connection_manager.unregister_connection(connection_key)

            # SSE connection ended normally via context manager, no additional handling needed

        except ConnectionError as e:
            logger.warning(f"Connection error - Service ID: {service_id or 'unknown'}, Client: {client_ip}: {str(e)}")
            await self._send_error_response(request, 503, "Connection error")
        except Exception as e:
            logger.error(f"SSE connection handling failed - Service ID: {service_id or 'unknown'}, Client: {client_ip}: {str(e)}", exc_info=True)
            await self._send_error_response(request, 500, f"Internal server error: {str(e)}")

    async def _send_error_response(self, request: Request, status_code: int, message: str):
        """Send error response directly through ASGI interface"""
        response_body = message.encode('utf-8')
        await request._send({
            'type': 'http.response.start',
            'status': status_code,
            'headers': [
                [b'content-type', b'text/plain'],
                [b'content-length', str(len(response_body)).encode()],
            ],
        })
        await request._send({
            'type': 'http.response.body',
            'body': response_body,
        })

    def _extract_service_id(self, request: Request) -> Optional[str]:
        """Extract service ID from request path, supporting both ID and slug_name."""
        service_identifier = request.path_params.get("service_id")
        if not service_identifier:
            return None
            
        # Try to find service by service_identifier, supports both ID and slug_name modes
        db = None
        try:
            from services.api_service.repositories.mcp_service_repository import McpServiceRepository
            from services.common.database import get_db
            
            db = next(get_db())
            service_repository = McpServiceRepository(db)
            
            # Try to find by ID first
            service = service_repository.get_by_id(service_identifier)
            if service:
                logger.debug(f"Service found (by ID): {service.name} ({service.id})")
                return service.id
            
            # If not found by ID, try by slug_name
            service = service_repository.get_by_slug_name(service_identifier)
            if service:
                logger.debug(f"Service found (by slug_name): {service.name} ({service.id})")
                return service.id
                
            logger.warning(f"Service not found: {service_identifier}")
            return None
            
        except Exception as e:
            logger.error(f"Error occurred while querying service: {str(e)}", exc_info=True)
            return None
        finally:
            if db is not None:
                db.close()

    def _extract_user_info(self, request: Request) -> Optional[tuple[str, str]]:
        """Extract user ID and apikey ID from request by validating apikey parameter."""
        # Get apikey from URL query parameters
        apikey = request.query_params.get("apikey")
        if not apikey:
            apikey = request.query_params.get("authkey")
            if not apikey:
                logger.warning("Apikey not found in URL parameters")
                return None

        logger.debug(f"Validating apikey: {apikey[:10]}...")  # Only log first 10 characters for debugging

        db = None
        try:
            # Create database session
            db = next(get_db())
            user_apikey_repo = UserApiKeyRepository(db)
            
            # Query user info by apikey
            user_apikey = user_apikey_repo.get_by_apikey(apikey)
            if not user_apikey:
                logger.warning(f"Apikey not found in database: {apikey[:10]}...")
                return None
            
            logger.debug(f"Found apikey record - User ID: {user_apikey.user_id}, API Key ID: {user_apikey.id}, expiry time: {user_apikey.expire_at}")
            
            # Check if apikey is expired
            if user_apikey.expire_at:
                # Ensure timezone consistency
                if user_apikey.expire_at.tzinfo is None:
                    expire_at_utc = user_apikey.expire_at.replace(tzinfo=timezone.utc)
                else:
                    expire_at_utc = user_apikey.expire_at
                    
                if expire_at_utc < datetime.now(timezone.utc):
                    logger.warning(f"Apikey has expired: {apikey[:10]}..., expiry time: {user_apikey.expire_at}")
                    return None
            
            logger.info(f"Apikey validation successful - User ID: {user_apikey.user_id}, API Key ID: {user_apikey.id}")
            return (user_apikey.user_id, user_apikey.id)
            
        except Exception as e:
            logger.error(f"Error occurred while querying user apikey: {str(e)}", exc_info=True)
            return None
        finally:
            if db is not None:
                db.close()

    def get_sse_mount_handler(self):
        """Get SSE message handler for processing requests."""
        return self.sse.handle_post_message
