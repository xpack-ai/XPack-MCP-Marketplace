from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import asyncio
import threading
import os
from contextlib import asynccontextmanager

from services.common.config import Config
from services.common.logging_config import setup_logging, get_logger
from services.admin_service.controllers import user
from services.admin_service.controllers import auth
from services.admin_service.controllers import user_apikey
from services.admin_service.controllers import payment
from services.admin_service.controllers import order
from services.admin_service.controllers import user_manager
from services.admin_service.controllers import mcp_manager
from services.admin_service.controllers import sys_config
from services.admin_service.controllers import payment_channel
from services.admin_service.controllers import init_config
from services.admin_service.controllers import web
from services.admin_service.controllers import admin_stats
from services.admin_service.controllers import user_stats
from services.admin_service.controllers import email_test
from services.admin_service.controllers import upload

from services.admin_service.consumers.billing_message_consumer import BillingMessageConsumer
from services.admin_service.middleware import AuthMiddleware
from services.common.middleware.exception_middleware import ExceptionHandlingMiddleware
from services.common.utils.response_utils import ResponseUtils
from services.common import error_msg
from fastapi.responses import JSONResponse

# Setup logging for admin service
setup_logging("admin_service")
logger = get_logger(__name__)

# 全局消费者实例
consumer_instance = None
consumer_thread = None


def start_billing_consumer():
    """Start billing consumer in background thread"""
    global consumer_instance
    try:
        logger.info("Starting billing message consumer...")
        consumer_instance = BillingMessageConsumer()
        consumer_instance.start_consuming()
    except Exception as e:
        logger.error(f"Failed to start billing consumer: {str(e)}", exc_info=True)


def stop_billing_consumer():
    """Stop billing consumer"""
    global consumer_instance
    if consumer_instance:
        logger.info("Stopping billing message consumer...")
        consumer_instance.stop_consuming()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    global consumer_thread
    
    # Startup: Start consumer in separate thread
    logger.info("Admin Service starting...")
    try:
        consumer_thread = threading.Thread(target=start_billing_consumer, daemon=True)
        consumer_thread.start()
        logger.info("Billing message consumer started in background")
    except Exception as e:
        logger.error(f"Failed to start billing consumer: {str(e)}")
    
    yield
    
    # Shutdown: Stop consumer
    logger.info("Admin Service shutting down...")
    stop_billing_consumer()


app = FastAPI(title="Admin Service", openapi_url="/openapi.json", lifespan=lifespan)

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

# Add authentication middleware
app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/api/user")
app.include_router(auth.router, prefix="/api/auth")
app.include_router(user_apikey.router, prefix="/api/apikey")
app.include_router(user_manager.router, prefix="/api/user_manager")
app.include_router(payment.router, prefix="/api/payment")
app.include_router(mcp_manager.router, prefix="/api/mcp")
app.include_router(order.router, prefix="/api/order")
app.include_router(sys_config.router, prefix="/api/sysconfig")
app.include_router(payment_channel.router, prefix="/api/payment_channel")
app.include_router(init_config.router, prefix="/api/common")
app.include_router(web.router, prefix="/api/web")
app.include_router(admin_stats.router, prefix="/api/overview")
app.include_router(user_stats.router, prefix="/api/stats")
app.include_router(email_test.router, prefix="/api/email_test")
app.include_router(upload.router, prefix="/api/upload")

# Logging is already configured by setup_logging("admin_service")
# 创建uploads目录（如果不存在）
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

# 挂载静态文件目录
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
def read_root():
    return {"message": f"Admin Service running on port {Config.ADMIN_PORT}"}
