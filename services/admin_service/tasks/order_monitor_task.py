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
    """订单信息数据类"""
    created_time: datetime
    user_id: Optional[str] = None
    amount: Optional[float] = None
    payment_id: Optional[str] = None
    payment_channel_id: Optional[str] = None

@dataclass
class PaymentChannelConfig:
    """支付渠道配置"""
    channel_id: str
    enabled: bool
    config: Dict[str, Any]


@dataclass
class ClientStatus:
    """客户端状态"""
    enabled: bool
    last_check_time: datetime
    error_count: int = 0
    last_error: Optional[str] = None


class PaymentClient(ABC):
    """支付客户端抽象基类"""
    
    @abstractmethod
    def query_order_status(self, order_id: str) -> Optional[Dict[str, Any]]:
        """查询订单状态"""
        pass
    
    @abstractmethod
    def parse_order_status(self, response: Dict[str, Any]) -> tuple[str, bool]:
        """
        解析订单状态响应
        Returns:
            tuple[status, should_remove]: (状态描述, 是否应该从监控队列移除)
        """
        pass


class AlipayPaymentClient(PaymentClient):
    """支付宝支付客户端"""
    
    def __init__(self, app_id: str, app_private_key: str, alipay_public_key: str):
        self.client = AlipayClient(app_id, app_private_key, alipay_public_key)
    
    def query_order_status(self, order_id: str) -> Optional[Dict[str, Any]]:
        """查询支付宝订单状态"""
        try:
            response = self.client.query_order_status(order_id)
            return response
        except Exception as e:
            logger.error(f"查询支付宝订单 {order_id} 状态失败: {e}")
            return None
    
    def parse_order_status(self, response: Dict[str, Any]) -> tuple[str, bool]:
        """解析支付宝订单状态"""
        try:
            # 解析响应JSON
            if isinstance(response, str):
                response_data = json.loads(response)
            else:
                response_data = response
            
            # 获取响应内容
            alipay_response = response_data.get('alipay_trade_query_response', {})
            
            if alipay_response.get('code') != '10000':
                logger.warning(f"支付宝订单查询失败: {alipay_response.get('msg', '未知错误')}")
                return "QUERY_FAILED", False
            
            trade_status = alipay_response.get('trade_status', '')
            
            # 根据交易状态处理
            if trade_status == 'WAIT_BUYER_PAY':
                return "WAITING", False
            elif trade_status in ['TRADE_SUCCESS', 'TRADE_FINISHED']:
                return "SUCCESS", True
            elif trade_status in ['TRADE_CLOSED', 'TRADE_CANCELED']:
                return "FAILED", True
            else:
                logger.warning(f"支付宝订单未知状态: {trade_status}")
                return f"UNKNOWN_{trade_status}", False
                
        except Exception as e:
            logger.error(f"解析支付宝订单响应失败: {e}")
            return "PARSE_ERROR", False


class WxPayPaymentClient(PaymentClient):
    """微信支付客户端"""
    
    def __init__(self, app_id: str, apiv3_key: str, mch_id: str, private_key: str, cert_serial_no: str,notify_url: str):
        self.client = WxPayClient(app_id, apiv3_key, mch_id, private_key, cert_serial_no,notify_url)
    
    def query_order_status(self, order_id: str) -> Optional[Dict[str, Any]]:
        """查询微信支付订单状态"""
        try:
            # 微信支付客户端是异步的，需要在事件循环中运行
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                response = loop.run_until_complete(self.client.query_order(order_id))
                return response
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"查询微信支付订单 {order_id} 状态失败: {e}")
            return None
    
    def parse_order_status(self, response: Dict[str, Any]) -> tuple[str, bool]:
        """解析微信支付订单状态"""
        try:
            trade_state = response.get('trade_state', '')
            
            # 根据交易状态处理
            if trade_state == 'NOTPAY':
                return "WAITING", False
            elif trade_state == 'SUCCESS':
                return "SUCCESS", True
            elif trade_state in ['CLOSED', 'REVOKED', 'PAYERROR']:
                return "FAILED", True
            elif trade_state == 'USERPAYING':
                return "PAYING", False
            else:
                logger.warning(f"微信支付订单未知状态: {trade_state}")
                return f"UNKNOWN_{trade_state}", False
                
        except Exception as e:
            logger.error(f"解析微信支付订单响应失败: {e}")
            return "PARSE_ERROR", False


