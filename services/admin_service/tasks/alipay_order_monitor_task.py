import json
import threading
import time
from datetime import datetime, timedelta
from typing import  List, Optional
from dataclasses import dataclass
from queue import Queue, Empty
# from sqlalchemy.orm import Session
from services.common.database import get_db, SessionLocal
from services.common.logging_config import get_logger
from services.admin_service.utils.alipay_client import AlipayClient
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


class AlipayOrderMonitorTask:
    """支付宝订单状态监控服务 - 单例模式"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(AlipayOrderMonitorTask, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        # 确保只初始化一次
        if hasattr(self, '_initialized') and self._initialized:
            return

        self.alipay_client: Optional[AlipayClient] = None
        self.order_queue: Queue[OrderInfo] = Queue(maxsize=100)
        self.is_running = False
        self.monitor_thread: Optional[threading.Thread] = None
        self.check_interval = 10  # 检查间隔10秒
        self.timeout_minutes = 6  # 超时时间6分钟
        self._initialized = True
        
        logger.info("AlipayOrderMonitorTask 单例实例已创建")
    
    @classmethod
    def get_instance(cls) -> 'AlipayOrderMonitorTask':
        """获取单例实例"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
        
    def update_alipay_config(self,app_id: str, app_private_key: str, alipay_public_key: str):
        self.alipay_client = AlipayClient(
            app_id=app_id,
            app_private_key=app_private_key,
            alipay_public_key=alipay_public_key
        )
        return

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
                )
            finally:
                db.close()
        
        if order_info is None:
            logger.error("订单信息为空，无法添加到监控队列")
            return False
            
        try:
            self.order_queue.put_nowait(order_info)
            logger.info(f"订单 {order_info.payment_id} 已添加到监控队列")
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
        # 检查支付宝客户端是否配置
        db = SessionLocal()
        try:
            payment_channel_service = PaymentChannelService(db)
            config = payment_channel_service.get_config("alipay")
            if config is None:
                logger.error("Not configured Alipay payment channel")
                return False
            if not config["enable"]:
                logger.error("Alipay payment channel is disabled")
                return False
            
            # 判断是否开启
            if self.is_running:
                logger.warning("订单监控服务已在运行中")
                return False
            
            self.update_alipay_config(config["app_id"], config["app_private_key"], config["alipay_public_key"])
            
            # 获取5分钟前的时间
            start_time = datetime.now() - timedelta(minutes=5)
            user_wallet_history_service = UserWalletHistoryService(db)
            order_list = user_wallet_history_service.order_list("alipay", 0, start_time)
            for order in order_list:
                order_info = OrderInfo(
                    created_time=order.created_at,
                    user_id=order.user_id,
                    amount=order.amount,
                    payment_id=order.id,
                )
                self.add_order_to_monitor(order_info=order_info)
        finally:
            db.close()

        try:
            self.is_running = True
            self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
            self.monitor_thread.start()
            logger.info("支付宝订单监控服务已启动")
            return True
        except Exception as e:
            logger.error(f"启动订单监控服务失败: {e}")
            self.is_running = False
            return False
    
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
            if self.monitor_thread and self.monitor_thread.is_alive():
                self.monitor_thread.join(timeout=10)
            logger.info("支付宝订单监控服务已停止")
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
                print("current_orders is", current_orders)
                if not current_orders:
                    time.sleep(self.check_interval)
                    continue
                
                logger.info(f"开始检查 {len(current_orders)} 个订单状态")
                
                # 检查每个订单
                remaining_orders = []
                for order in current_orders:
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
                print("get order from queue")
                order = self.order_queue.get_nowait()
                orders.append(order)
                print("order is", order)
            except Empty:
                print("Queue is empty, no more orders to process")
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
        
        try:
            client = self.alipay_client
            if client is None:
                logger.info("支付宝客户端未配置，无法查询订单状态")
                return False
            
            if order.payment_id is None:
                logger.error("订单ID为空，无法查询状态")
                return False
            
            # 查询订单状态
            response = client.query_order_status(order.payment_id)

            # 解析响应
            if self._parse_order_response(order, response):
                logger.info(f"订单 {order.payment_id} 状态已更新，从监控队列移除")
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

        print("now is", datetime.utcnow(), "timeout_time is", timeout_time)

        return datetime.utcnow() > timeout_time
    
    def _parse_order_response(self, order: OrderInfo, response: dict) -> bool:
        """
        解析订单查询响应
        Args:
            order: 订单信息
            response: 支付宝响应
            
        Returns:
            bool: 是否需要移除订单（True=移除，False=继续监控）
        """
        try:
            # 解析响应JSON
            if isinstance(response, str):
                response_data = json.loads(response)
            else:
                response_data = response
            
            # 获取响应内容
            alipay_response = response_data.get('alipay_trade_query_response', {})
            print("alipay_response is", response_data)
            if alipay_response.get('code') != '10000':
                logger.warning(f"订单 {order.payment_id} 查询失败: {alipay_response.get('msg', '未知错误')}")
                return False
            
            trade_status = alipay_response.get('trade_status', '')
            
            logger.info(f"订单 {order.payment_id} 当前状态: {trade_status}")
            
            # 根据交易状态处理
            if trade_status == 'WAIT_BUYER_PAY':
                # 等待买家付款，继续监控
                return False
            elif trade_status in ['TRADE_SUCCESS', 'TRADE_FINISHED']:
                # 支付成功，更新订单状态
                self._handle_payment_success(order)
                return True
            elif trade_status in ['TRADE_CLOSED', 'TRADE_CANCELED']:
                # 交易关闭或取消
                logger.info(f"order {order.payment_id} status: {trade_status}")
                self._handle_payment_failed(order)
                return True
            else:
                # 其他状态，继续监控
                logger.warning(f"订单 {order.payment_id} 未知状态: {trade_status}")
                return False
                
        except Exception as e:
            logger.error(f"解析订单 {order.payment_id} 响应失败: {e}")
            return False
    
    def _handle_payment_success(self, order: OrderInfo):
        try:
            logger.info(f"order {order.payment_id} payment success, status: TRADE_SUCCESS")
            
            if order.payment_id is not None:
                # 创建新的数据库会话来处理支付回调
                db = SessionLocal()
                try:
                    payment_service = PaymentService(db)
                    result = payment_service.payment_callback(
                        payment_id=order.payment_id,
                        payment_channel_id="alipay",
                    )
                    if result:
                        logger.info(f"订单 {order.payment_id} 支付成功处理完成")
                    else:
                        logger.error(f"订单 {order.payment_id} 支付成功处理失败")
                finally:
                    db.close()
            else:
                logger.error("订单ID为空，无法处理支付成功")
        except Exception as e:
            logger.error(f"处理订单 {order.payment_id} 支付成功时发生错误: {e}")

    def _handle_payment_failed(self, order: OrderInfo):
        try:
            logger.info(f"order {order.payment_id} payment failed")
            
            if order.payment_id is not None:
                # 创建新的数据库会话来处理支付回调
                db = SessionLocal()
                try:
                    payment_service = PaymentService(db)
                    result = payment_service.payment_callback(
                        payment_id=order.payment_id,
                        payment_channel_id="alipay",
                        status=2
                    )
                    if result:
                        logger.info(f"订单 {order.payment_id} 支付失败处理完成")
                    else:
                        logger.error(f"订单 {order.payment_id} 支付失败处理失败")
                finally:
                    db.close()
            else:
                logger.error("订单ID为空，无法处理支付失败")
        except Exception as e:
            logger.error(f"处理订单 {order.payment_id} 支付失败时发生错误: {e}")
    

