"use client";

import React from "react";
import { StripeConfigForm } from "../payment/StripeConfigForm";
import { AlipayConfigForm } from "../payment/AlipayConfigForm";
import { WechatConfigForm } from "../payment/WechatConfigForm";
import { usePaymentChannelManagement } from "@/hooks/usePaymentChannelManagement";

export const PaymentChannelsContent: React.FC = () => {
  const {
    stripeConfig,
    alipayConfig,
    wechatConfig,
    isWechatSaving,
    isStripeSaving,
    isAlipaySaving,
    saveStripeConfig,
    saveAlipayConfig,
    saveWechatConfig,
    enableChannel,
    disableChannel,
  } = usePaymentChannelManagement();

  return (
    <div className="space-y-6 w-full">
      {/* stripe configuration */}
      <StripeConfigForm
        config={stripeConfig}
        onSave={saveStripeConfig}
        onEnable={enableChannel}
        onDisable={disableChannel}
        isLoading={isStripeSaving}
      />
      {/* coming soon */}
      {/* alipay configuration */}
      {/* <AlipayConfigForm
        config={alipayConfig}
        onSave={saveAlipayConfig}
        onEnable={enableChannel}
        onDisable={disableChannel}
        isLoading={isAlipaySaving}
      /> */}
      {/* coming soon */}
      {/* wechat configuration */}
      {/* <WechatConfigForm
        config={wechatConfig}
        onSave={saveWechatConfig}
        onEnable={enableChannel}
        onDisable={disableChannel}
        isLoading={isWechatSaving}
      /> */}
    </div>
  );
};

export default PaymentChannelsContent;
