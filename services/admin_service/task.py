from services.admin_service.tasks.alipay_order_monitor_task import AlipayOrderMonitorTask
from services.common.logging_config import get_logger
logger = get_logger(__name__)

def start_alipay_order_monitor():
    """Start Alipay order monitor task"""
    try:
        logger.info("Starting Alipay order monitor task...")
        alipay_monitor_task = AlipayOrderMonitorTask.get_instance()
        alipay_monitor_task.start_monitor()
    except Exception as e:
        logger.error(f"Failed to start Alipay order monitor: {str(e)}", exc_info=True)

def stop_alipay_order_monitor():
    """Stop Alipay order monitor task"""
    try:
        logger.info("Stopping Alipay order monitor task...")
        alipay_monitor_task = AlipayOrderMonitorTask.get_instance()
        alipay_monitor_task.stop_monitor()
    except Exception as e:
        logger.error(f"Failed to stop Alipay order monitor: {str(e)}", exc_info=True)
