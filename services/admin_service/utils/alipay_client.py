import os
import ssl
import urllib3

# 禁用SSL证书验证警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 禁用SSL证书验证
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

from alipay.aop.api.AlipayClientConfig import AlipayClientConfig
from alipay.aop.api.DefaultAlipayClient import DefaultAlipayClient
from alipay.aop.api.domain.AlipayTradePagePayModel import AlipayTradePagePayModel
from alipay.aop.api.request.AlipayTradePagePayRequest import AlipayTradePagePayRequest
from alipay.aop.api.domain.AlipayTradeQueryModel import AlipayTradeQueryModel
from alipay.aop.api.request.AlipayTradeQueryRequest import AlipayTradeQueryRequest

class AlipayClient:
    def __init__(self, app_id: str = "", app_private_key: str = "", alipay_public_key: str = ""):
        config = AlipayClientConfig()
        config.server_url = os.getenv("ALIPAY_SERVER_URL", "https://openapi.dl.alipaydev.com/gateway.do")
        config.app_id = app_id or ""
        config.app_private_key = app_private_key or ""
        config.alipay_public_key = alipay_public_key or ""
        self.config = config

    def create_trade(self, out_trade_no: str, total_amount: float, subject: str, body: str) -> str:
        """
        Create an Alipay order and return the payment URL.
        """
        client = DefaultAlipayClient(alipay_client_config=self.config)
        model = AlipayTradePagePayModel()
        print("create trade out_trade_no:", out_trade_no)
        model.out_trade_no = out_trade_no
        model.total_amount = total_amount
        model.subject = subject
        model.body = body
        model.product_code = "FAST_INSTANT_TRADE_PAY"
        model.qr_pay_mode = 2
        model.timeout_express = "5m"
        request = AlipayTradePagePayRequest(biz_model=model)
        response = client.page_execute(request, http_method="GET")

        return response
    
    def query_order_status(self, out_trade_no: str) -> dict:
        """
        Query Alipay order status by out_trade_no.
        """
        model = AlipayTradeQueryModel()
        print("query out_trade_no:", out_trade_no)
        model.out_trade_no = out_trade_no
        
        request = AlipayTradeQueryRequest(biz_model=model)
        client = DefaultAlipayClient(alipay_client_config=self.config)
        response = client.execute(request)
        
        return response
        