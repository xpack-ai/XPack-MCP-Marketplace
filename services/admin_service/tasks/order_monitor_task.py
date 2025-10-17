import json
import threading
import time
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Protocol
from dataclasses import dataclass
from queue import Queue, Empty
from abc import ABC, abstractmethod
from services.common.database import get_db, SessionLocal
from services.common.logging_config import get_logger
from services.admin_service.utils.alipay_client import AlipayClient
from services.admin_service.utils.wxpay_client import WxPayClient,WxPayConfig
from services.admin_service.services.payment_service import PaymentService
from services.admin_service.services.payment_channel_service import PaymentChannelService
from services.admin_service.services.user_wallet_history_service import UserWalletHistoryService

logger = get_logger(__name__)

@dataclass
class OrderInfo:
    """Order information data class"""
    created_time: datetime
    user_id: Optional[str] = None
    amount: Optional[float] = None
    payment_id: Optional[str] = None
    payment_channel_id: Optional[str] = None

@dataclass
class PaymentChannelConfig:
    """Payment channel configuration"""
    channel_id: str
    enabled: bool
    config: Dict[str, Any]


@dataclass
class ClientStatus:
    """Client status"""
    enabled: bool
    last_check_time: datetime
    error_count: int = 0
    last_error: Optional[str] = None


