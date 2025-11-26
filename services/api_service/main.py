"""
API Service - FastAPI main entry point for MCP Streamable HTTP service
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.responses import JSONResponse
from starlette.routing import Route, Mount
from starlette.applications import Starlette
from contextlib import asynccontextmanager
import logging
import time

from services.common.config import Config
from services.common.logging_config import setup_logging, get_logger
from services.api_service.controllers.mcp import McpController
from services.api_service.utils.connection_manager import connection_manager
from services.common.middleware.exception_middleware import ExceptionHandlingMiddleware
from services.common.utils.response_utils import ResponseUtils
from services.common import error_msg

# Setup logging for api service
setup_logging("api_service")
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    logger.info(f"MCP Streamable HTTP Service starting... Port: {Config.API_PORT}")
    
    yield
    
    logger.info("MCP Streamable HTTP Service shutting down...")


# Create FastAPI application
app = FastAPI(
    title="XPack MCP Service", 
    description="XPack MCP Streamable HTTP service",
    version="1.0.0",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Add custom exception handlers for unified response format
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions with unified response format"""
    logger.warning(
        f"HTTP exception occurred: {exc.detail} - Path: {request.url.path} - Code: {exc.status_code}"
    )
    
    # Use predefined error messages based on status code
    if exc.status_code == 404:
        message = error_msg.ENDPOINT_NOT_FOUND["message"]
    elif exc.status_code == 400:
        message = error_msg.INVALID_REQUEST["message"]
    elif exc.status_code == 401:
        message = error_msg.UNAUTHORIZED["message"]
    elif exc.status_code == 403:
        message = error_msg.FORBIDDEN["message"]
    elif exc.status_code == 409:
        message = error_msg.CONFLICT["message"]
    elif exc.status_code == 422:
        message = error_msg.VALIDATION_FAILED["message"]
    elif exc.status_code == 500:
        message = error_msg.INTERNAL_ERROR["message"]
    elif exc.status_code == 503:
        message = error_msg.SERVICE_UNAVAILABLE["message"]
    else:
        message = exc.detail
    
    error_response = ResponseUtils.error(message=message, code=exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response,
        headers={"Content-Type": "application/json; charset=utf-8"}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Handle request validation errors with unified response format"""
    logger.warning(f"Validation error occurred: {str(exc)} - Path: {request.url.path}")
    error_response = ResponseUtils.error(
        message=error_msg.VALIDATION_FAILED["message"], 
        code=422
    )
    return JSONResponse(
        status_code=422,
        content=error_response,
        headers={"Content-Type": "application/json; charset=utf-8"}
    )

# Add global exception handling middleware (must be first for proper error handling)
app.add_middleware(ExceptionHandlingMiddleware)

# Add CORS middleware for MCP client cross-origin and reconnection support
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create MCP controller instance
mcp = McpController()

# Health check endpoints
@app.get("/")
def read_root():
    return {
        "message": f"XPack MCP Streamable HTTP Service running on port {Config.API_PORT}",
        "version": "1.0.0",
        "protocol": "MCP Streamable HTTP",
        "endpoints": ["/mcp/{service_id}", "/mcp/messages/", "/mcp/status/{service_id}"],
        "service_id_support": "Supports both service ID and slug_name",
        "reconnect_info": "Service supports automatic reconnection after restart"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "mcp-streamable-http"}

@app.get("/mcp/status/{service_id}")
def mcp_service_status(service_id: str):
    """
    Check MCP service status for specified service
    Supports both service_id (UUID) and slug_name
    """
    # Parse service_id, supports both ID and slug_name
    actual_service_id = None
    service_name = "unknown"
    
    try:
        from services.api_service.repositories.mcp_service_repository import McpServiceRepository
        from services.common.database import get_db
        
        db = next(get_db())
        service_repository = McpServiceRepository(db)
        
        # Try to find by ID first
        service = service_repository.get_by_id(service_id)
        if service:
            actual_service_id = service.id
            service_name = service.name
        else:
            # If not found by ID, try by slug_name
            service = service_repository.get_by_slug_name(service_id)
            if service:
                actual_service_id = service.id
                service_name = service.name
                
        db.close()
        
    except Exception as e:
        logger.error(f"Error occurred while querying service status: {str(e)}")
    
    if not actual_service_id:
        return {
            "service_id": service_id,
            "status": "not_found",
            "error": "Service not found or not available"
        }
    
    # Get connection statistics for this service
    service_connections = connection_manager.get_service_connections(actual_service_id)
    
    return {
        "service_id": actual_service_id,
        "service_identifier": service_id,
        "service_name": service_name,
        "status": "available",
        "protocol": "streamable-http",
        "endpoint": f"/mcp/{service_id}",
        "message": "Service is ready for connections",
        "active_connections": len(service_connections),
        "reconnect_supported": True
    }

@app.get("/mcp/connections/stats")
def mcp_connections_stats():
    """Get MCP connection statistics for monitoring and debugging"""
    # Cleanup stale connections
    connection_manager.cleanup_stale_connections()
    
    return {
        "timestamp": time.time(),
        "stats": connection_manager.get_stats()
    }

# Create MCP Streamable HTTP routes
# Use Starlette sub-app to handle MCP protocol's underlying SSE connections
mcp_routes = [
    Route("/{service_id}", endpoint=mcp.handle_sse_connection_asgi, methods=["GET"]),  # 保留原有 SSE GET
    Mount("/messages/", app=mcp.get_sse_mount_handler()),  # 保留原有 SSE POST 挂载
    Route("/{service_id}/streamable-http", endpoint=mcp.handle_streamable_http_asgi, methods=["GET", "POST", "DELETE"]),  # 新增 StreamableHTTP 路由
]

mcp_app = Starlette(routes=mcp_routes)

# Mount MCP sub-app to FastAPI application
app.mount("/mcp", mcp_app)

# Logging is already configured by setup_logging("api_service")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "services.api_service.main:app",
        host="0.0.0.0",
        port=Config.API_PORT,
        reload=Config.DEBUG
    )