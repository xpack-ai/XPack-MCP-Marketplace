"""
MCP Controller - Handle MCP Streamable HTTP protocol SSE connections and messages
Supports both service_id (UUID) and slug_name service identifiers
"""

from typing import Optional
from datetime import datetime, timezone
from starlette.requests import Request
from starlette.responses import Response
import asyncio
import time
from mcp.server.sse import SseServerTransport
from mcp.server.streamable_http import StreamableHTTPServerTransport
from mcp.server.lowlevel import Server
from services.api_service.services.mcp_server_factory import McpServerFactory
from services.common.logging_config import get_logger
from services.api_service.repositories.user_apikey_repository import UserApiKeyRepository
from services.api_service.utils.connection_manager import connection_manager
from services.common.database import get_db
from services.common.config import Config

logger = get_logger(__name__)


class McpController:
    """MCP Streamable HTTP controller class - Handle SSE connections and message routing"""

    def __init__(self):
        self.sse = SseServerTransport("/messages/")
        # StreamableHTTP session persistence: store transport and server task keyed by (service_id, user_id)
        self._http_transports: dict[str, StreamableHTTPServerTransport] = {}
        self._http_server_tasks: dict[str, asyncio.Task] = {}
        self._http_servers: dict[str, Server] = {}
        self.server_factory = McpServerFactory()
        # Session recycling: track idle time and run a background cleanup task
        self._session_last_activity: dict[str, float] = {}
        self._session_gc_task: Optional[asyncio.Task] = None
        self._session_gc_stop_event = asyncio.Event()
        self._session_idle_ttl = getattr(Config, "MCP_SESSION_IDLE_TTL_SECONDS", 900)
        self._session_cleanup_interval = getattr(Config, "MCP_SESSION_CLEANUP_INTERVAL_SECONDS", 60)

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

    async def handle_sse_connection_asgi(self, request: Request):
        """Return an ASGI app that handles MCP SSE connections.

        Starlette Route passes a Request and treats the returned callable as an ASGI app.
        The returned ASGI callable performs the SSE handshake and runs the MCP server.
        """

        async def asgi(scope, receive, send):
            req = Request(scope)
            client_ip = req.client.host if req.client else "unknown"
            user_agent = req.headers.get("user-agent", "unknown")
            service_id = None

            try:
                # Extract service_id from URL path (supports both ID and slug_name)
                service_id = self._extract_service_id(req)
                if not service_id:
                    response_body = b"Missing service_id parameter or service not found"
                    await send({
                        'type': 'http.response.start',
                        'status': 400,
                        'headers': [
                            [b'content-type', b'text/plain'],
                            [b'content-length', str(len(response_body)).encode()],
                        ],
                    })
                    await send({'type': 'http.response.body', 'body': response_body})
                    return

                logger.info(f"Received SSE connection request - Service ID: {service_id}, Client: {client_ip}, UA: {user_agent[:50]}...")

                # Extract user ID (for billing) - must provide valid apikey
                user_info = self._extract_user_info(req)
                if not user_info:
                    response_body = b"Missing or invalid apikey parameter"
                    await send({
                        'type': 'http.response.start',
                        'status': 401,
                        'headers': [
                            [b'content-type', b'text/plain'],
                            [b'content-length', str(len(response_body)).encode()],
                        ],
                    })
                    await send({'type': 'http.response.body', 'body': response_body})
                    return

                user_id, apikey_id = user_info

                # Create MCP server instance (pass user_id and apikey_id for billing and logging)
                mcp_server = await self.server_factory.create_server(service_id, user_id, apikey_id)

                # Register connection to manager
                connection_key = connection_manager.register_connection(service_id, user_id, client_ip)

                try:
                    # Establish SSE connection and run MCP server
                    async with self.sse.connect_sse(scope, receive, send) as streams:
                        logger.info(f"SSE connection established - Service ID: {service_id}, User ID: {user_id}, Client: {client_ip}")

                        # Configure server initialization options
                        init_options = mcp_server.create_initialization_options()
                        init_options.server_name = f"mcp-service-{service_id}"

                        logger.info(f"Server name set to: {init_options.server_name}")
                        logger.info("MCP server startup complete, waiting for client messages... (ASGI endpoint)")

                        try:
                            # Run MCP server
                            await mcp_server.run(streams[0], streams[1], init_options)
                            logger.info(f"MCP server run completed - Service ID: {service_id}, User ID: {user_id}")
                        except asyncio.CancelledError:
                            # Client disconnected; treat as normal shutdown
                            logger.info(f"SSE client disconnected - Service ID: {service_id}, User ID: {user_id}")
                        except Exception as e:
                            logger.error(f"Error occurred during MCP server operation: {str(e)}", exc_info=True)
                finally:
                    # Unregister connection
                    connection_manager.unregister_connection(connection_key)

            except ConnectionError as e:
                logger.warning(f"Connection error - Service ID: {service_id or 'unknown'}, Client: {client_ip}: {str(e)}")
                response_body = b"Connection error"
                await send({
                    'type': 'http.response.start',
                    'status': 503,
                    'headers': [
                        [b'content-type', b'text/plain'],
                        [b'content-length', str(len(response_body)).encode()],
                    ],
                })
                await send({'type': 'http.response.body', 'body': response_body})
            except Exception as e:
                logger.error(f"SSE connection handling failed - Service ID: {service_id or 'unknown'}, Client: {client_ip}: {str(e)}", exc_info=True)
                response_body = f"Internal server error: {str(e)}".encode('utf-8')
                await send({
                    'type': 'http.response.start',
                    'status': 500,
                    'headers': [
                        [b'content-type', b'text/plain'],
                        [b'content-length', str(len(response_body)).encode()],
                    ],
                })
                await send({'type': 'http.response.body', 'body': response_body})

        return asgi

    async def handle_streamable_http_asgi(self, request: Request):
        """Return an ASGI app that handles MCP Streamable HTTP (GET/POST/DELETE).

        Delegate requests to StreamableHTTP's handle_request; use persistent transport and server
        so GET/POST/DELETE interact within the same session, ensuring tools/resources queries
        return to the same SSE stream.
        """

        async def asgi(scope, receive, send):
            req = Request(scope)
            client_ip = req.client.host if req.client else "unknown"
            user_agent = req.headers.get("user-agent", "unknown")
            service_id = None
            session_key = None

            try:
                # Extract service_id from URL path (supports both ID and slug_name)
                service_id = self._extract_service_id(req)
                if not service_id:
                    response_body = b"Missing service_id parameter or service not found"
                    await send({
                        'type': 'http.response.start',
                        'status': 400,
                        'headers': [
                            [b'content-type', b'text/plain'],
                            [b'content-length', str(len(response_body)).encode()],
                        ],
                    })
                    await send({'type': 'http.response.body', 'body': response_body})
                    return

                logger.info(f"Received StreamableHTTP request - Service ID: {service_id}, Client: {client_ip}, UA: {user_agent[:50]}...")

                # Extract user ID (for billing) - must provide valid apikey
                user_info = self._extract_user_info(req)
                if not user_info:
                    response_body = b"Missing or invalid apikey parameter"
                    await send({
                        'type': 'http.response.start',
                        'status': 401,
                        'headers': [
                            [b'content-type', b'text/plain'],
                            [b'content-length', str(len(response_body)).encode()],
                        ],
                    })
                    await send({'type': 'http.response.body', 'body': response_body})
                    return

                user_id, apikey_id = user_info
                session_key = f"{service_id}:{user_id}"

                # Build connection key for lifecycle management
                connection_key = f"{service_id}:{user_id}:{client_ip}"

                try:
                    # Get or create a persistent StreamableHTTP transport and MCP server
                    transport = await self._ensure_http_session(session_key, service_id, user_id, apikey_id)

                    # Note session activity
                    self._note_session_activity(session_key)

                    # Register only on GET (SSE handshake); POST just updates activity
                    if req.method == "GET":
                        connection_manager.register_connection(service_id, user_id, client_ip)
                    elif req.method == "POST":
                        connection_manager.update_activity(connection_key)

                    # Delegate request to transport; GET establishes SSE; POST sends JSON-RPC; DELETE terminates the session
                    await transport.handle_request(scope, receive, send)

                    # Update activity after handling (avoid cleaning long-running processing)
                    self._note_session_activity(session_key)

                    # If the session has terminated or DELETE called, clean up and unregister
                    if transport.is_terminated or req.method == "DELETE":
                        await self._cleanup_http_session(session_key)
                        connection_manager.unregister_connection(connection_key)
                finally:
                    # Unregister when SSE GET disconnects
                    if req.method == "GET":
                        connection_manager.unregister_connection(connection_key)

            except ConnectionError as e:
                logger.warning(f"Connection error - Service ID: {service_id or 'unknown'}, Client: {client_ip}: {str(e)}")
                response_body = b"Connection error"
                await send({
                    'type': 'http.response.start',
                    'status': 503,
                    'headers': [
                        [b'content-type', b'text/plain'],
                        [b'content-length', str(len(response_body)).encode()],
                    ],
                })
                await send({'type': 'http.response.body', 'body': response_body})
            except Exception as e:
                logger.error(f"StreamableHTTP handling failed - Service ID: {service_id or 'unknown'}, Client: {client_ip}: {str(e)}", exc_info=True)
                response_body = f"Internal server error: {str(e)}".encode('utf-8')
                await send({
                    'type': 'http.response.start',
                    'status': 500,
                    'headers': [
                        [b'content-type', b'text/plain'],
                        [b'content-length', str(len(response_body)).encode()],
                    ],
                })
                await send({'type': 'http.response.body', 'body': response_body})

        return asgi

    async def _ensure_http_session(self, session_key: str, service_id: str, user_id: str, apikey_id: str) -> StreamableHTTPServerTransport:
        """Ensure a persistent StreamableHTTP transport and MCP server exist for the session.

        - Create or reuse the transport
        - If the server has not been started, start mcp_server.run() within transport.connect()
        """
        if session_key in self._http_transports:
            transport = self._http_transports[session_key]
            # Start GC task if not started
            self._ensure_session_gc_task()
            # Note activity
            self._note_session_activity(session_key)
            # If the server task exists and is not finished, reuse it
            task = self._http_server_tasks.get(session_key)
            if task and not task.done():
                return transport
            # If no task or the task is finished, restart
            mcp_server = self._http_servers.get(session_key)
            if mcp_server is None:
                mcp_server = await self.server_factory.create_server(service_id, user_id, apikey_id)
                self._http_servers[session_key] = mcp_server
            init_options = mcp_server.create_initialization_options()
            init_options.server_name = f"mcp-service-{service_id}"

            async def run_server():
                async with transport.connect() as (read_stream, write_stream):
                    try:
                        await mcp_server.run(read_stream, write_stream, init_options)
                    except asyncio.CancelledError:
                        logger.info(f"MCP server task cancelled - Service: {service_id}, User: {user_id}")
                    except Exception as e:
                        logger.error(f"MCP server task error: {e}", exc_info=True)

            task = asyncio.create_task(run_server())
            self._http_server_tasks[session_key] = task
            return transport

        # Create transport and server
        transport = StreamableHTTPServerTransport(mcp_session_id=None, is_json_response_enabled=False)
        mcp_server = await self.server_factory.create_server(service_id, user_id, apikey_id)
        self._http_transports[session_key] = transport
        self._http_servers[session_key] = mcp_server

        init_options = mcp_server.create_initialization_options()
        init_options.server_name = f"mcp-service-{service_id}"
        logger.info(f"StreamableHTTP session created - Service: {service_id}, User: {user_id}")

        # Start GC task if not started and note activity
        self._ensure_session_gc_task()
        self._note_session_activity(session_key)

        async def run_server():
            async with transport.connect() as (read_stream, write_stream):
                try:
                    await mcp_server.run(read_stream, write_stream, init_options)
                except asyncio.CancelledError:
                    logger.info(f"MCP server task cancelled - Service: {service_id}, User: {user_id}")
                except Exception as e:
                    logger.error(f"MCP server task error: {e}", exc_info=True)

        task = asyncio.create_task(run_server())
        self._http_server_tasks[session_key] = task
        return transport

    async def _cleanup_http_session(self, session_key: str) -> None:
        """Cleanup transport and server task for a terminated session."""
        task = self._http_server_tasks.pop(session_key, None)
        transport = self._http_transports.pop(session_key, None)
        self._http_servers.pop(session_key, None)

        if task and not task.done():
            try:
                # Terminate transport to prompt server exit
                if transport and not transport.is_terminated:
                    await transport.terminate()
                await task
            except Exception:
                logger.exception("Error while waiting for server task to finish")

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

    def get_streamable_http_handler(self):
        # We no longer return a handler for a persistent instance; if needed, call
        # handle_streamable_http_asgi at the routing layer. This placeholder is
        # retained to avoid external references breaking, but it is not used.
        raise NotImplementedError("Use handle_streamable_http_asgi for StreamableHTTP routes")


    def _ensure_session_gc_task(self) -> None:
        """Start background GC task if not already running."""
        if self._session_gc_task is None or self._session_gc_task.done():
            loop = asyncio.get_running_loop()
            self._session_gc_task = loop.create_task(self._run_session_gc())
            logger.info("Session GC task started")

    def _note_session_activity(self, session_key: str) -> None:
        """Update last activity timestamp for a session."""
        self._session_last_activity[session_key] = time.time()

    async def _run_session_gc(self) -> None:
        """Background task to recycle idle or terminated sessions."""
        try:
            while not self._session_gc_stop_event.is_set():
                await asyncio.sleep(self._session_cleanup_interval)
                now = time.time()
                stale_keys: list[str] = []
                for key, transport in list(self._http_transports.items()):
                    last = self._session_last_activity.get(key, 0)
                    idle = (now - last) > self._session_idle_ttl
                    task = self._http_server_tasks.get(key)
                    active_task = task is not None and not task.done()
                    # Only TTL-clean when there is no active task, to avoid killing active SSE sessions
                    if transport.is_terminated or (idle and not active_task):
                        stale_keys.append(key)
                for key in stale_keys:
                    logger.info(f"Recycling session {key} (terminated or idle > {self._session_idle_ttl}s)")
                    try:
                        await self._cleanup_http_session(key)
                    except Exception:
                        logger.exception("Error during session cleanup")
                    self._session_last_activity.pop(key, None)
        except asyncio.CancelledError:
            pass
        finally:
            logger.info("Session GC task stopped")
