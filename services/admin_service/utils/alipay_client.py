import os

from alipay.aop.api.AlipayClientConfig import AlipayClientConfig
from alipay.aop.api.DefaultAlipayClient import DefaultAlipayClient
from alipay.aop.api.domain.AlipayTradePagePayModel import AlipayTradePagePayModel
from alipay.aop.api.request.AlipayTradePagePayRequest import AlipayTradePagePayRequest

class AlipayClient:

    def get_client(self, app_id: str, app_private_key: str, alipay_public_key: str) -> DefaultAlipayClient:
        """
        Initialize Alipay client with the provided credentials.
        """
        alipay_client_config = AlipayClientConfig()
        alipay_client_config.server_url = os.getenv("ALIPAY_SERVER_URL", "https://openapi.dl.alipaydev.com/gateway.do")
        alipay_client_config.app_id = app_id
        alipay_client_config.app_private_key = app_private_key
        alipay_client_config.alipay_public_key = alipay_public_key

        return DefaultAlipayClient(alipay_client_config=alipay_client_config)

    def create_trade(self, client: DefaultAlipayClient, out_trade_no: str, total_amount: float, subject: str, body: str) -> str:
        """
        Create an Alipay order and return the payment URL.
        """
        model = AlipayTradePagePayModel()
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
