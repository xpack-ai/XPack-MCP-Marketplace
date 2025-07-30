// payment channel type
export type PaymentChannelType = "stripe" | "alipay" | "wechat";

// stripe config - admin need to configure
export interface StripeConfig {
  secret: string;
  webhook_secret: string;
  is_enabled?: boolean;
}

// alipay config - admin need to configure
export interface AlipayConfig {
  app_id: string;
  app_private_key: string;
  alipay_public_key: string;
  is_enabled?: boolean;
}

// wechat config - admin need to configure
export interface WechatConfig {
  app_id: string;
  mch_id: string;
  is_enabled?: boolean;
}

// union type for all payment configs
export type PaymentConfig = StripeConfig | AlipayConfig | WechatConfig;

// API return payment channel item structure
export interface PaymentChannelApiItem {
  id: PaymentChannelType;
  name: string;
  is_enabled: boolean;
  config: PaymentConfig;
  update_time: string;
}

// API return payment channel list response
export interface PaymentChannelListResponse {
  data: PaymentChannelApiItem[];
}

// payment channel test result
export interface PaymentChannelTestResult {
  success: boolean;
  message: string;
  details?: any;
}
