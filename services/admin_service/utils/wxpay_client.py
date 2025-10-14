import asyncio
import json
import os
from wechatpayv3.async_ import AsyncWeChatPay, WeChatPayType
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class WxPayConfig:
    APP_ID = "app_id"
    APIV3_KEY = "apiv3_key"
    MCH_ID = "mch_id"
    PRIVATE_KEY = "private_key"
    CERT_SERIAL_NO = "cert_serial_no"
    NOTIFY_URL = "notify_url"
    

class WxPayClient:
    def __init__(self, app_id: str, apiv3_key: str, mch_id: str, private_key: str, cert_serial_no: str, notify_url: str):
        """Initialize WeChat Pay client with required parameters."""
        
        # 验证输入参数
        if not all([app_id, apiv3_key, mch_id, private_key, cert_serial_no, notify_url]):
            missing_params = []
            if not app_id: missing_params.append("app_id")
            if not apiv3_key: missing_params.append("apiv3_key")
            if not mch_id: missing_params.append("mch_id")
            if not private_key: missing_params.append("private_key")
            if not cert_serial_no: missing_params.append("cert_serial_no")
            if not notify_url: missing_params.append("notify_url")
            
            error_msg = f"Missing required parameters: {', '.join(missing_params)}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # 存储配置参数
        self.app_id = app_id
        self.apiv3_key = apiv3_key
        self.mch_id = mch_id
        self.private_key = private_key
        self.cert_serial_no = cert_serial_no
        self.notify_url = notify_url
        
        # 修正证书目录路径计算 - 从 services/admin_service/utils/ 向上4级到项目根目录
        current_dir = os.path.dirname(__file__)  # utils/
        admin_service_dir = os.path.dirname(current_dir)  # admin_service/
        services_dir = os.path.dirname(admin_service_dir)  # services/
        project_root = os.path.dirname(services_dir)  # 项目根目录
        self.cert_dir = os.path.join(project_root, 'wx_cer')
        
        # 检查证书目录是否存在
        if not os.path.exists(self.cert_dir):
            logger.error(f"Certificate directory not found: {self.cert_dir}")
            logger.error(f"Please ensure wx_cer directory exists in project root")
            raise FileNotFoundError(f"Certificate directory not found: {self.cert_dir}")
        else:
            logger.info(f"Certificate directory found: {self.cert_dir}")
            # 列出证书目录中的文件
            cert_files = os.listdir(self.cert_dir)
            logger.info(f"Certificate files: {cert_files}")
        
        logger.info(f"WeChat Pay client configured with mch_id: {mch_id}, app_id: {app_id}, cert_dir: {self.cert_dir}")
    
    async def create_order(self, order_id: str, amount: float, description: str) -> Optional[str]:
        """Create order using async context manager"""
        try:
            logger.info(f"Creating WeChat Pay order: {order_id}, amount: {amount}, description: {description}")
            logger.info(f"Using certificate directory: {self.cert_dir}")
            
            # 验证金额格式 (微信支付要求金额为分，整数)
            amount_fen = int(amount * 100)
            if amount_fen <= 0:
                logger.error(f"Invalid amount: {amount} (must be positive)")
                return None
            
            # 使用异步上下文管理器
            async with AsyncWeChatPay(
                wechatpay_type=WeChatPayType.NATIVE,
                mchid=self.mch_id,
                private_key=self.private_key,
                cert_serial_no=self.cert_serial_no,
                apiv3_key=self.apiv3_key,
                appid=self.app_id,
                notify_url=self.notify_url,
                cert_dir=self.cert_dir,  # 使用正确的证书目录路径
                partner_mode=False
            ) as wxpay:
                
                # 调用微信支付API
                code, message = await wxpay.pay(
                    out_trade_no=order_id,
                    amount={
                        "total": amount_fen,
                        "currency": "CNY"
                    },  # 微信支付金额单位为分
                    # amount= amount_fen,
                    description=description,
                )
                
                logger.debug(f"WeChat Pay create order response: {code}, {message}")
                
                if code == 200:
                    try:
                        result = json.loads(message)
                        code_url = result.get('code_url')
                        if code_url:
                            logger.info(f"Successfully created WeChat Pay order: {order_id}")
                            return code_url
                        else:
                            logger.error(f"No code_url in response: {result}")
                            return None
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse WeChat Pay response: {str(e)}")
                        return None
                else:
                    logger.error(f"WeChat Pay API error - Code: {code}, Message: {message}")
                    return None
            
        except Exception as e:
            logger.error(f"Error creating WeChat Pay order: {str(e)}")
            return None

    async def query_order(self, order_id: str) -> Optional[dict]:
        """Query order using async context manager"""
        try:
            logger.info(f"Querying WeChat Pay order: {order_id}")
            
            # 使用异步上下文管理器
            async with AsyncWeChatPay(
                wechatpay_type=WeChatPayType.NATIVE,
                mchid=self.mch_id,
                private_key=self.private_key,
                cert_serial_no=self.cert_serial_no,
                apiv3_key=self.apiv3_key,
                appid=self.app_id,
                notify_url=self.notify_url,
                cert_dir=self.cert_dir,  # 使用正确的证书目录路径
                partner_mode=False
            ) as wxpay:
                
                code, message = await wxpay.query(out_trade_no=order_id)
                
                if code == 200:
                    try:
                        result = json.loads(message)
                        logger.info(f"Successfully queried WeChat Pay order: {order_id}")
                        return result
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse WeChat Pay query response: {str(e)}")
                        return None
                else:
                    logger.error(f"WeChat Pay query error - Code: {code}, Message: {message}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error querying WeChat Pay order: {str(e)}")
            return None