class PaymentClient(ABC):
    """Payment client abstract base class"""
    
    @abstractmethod
    def query_order_status(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Query order status"""
        pass
    
    @abstractmethod
    def parse_order_status(self, response: Dict[str, Any]) -> tuple[str, bool]:
        """
        Parse order status response
        Returns:
            tuple[status, should_remove]: (status description, whether to remove from monitor queue)
        """
        pass


class AlipayPaymentClient(PaymentClient):
    """Alipay payment client"""
    
    def __init__(self, app_id: str, app_private_key: str, alipay_public_key: str):
        self.client = AlipayClient(app_id, app_private_key, alipay_public_key)
    
    def query_order_status(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Query Alipay order status"""
        try:
            response = self.client.query_order_status(order_id)
            return response
        except Exception as e:
            logger.error(f"Failed to query Alipay order {order_id} status: {e}")
            return None
    
    def parse_order_status(self, response: Dict[str, Any]) -> tuple[str, bool]:
        """Parse Alipay order status"""
        try:
            # Parse response JSON
            if isinstance(response, str):
                response_data = json.loads(response)
            else:
                response_data = response
            
            # Get response content
            alipay_response = response_data.get('alipay_trade_query_response', {})
            
            if alipay_response.get('code') != '10000':
                logger.warning(f"Alipay order query failed: {alipay_response.get('msg', 'Unknown error')}")
                return "QUERY_FAILED", False
            
            trade_status = alipay_response.get('trade_status', '')
            
            # Handle according to trade status
            if trade_status == 'WAIT_BUYER_PAY':
                return "WAITING", False
            elif trade_status in ['TRADE_SUCCESS', 'TRADE_FINISHED']:
                return "SUCCESS", True
            elif trade_status in ['TRADE_CLOSED', 'TRADE_CANCELED']:
                return "FAILED", True
            else:
                logger.warning(f"Unknown Alipay trade status: {trade_status}")
                return f"UNKNOWN_{trade_status}", False
                
        except Exception as e:
            logger.error(f"Failed to parse Alipay order response: {e}")
            return "PARSE_ERROR", False


class WxPayPaymentClient(PaymentClient):
    """WeChat Pay client"""
    
    def __init__(self, app_id: str, apiv3_key: str, mch_id: str, private_key: str, cert_serial_no: str,notify_url: str):
        self.client = WxPayClient(app_id, apiv3_key, mch_id, private_key, cert_serial_no,notify_url)
    
    def query_order_status(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Query WeChat Pay order status"""
        try:
            # WeChat Pay client is async; run in event loop
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                response = loop.run_until_complete(self.client.query_order(order_id))
                return response
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"Failed to query WeChat Pay order {order_id} status: {e}")
            return None
    
    def parse_order_status(self, response: Dict[str, Any]) -> tuple[str, bool]:
        """Parse WeChat Pay order status"""
        try:
            trade_state = response.get('trade_state', '')
            
            # Handle according to trade state
            if trade_state == 'NOTPAY':
                return "WAITING", False
            elif trade_state == 'SUCCESS':
                return "SUCCESS", True
            elif trade_state in ['CLOSED', 'REVOKED', 'PAYERROR']:
                return "FAILED", True
            elif trade_state == 'USERPAYING':
                return "PAYING", False
            else:
                logger.warning(f"Unknown WeChat trade state: {trade_state}")
                return f"UNKNOWN_{trade_state}", False
                
        except Exception as e:
            logger.error(f"Failed to parse WeChat order response: {e}")
            return "PARSE_ERROR", False


class OrderMonitorTask:
    """Generic payment order status monitoring service - singleton pattern"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(OrderMonitorTask, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        # Ensure initialization only happens once
        if hasattr(self, '_initialized') and self._initialized:
            return

        self.payment_clients: Dict[str, PaymentClient] = {}
        self.client_status: Dict[str, ClientStatus] = {}  # Client status management
        self.order_queue: Queue[OrderInfo] = Queue(maxsize=200)
        self.is_running = False
        self.monitor_thread: Optional[threading.Thread] = None
        self.config_check_thread: Optional[threading.Thread] = None  # Configuration check thread
        self.check_interval = 10  # Check interval: 10s
        self.config_check_interval = 60  # Config check interval: 60s
        self.timeout_minutes = 6  # Timeout: 6 minutes
        self._initialized = True
        logger.info("OrderMonitorTask singleton instance created")
    
    @classmethod
    def get_instance(cls) -> 'OrderMonitorTask':
        """Get singleton instance"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def _load_payment_channels(self) -> List[PaymentChannelConfig]:
        """Load payment channel configuration"""
        db = SessionLocal()
        try:
            payment_channel_service = PaymentChannelService(db)
            channels = []
            
            # Load Alipay config
            alipay_config = payment_channel_service.get_config("alipay")
            if alipay_config:
                channels.append(PaymentChannelConfig(
                    channel_id="alipay",
                    enabled=alipay_config.get("enable", False),
                    config=alipay_config
                ))
            
            # Load WeChat Pay config
            wechat_config = payment_channel_service.get_config("wechat")
            if wechat_config:
                channels.append(PaymentChannelConfig(
                    channel_id="wechat",
                    enabled=wechat_config.get("enable", False),
                    config=wechat_config
                ))
            
            return channels
        finally:
            db.close()
    
    def _initialize_payment_clients(self, channels: List[PaymentChannelConfig]):
        """Initialize payment clients"""
        # Save currently enabled client status
        current_enabled = {k: v.enabled for k, v in self.client_status.items()}
        
        for channel in channels:
            try:
                # Check whether client should be enabled
                should_enable = channel.enabled and current_enabled.get(channel.channel_id, True)
                
                if not should_enable:
                    # If the client is disabled, remove from payment_clients but keep status
                    if channel.channel_id in self.payment_clients:
                        del self.payment_clients[channel.channel_id]
                    self.client_status[channel.channel_id] = ClientStatus(
                        enabled=False,
                        last_check_time=datetime.now()
                    )
                    logger.info(f"Payment client {channel.channel_id} is disabled")
                    continue
                
                if channel.channel_id == "alipay":
                    client = AlipayPaymentClient(
                        app_id=channel.config["app_id"],
                        app_private_key=channel.config["app_private_key"],
                        alipay_public_key=channel.config["alipay_public_key"]
                    )
                    self.payment_clients["alipay"] = client
                    self.client_status["alipay"] = ClientStatus(
                        enabled=True,
                        last_check_time=datetime.now()
                    )
                    logger.info("Alipay payment client initialized successfully")
                
                elif channel.channel_id == "wechat":
                    client = WxPayPaymentClient(
                        app_id=channel.config[WxPayConfig.APP_ID],
                        apiv3_key=channel.config[WxPayConfig.APIV3_KEY],
                        mch_id=channel.config[WxPayConfig.MCH_ID],
                        private_key=channel.config[WxPayConfig.PRIVATE_KEY],
                        cert_serial_no=channel.config[WxPayConfig.CERT_SERIAL_NO],
                        notify_url=channel.config[WxPayConfig.NOTIFY_URL],
                    )
                    self.payment_clients["wechat"] = client
                    self.client_status["wechat"] = ClientStatus(
                        enabled=True,
                        last_check_time=datetime.now()
                    )
                    logger.info("WeChat Pay client initialized successfully")
                    
            except Exception as e:
                logger.error(f"Failed to initialize {channel.channel_id} payment client: {e}")
                # Record error status
                if channel.channel_id in self.client_status:
                    self.client_status[channel.channel_id].error_count += 1
                    self.client_status[channel.channel_id].last_error = str(e)
                else:
                    self.client_status[channel.channel_id] = ClientStatus(
                        enabled=False,
                        last_check_time=datetime.now(),
                        error_count=1,
                        last_error=str(e)
                    )
    
    def add_order_to_monitor(self, order_info: Optional[OrderInfo] = None, payment_id: Optional[str] = None) -> bool:
        """
        Add order to monitor queue
        Args:
            order_info: Order information (optional)
            payment_id: Payment order ID (optional)
        Returns:
            bool: Whether added successfully
        """
        if payment_id is not None:
            # Create new DB session to query order
            db = SessionLocal()
            try:
                user_wallet_history_service = UserWalletHistoryService(db)
                order = user_wallet_history_service.get_order_by_id(payment_id)
                if order is None:
                    logger.error(f"Order {payment_id} does not exist; cannot add to monitor queue")
                    return False
                order_info = OrderInfo(
                    created_time=order.created_at,
                    user_id=order.user_id,
                    amount=order.amount,
                    payment_id=str(order.id),
                    payment_channel_id=order.payment_method.value
                )
            finally:
                db.close()
        
        if order_info is None:
            logger.error("Order info is empty; cannot add to monitor queue")
            return False
        
        # Check whether payment channel is supported and enabled
        if order_info.payment_channel_id is None:
            logger.warning("Payment channel ID is empty; cannot add to monitor queue")
            return False
            
        if (order_info.payment_channel_id not in self.client_status or 
            not self.client_status[order_info.payment_channel_id].enabled):
            logger.warning(f"Payment channel {order_info.payment_channel_id} not enabled; cannot add to monitor queue")
            return False
            
        try:
            self.order_queue.put_nowait(order_info)
            logger.info(f"Order {order_info.payment_id} ({order_info.payment_channel_id}) added to monitor queue")
            return True
        except Exception as e:
            logger.error(f"Failed to add order to monitor queue: {e}")
            return False
    
    def start_monitor(self) -> bool:
        """
        Start order status monitoring
        
        Returns:
            bool: Whether started successfully
        """
        if self.is_running:
            logger.warning("Order monitoring service is already running")
            return False
        
        try:
            # Load payment channel configuration
            channels = self._load_payment_channels()
            if not channels:
                logger.error("No available payment channel configuration found")
                return False
            
            # Initialize payment clients
            self._initialize_payment_clients(channels)
            
            # Load pending orders
            self._load_pending_orders()
            
            # Start monitoring thread
            self.is_running = True
            self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
            self.monitor_thread.start()
            
            # Start configuration check thread
            self.config_check_thread = threading.Thread(target=self._config_check_loop, daemon=True)
            self.config_check_thread.start()
            
            enabled_clients = [k for k, v in self.client_status.items() if v.enabled]
            logger.info(f"Order monitoring service started; enabled payment channels: {enabled_clients}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start order monitoring service: {e}")
            self.is_running = False
            return False
    
    def _load_pending_orders(self):
        """Load pending orders to monitor"""
        db = SessionLocal()
        try:
            user_wallet_history_service = UserWalletHistoryService(db)
            # Get timestamp for 5 minutes ago
            start_time = datetime.now() - timedelta(minutes=5)
            
            # Load pending orders for each payment channel
            for channel_id in self.payment_clients.keys():
                order_list = user_wallet_history_service.order_list(channel_id, 0, start_time)
                for order in order_list:
                    order_info = OrderInfo(
                        created_time=order.created_at,
                        user_id=order.user_id,
                        amount=order.amount,
                        payment_id=str(order.id),
                        payment_channel_id=channel_id
                    )
                    self.add_order_to_monitor(order_info=order_info)
                    
            logger.info(f"Loaded pending orders; current queue size: {self.order_queue.qsize()}")
        finally:
            db.close()
    
    def stop_monitor(self) -> bool:
        """
        Stop order status monitoring
        
        Returns:
            bool: Whether stopped successfully
        """
        if not self.is_running:
            logger.warning("Order monitoring service is not running")
            return False
            
        try:
            self.is_running = False
            
            # Stop monitoring thread
            if self.monitor_thread and self.monitor_thread.is_alive():
                self.monitor_thread.join(timeout=10)
                
            # Stop configuration check thread
            if self.config_check_thread and self.config_check_thread.is_alive():
                self.config_check_thread.join(timeout=5)
                
            logger.info("Order monitoring service stopped")
            return True
        except Exception as e:
            logger.error(f"Failed to stop order monitoring service: {e}")
            return False
    
    def _monitor_loop(self):
        """Main monitoring loop logic"""
        logger.info("Order monitoring loop started")
        
        while self.is_running:
            try:
                # Get all orders in the current queue
                current_orders = self._get_all_orders_from_queue()
                if not current_orders:
                    time.sleep(self.check_interval)
                    continue
                
                logger.info(f"Starting to check status of {len(current_orders)} orders")
                
                # Group orders by payment channel for checking
                orders_by_channel = {}
                for order in current_orders:
                    channel_id = order.payment_channel_id
                    if channel_id is None:
                        logger.warning(f"Order {order.payment_id} payment channel ID is empty; skipping monitoring")
                        continue
                    if channel_id not in orders_by_channel:
                        orders_by_channel[channel_id] = []
                    orders_by_channel[channel_id].append(order)
                
                # Check orders for each channel
                remaining_orders = []
                for channel_id, orders in orders_by_channel.items():
                    # Check whether client is enabled
                    if channel_id not in self.client_status or not self.client_status[channel_id].enabled:
                        logger.warning(f"Payment channel {channel_id} not enabled; skipping checks for {len(orders)} orders")
                        # Put orders back into queue while waiting for client to be enabled
                        remaining_orders.extend(orders)
                        continue
                    
                    logger.info(f"Checking {len(orders)} orders for channel {channel_id}")
                    for order in orders:
                        try:
                            should_keep = self._check_single_order(order)
                            if should_keep:
                                remaining_orders.append(order)
                        except Exception as e:
                            logger.error(f"Check status for order {order.payment_id}: {e}")
                            # Put failed-checked orders back into the queue
                            remaining_orders.append(order)
                
                # Put remaining orders back into the queue
                for order in remaining_orders:
                    self.order_queue.put_nowait(order)
                
                logger.info(f"Round complete; {len(remaining_orders)} orders remain for monitoring")
                
            except Exception as e:
                logger.error(f"Monitoring loop encountered an exception: {e}")
            
            # Wait for next check
            time.sleep(self.check_interval)
        
        logger.info("Order monitoring loop ended")
    
    def _get_all_orders_from_queue(self) -> List[OrderInfo]:
        """Get all orders from queue"""
        orders = []
        while True:
            try:
                order = self.order_queue.get_nowait()
                orders.append(order)
            except Empty:
                break
        return orders
    
    def _check_single_order(self, order: OrderInfo) -> bool:
        """
        Check single order status
        Args:
            order: Order information
        Returns:
            bool: Whether to continue monitoring (True=continue, False=remove)
        """
        # Check timeout
        if self._is_order_timeout(order):
            logger.info(f"Order {order.payment_id} timed out; removing from monitor queue")
            self._handle_payment_failed(order)
            return False
        
        # Get the corresponding payment client
        if order.payment_channel_id is None:
            logger.error("Payment channel ID is empty; cannot query status")
            return False
            
        client = self.payment_clients.get(order.payment_channel_id)
        if client is None:
            logger.error(f"Payment client for {order.payment_channel_id} not found")
            return False
        
        if order.payment_id is None:
            logger.error("Order ID is empty; cannot query status")
            return False
        
        try:
            # Query order status
            response = client.query_order_status(order.payment_id)
            if response is None:
                logger.warning(f"Order {order.payment_id} query response is empty; continue monitoring")
                return True
            
            # Parse order status
            status, should_remove = client.parse_order_status(response)
            logger.info(f"Order {order.payment_id} ({order.payment_channel_id}) status: {status}")
            
            if should_remove:
                if status == "SUCCESS":
                    self._handle_payment_success(order)
                else:
                    self._handle_payment_failed(order)
                return False
            else:
                # Order is still awaiting payment; continue monitoring
                return True
                
        except Exception as e:
            logger.error(f"Failed to query status for order {order.payment_id}: {e}")
            # Query failed; continue monitoring
            return True
    
    def _is_order_timeout(self, order: OrderInfo) -> bool:
        """Check if order timed out"""
        timeout_time = order.created_time + timedelta(minutes=self.timeout_minutes)
        return datetime.utcnow() > timeout_time
    
    def _handle_payment_success(self, order: OrderInfo):
        """Handle payment success"""
        try:
            logger.info(f"Order {order.payment_id} ({order.payment_channel_id}) payment succeeded")
            
            if order.payment_id is not None and order.payment_channel_id is not None:
                # Create new DB session to handle payment callback
                db = SessionLocal()
                try:
                    payment_service = PaymentService(db)
                    result = payment_service.payment_callback(
                        payment_id=order.payment_id,
                        payment_channel_id=order.payment_channel_id,
                    )
                    if result:
                        logger.info(f"Order {order.payment_id} payment success handling completed")
                    else:
                        logger.error(f"Order {order.payment_id} payment success handling failed")
                finally:
                    db.close()
            else:
                logger.error("Order ID or payment channel ID is empty; cannot handle payment success")
        except Exception as e:
            logger.error(f"Error while handling payment success for order {order.payment_id}: {e}")

    def _handle_payment_failed(self, order: OrderInfo):
        """Handle payment failure"""
        try:
            logger.info(f"Order {order.payment_id} ({order.payment_channel_id}) payment failed")
            
            if order.payment_id is not None and order.payment_channel_id is not None:
                # Create new DB session to handle payment callback
                db = SessionLocal()
                try:
                    payment_service = PaymentService(db)
                    result = payment_service.payment_callback(
                        payment_id=order.payment_id,
                        payment_channel_id=order.payment_channel_id,
                        status=2
                    )
                    if result:
                        logger.info(f"Order {order.payment_id} payment failure handling completed")
                    else:
                        logger.error(f"Order {order.payment_id} payment failure handling failed")
                finally:
                    db.close()
            else:
                logger.error("Order ID or payment channel ID is empty; cannot handle payment failure")
        except Exception as e:
            logger.error(f"Error while handling payment failure for order {order.payment_id}: {e}")

    def get_monitor_status(self) -> Dict[str, Any]:
        """Get monitoring service status"""
        client_status_info = {}
        for channel_id, status in self.client_status.items():
            client_status_info[channel_id] = {
                "enabled": status.enabled,
                "last_check_time": status.last_check_time.isoformat(),
                "error_count": status.error_count,
                "last_error": status.last_error
            }
        
        return {
            "is_running": self.is_running,
            "enabled_channels": [k for k, v in self.client_status.items() if v.enabled],
            "all_channels": list(self.client_status.keys()),
            "client_status": client_status_info,
            "queue_size": self.order_queue.qsize(),
            "check_interval": self.check_interval,
            "config_check_interval": self.config_check_interval,
            "timeout_minutes": self.timeout_minutes
        }
    
    def enable_client(self, channel_id: str) -> bool:
        """
        Enable specified payment client
        Args:
            channel_id: Payment channel ID
        Returns:
            bool: Whether enabled successfully
        """
        if channel_id not in self.client_status:
            logger.error(f"Unknown payment channel: {channel_id}")
            return False
        
        if self.client_status[channel_id].enabled:
            logger.warning(f"Payment client {channel_id} is already enabled")
            return True
        
        try:
            # Reload configuration and initialize client
            channels = self._load_payment_channels()
            target_channel = None
            for channel in channels:
                if channel.channel_id == channel_id:
                    target_channel = channel
                    break
            
            if target_channel is None:
                logger.error(f"Configuration for {channel_id} not found")
                return False
            
            # Enable client status
            self.client_status[channel_id].enabled = True
            
            # Re-initialize the client
            self._initialize_payment_clients([target_channel])
            
            logger.info(f"Payment client {channel_id} enabled")
            return True
            
        except Exception as e:
            logger.error(f"Failed to enable payment client {channel_id}: {e}")
            self.client_status[channel_id].enabled = False
            return False
    
    def disable_client(self, channel_id: str) -> bool:
        """
        Disable specified payment client
        Args:
            channel_id: Payment channel ID
        Returns:
            bool: Whether disabled successfully
        """
        if channel_id not in self.client_status:
            logger.error(f"Unknown payment channel: {channel_id}")
            return False
        
        if not self.client_status[channel_id].enabled:
            logger.warning(f"Payment client {channel_id} is already disabled")
            return True
        
        try:
            # Disable client status
            self.client_status[channel_id].enabled = False
            
            # Remove from payment_clients
            if channel_id in self.payment_clients:
                del self.payment_clients[channel_id]
            
            logger.info(f"Payment client {channel_id} disabled")
            return True
            
        except Exception as e:
            logger.error(f"Failed to disable payment client {channel_id}: {e}")
            return False
    
    def _config_check_loop(self):
        """Configuration check loop - periodically checks for config changes and reloads clients"""
        logger.info("Configuration check loop started")
        
        while self.is_running:
            try:
                # Wait for check interval
                time.sleep(self.config_check_interval)
                
                if not self.is_running:
                    break
                
                logger.debug("Starting to check payment channel configuration changes")
                
                # Reload configuration
                channels = self._load_payment_channels()
                if not channels:
                    logger.warning("No payment channel configuration found")
                    continue
                
                # Check whether configuration changed
                config_changed = False
                for channel in channels:
                    if channel.channel_id not in self.client_status:
                        config_changed = True
                        break
                    
                    # Check whether enabled state changed
                    current_enabled = self.client_status[channel.channel_id].enabled
                    if channel.enabled != current_enabled:
                        config_changed = True
                        break
                
                if config_changed:
                    logger.info(self.client_status)
                    logger.info("Detected payment channel configuration changes; reinitializing clients")
                    self._initialize_payment_clients(channels)
                    
                    # Update check time
                    for channel_id in self.client_status:
                        self.client_status[channel_id].last_check_time = datetime.now()
                else:
                    logger.debug("No changes in payment channel configuration")
                
            except Exception as e:
                logger.error(f"Configuration check loop encountered an exception: {e}")
        
        logger.info("Configuration check loop ended")
    
    def get_client_list(self) -> List[Dict[str, Any]]:
        """Get list of all clients and their status"""
        clients = []
        for channel_id, status in self.client_status.items():
            clients.append({
                "channel_id": channel_id,
                "enabled": status.enabled,
                "is_active": channel_id in self.payment_clients,
                "last_check_time": status.last_check_time.isoformat(),
                "error_count": status.error_count,
                "last_error": status.last_error
            })
        return clients