class OrderMonitorTask:
    """通用支付订单状态监控服务 - 单例模式"""
    
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
        # 确保只初始化一次
        if hasattr(self, '_initialized') and self._initialized:
            return

        self.payment_clients: Dict[str, PaymentClient] = {}
        self.client_status: Dict[str, ClientStatus] = {}  # 客户端状态管理
        self.order_queue: Queue[OrderInfo] = Queue(maxsize=200)
        self.is_running = False
        self.monitor_thread: Optional[threading.Thread] = None
        self.config_check_thread: Optional[threading.Thread] = None  # 配置检查线程
        self.check_interval = 10  # 检查间隔10秒
        self.config_check_interval = 60  # 配置检查间隔60秒
        self.timeout_minutes = 6  # 超时时间6分钟
        self._initialized = True
        
        logger.info("OrderMonitorTask 通用订单监控服务单例实例已创建")
    
    @classmethod
    def get_instance(cls) -> 'OrderMonitorTask':
        """获取单例实例"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def _load_payment_channels(self) -> List[PaymentChannelConfig]:
        """加载支付渠道配置"""
        db = SessionLocal()
        try:
            payment_channel_service = PaymentChannelService(db)
            channels = []
            
            # 加载支付宝配置
            alipay_config = payment_channel_service.get_config("alipay")
            if alipay_config:
                channels.append(PaymentChannelConfig(
                    channel_id="alipay",
                    enabled=alipay_config.get("enable", False),
                    config=alipay_config
                ))
            
            # 加载微信支付配置
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
        """初始化支付客户端"""
        # 保存当前启用的客户端状态
        current_enabled = {k: v.enabled for k, v in self.client_status.items()}
        
        for channel in channels:
            try:
                # 检查客户端是否应该启用
                should_enable = channel.enabled and current_enabled.get(channel.channel_id, True)
                
                if not should_enable:
                    # 如果客户端被禁用，从payment_clients中移除但保留状态
                    if channel.channel_id in self.payment_clients:
                        del self.payment_clients[channel.channel_id]
                    self.client_status[channel.channel_id] = ClientStatus(
                        enabled=False,
                        last_check_time=datetime.now()
                    )
                    logger.info(f"{channel.channel_id} 支付客户端已禁用")
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
                    logger.info("支付宝支付客户端初始化成功")
                
                elif channel.channel_id == "wechat":
                    client = WxPayPaymentClient(
                        app_id=channel.config[WxPayConfig.APP_ID],
                        apiv3_key=channel.config[WxPayConfig.APIV3_KEY],
                        mch_id=channel.config[WxPayConfig.MCH_ID],
                        private_key=channel.config[WxPayConfig.PRIVATE_KEY],
                        cert_serial_no=channel.config[WxPayConfig.CERT_SERIAL_NO],
                    )
                    self.payment_clients["wechat"] = client
                    self.client_status["wechat"] = ClientStatus(
                        enabled=True,
                        last_check_time=datetime.now()
                    )
                    logger.info("微信支付客户端初始化成功")
                    
            except Exception as e:
                logger.error(f"初始化 {channel.channel_id} 支付客户端失败: {e}")
                # 记录错误状态
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
        添加订单到监控队列
        Args:
            order_info: 订单信息(可选)
            payment_id: 支付订单ID(可选)
        Returns:
            bool: 是否添加成功
        """
        if payment_id is not None:
            # 创建新的数据库会话来查询订单
            db = SessionLocal()
            try:
                user_wallet_history_service = UserWalletHistoryService(db)
                order = user_wallet_history_service.get_order_by_id(payment_id)
                if order is None:
                    logger.error(f"订单 {payment_id} 不存在，无法添加到监控队列")
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
            logger.error("订单信息为空，无法添加到监控队列")
            return False
        
        # 检查支付渠道是否支持且启用
        if order_info.payment_channel_id is None:
            logger.warning("支付渠道ID为空，无法添加到监控队列")
            return False
            
        if (order_info.payment_channel_id not in self.client_status or 
            not self.client_status[order_info.payment_channel_id].enabled):
            logger.warning(f"支付渠道 {order_info.payment_channel_id} 未启用，无法添加到监控队列")
            return False
            
        try:
            self.order_queue.put_nowait(order_info)
            logger.info(f"订单 {order_info.payment_id} ({order_info.payment_channel_id}) 已添加到监控队列")
            return True
        except Exception as e:
            logger.error(f"添加订单到监控队列失败: {e}")
            return False
    
    def start_monitor(self) -> bool:
        """
        启动订单状态监控
        
        Returns:
            bool: 是否启动成功
        """
        if self.is_running:
            logger.warning("订单监控服务已在运行中")
            return False
        
        try:
            # 加载支付渠道配置
            channels = self._load_payment_channels()
            if not channels:
                logger.error("未找到可用的支付渠道配置")
                return False
            
            # 初始化支付客户端
            self._initialize_payment_clients(channels)
            
            # 加载待监控的订单
            self._load_pending_orders()
            
            # 启动监控线程
            self.is_running = True
            self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
            self.monitor_thread.start()
            
            # 启动配置检查线程
            self.config_check_thread = threading.Thread(target=self._config_check_loop, daemon=True)
            self.config_check_thread.start()
            
            enabled_clients = [k for k, v in self.client_status.items() if v.enabled]
            logger.info(f"通用订单监控服务已启动，启用的支付渠道: {enabled_clients}")
            return True
            
        except Exception as e:
            logger.error(f"启动订单监控服务失败: {e}")
            self.is_running = False
            return False
    
    def _load_pending_orders(self):
        """加载待监控的订单"""
        db = SessionLocal()
        try:
            user_wallet_history_service = UserWalletHistoryService(db)
            # 获取5分钟前的时间
            start_time = datetime.now() - timedelta(minutes=5)
            
            # 加载各个支付渠道的待处理订单
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
                    
            logger.info(f"已加载待监控订单，当前队列大小: {self.order_queue.qsize()}")
        finally:
            db.close()
    
    def stop_monitor(self) -> bool:
        """
        停止订单状态监控
        
        Returns:
            bool: 是否停止成功
        """
        if not self.is_running:
            logger.warning("订单监控服务未在运行")
            return False
            
        try:
            self.is_running = False
            
            # 停止监控线程
            if self.monitor_thread and self.monitor_thread.is_alive():
                self.monitor_thread.join(timeout=10)
                
            # 停止配置检查线程
            if self.config_check_thread and self.config_check_thread.is_alive():
                self.config_check_thread.join(timeout=5)
                
            logger.info("通用订单监控服务已停止")
            return True
        except Exception as e:
            logger.error(f"停止订单监控服务失败: {e}")
            return False
    
    def _monitor_loop(self):
        """监控循环主逻辑"""
        logger.info("订单监控循环开始")
        
        while self.is_running:
            try:
                # 获取当前队列中的所有订单
                current_orders = self._get_all_orders_from_queue()
                if not current_orders:
                    time.sleep(self.check_interval)
                    continue
                
                logger.info(f"开始检查 {len(current_orders)} 个订单状态")
                
                # 按支付渠道分组检查订单
                orders_by_channel = {}
                for order in current_orders:
                    channel_id = order.payment_channel_id
                    if channel_id is None:
                        logger.warning(f"订单 {order.payment_id} 的支付渠道ID为空，跳过监控")
                        continue
                    if channel_id not in orders_by_channel:
                        orders_by_channel[channel_id] = []
                    orders_by_channel[channel_id].append(order)
                
                # 检查每个渠道的订单
                remaining_orders = []
                for channel_id, orders in orders_by_channel.items():
                    # 检查客户端是否启用
                    if channel_id not in self.client_status or not self.client_status[channel_id].enabled:
                        logger.warning(f"支付渠道 {channel_id} 未启用，跳过 {len(orders)} 个订单的检查")
                        # 将订单重新放回队列等待客户端启用
                        remaining_orders.extend(orders)
                        continue
                    
                    logger.info(f"检查 {channel_id} 渠道的 {len(orders)} 个订单")
                    for order in orders:
                        try:
                            should_keep = self._check_single_order(order)
                            if should_keep:
                                remaining_orders.append(order)
                        except Exception as e:
                            logger.error(f"检查订单 {order.payment_id} 状态失败: {e}")
                            # 出错的订单重新放回队列
                            remaining_orders.append(order)
                
                # 将剩余订单重新放回队列
                for order in remaining_orders:
                    self.order_queue.put_nowait(order)
                
                logger.info(f"本轮检查完成，剩余 {len(remaining_orders)} 个订单继续监控")
                
            except Exception as e:
                logger.error(f"监控循环出现异常: {e}")
            
            # 等待下次检查
            time.sleep(self.check_interval)
        
        logger.info("订单监控循环结束")
    
    def _get_all_orders_from_queue(self) -> List[OrderInfo]:
        """从队列中获取所有订单"""
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
        检查单个订单状态
        Args:
            order: 订单信息
        Returns:
            bool: 是否需要继续监控（True=继续，False=移除）
        """
        # 检查是否超时
        if self._is_order_timeout(order):
            logger.info(f"订单 {order.payment_id} 已超时，从监控队列移除")
            self._handle_payment_failed(order)
            return False
        
        # 获取对应的支付客户端
        if order.payment_channel_id is None:
            logger.error("支付渠道ID为空，无法查询状态")
            return False
            
        client = self.payment_clients.get(order.payment_channel_id)
        if client is None:
            logger.error(f"未找到 {order.payment_channel_id} 支付客户端")
            return False
        
        if order.payment_id is None:
            logger.error("订单ID为空，无法查询状态")
            return False
        
        try:
            # 查询订单状态
            response = client.query_order_status(order.payment_id)
            if response is None:
                logger.warning(f"订单 {order.payment_id} 查询响应为空，继续监控")
                return True
            
            # 解析订单状态
            status, should_remove = client.parse_order_status(response)
            logger.info(f"订单 {order.payment_id} ({order.payment_channel_id}) 状态: {status}")
            
            if should_remove:
                if status == "SUCCESS":
                    self._handle_payment_success(order)
                else:
                    self._handle_payment_failed(order)
                return False
            else:
                # 订单仍在等待支付，继续监控
                return True
                
        except Exception as e:
            logger.error(f"查询订单 {order.payment_id} 状态失败: {e}")
            # 查询失败，继续监控
            return True
    
    def _is_order_timeout(self, order: OrderInfo) -> bool:
        """检查订单是否超时"""
        timeout_time = order.created_time + timedelta(minutes=self.timeout_minutes)
        return datetime.utcnow() > timeout_time
    
    def _handle_payment_success(self, order: OrderInfo):
        """处理支付成功"""
        try:
            logger.info(f"订单 {order.payment_id} ({order.payment_channel_id}) 支付成功")
            
            if order.payment_id is not None and order.payment_channel_id is not None:
                # 创建新的数据库会话来处理支付回调
                db = SessionLocal()
                try:
                    payment_service = PaymentService(db)
                    result = payment_service.payment_callback(
                        payment_id=order.payment_id,
                        payment_channel_id=order.payment_channel_id,
                    )
                    if result:
                        logger.info(f"订单 {order.payment_id} 支付成功处理完成")
                    else:
                        logger.error(f"订单 {order.payment_id} 支付成功处理失败")
                finally:
                    db.close()
            else:
                logger.error("订单ID或支付渠道ID为空，无法处理支付成功")
        except Exception as e:
            logger.error(f"处理订单 {order.payment_id} 支付成功时发生错误: {e}")

    def _handle_payment_failed(self, order: OrderInfo):
        """处理支付失败"""
        try:
            logger.info(f"订单 {order.payment_id} ({order.payment_channel_id}) 支付失败")
            
            if order.payment_id is not None and order.payment_channel_id is not None:
                # 创建新的数据库会话来处理支付回调
                db = SessionLocal()
                try:
                    payment_service = PaymentService(db)
                    result = payment_service.payment_callback(
                        payment_id=order.payment_id,
                        payment_channel_id=order.payment_channel_id,
                        status=2
                    )
                    if result:
                        logger.info(f"订单 {order.payment_id} 支付失败处理完成")
                    else:
                        logger.error(f"订单 {order.payment_id} 支付失败处理失败")
                finally:
                    db.close()
            else:
                logger.error("订单ID或支付渠道ID为空，无法处理支付失败")
        except Exception as e:
            logger.error(f"处理订单 {order.payment_id} 支付失败时发生错误: {e}")
    
    def get_monitor_status(self) -> Dict[str, Any]:
        """获取监控服务状态"""
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
        启用指定的支付客户端
        Args:
            channel_id: 支付渠道ID
        Returns:
            bool: 是否启用成功
        """
        if channel_id not in self.client_status:
            logger.error(f"未知的支付渠道: {channel_id}")
            return False
        
        if self.client_status[channel_id].enabled:
            logger.warning(f"支付客户端 {channel_id} 已经启用")
            return True
        
        try:
            # 重新加载配置并初始化客户端
            channels = self._load_payment_channels()
            target_channel = None
            for channel in channels:
                if channel.channel_id == channel_id:
                    target_channel = channel
                    break
            
            if target_channel is None:
                logger.error(f"未找到 {channel_id} 的配置")
                return False
            
            # 启用客户端状态
            self.client_status[channel_id].enabled = True
            
            # 重新初始化该客户端
            self._initialize_payment_clients([target_channel])
            
            logger.info(f"支付客户端 {channel_id} 已启用")
            return True
            
        except Exception as e:
            logger.error(f"启用支付客户端 {channel_id} 失败: {e}")
            self.client_status[channel_id].enabled = False
            return False
    
    def disable_client(self, channel_id: str) -> bool:
        """
        禁用指定的支付客户端
        Args:
            channel_id: 支付渠道ID
        Returns:
            bool: 是否禁用成功
        """
        if channel_id not in self.client_status:
            logger.error(f"未知的支付渠道: {channel_id}")
            return False
        
        if not self.client_status[channel_id].enabled:
            logger.warning(f"支付客户端 {channel_id} 已经禁用")
            return True
        
        try:
            # 禁用客户端状态
            self.client_status[channel_id].enabled = False
            
            # 从payment_clients中移除
            if channel_id in self.payment_clients:
                del self.payment_clients[channel_id]
            
            logger.info(f"支付客户端 {channel_id} 已禁用")
            return True
            
        except Exception as e:
            logger.error(f"禁用支付客户端 {channel_id} 失败: {e}")
            return False
    
    def _config_check_loop(self):
        """配置检查循环 - 定时检查配置变化并重新加载客户端"""
        logger.info("配置检查循环开始")
        
        while self.is_running:
            try:
                # 等待检查间隔
                time.sleep(self.config_check_interval)
                
                if not self.is_running:
                    break
                
                logger.debug("开始检查支付渠道配置变化")
                
                # 重新加载配置
                channels = self._load_payment_channels()
                if not channels:
                    logger.warning("未找到任何支付渠道配置")
                    continue
                
                # 检查配置是否有变化
                config_changed = False
                for channel in channels:
                    if channel.channel_id not in self.client_status:
                        config_changed = True
                        break
                    
                    # 检查启用状态是否变化
                    current_enabled = self.client_status[channel.channel_id].enabled
                    if channel.enabled != current_enabled:
                        config_changed = True
                        break
                
                if config_changed:
                    logger.info(self.client_status)
                    logger.info("检测到支付渠道配置变化，重新初始化客户端")
                    self._initialize_payment_clients(channels)
                    
                    # 更新检查时间
                    for channel_id in self.client_status:
                        self.client_status[channel_id].last_check_time = datetime.now()
                else:
                    logger.debug("支付渠道配置无变化")
                
            except Exception as e:
                logger.error(f"配置检查循环出现异常: {e}")
        
        logger.info("配置检查循环结束")
    
    def get_client_list(self) -> List[Dict[str, Any]]:
        """获取所有客户端列表及状态"""
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