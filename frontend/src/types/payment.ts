// payment channel type
export type PaymentChannelType = "stripe";

// stripe config - admin need to configure
export interface StripeConfig {
  secret: string;
  webhook_secret: string;
}

// API return payment channel item structure
export interface PaymentChannelApiItem {
  id: PaymentChannelType;
  name: string;
  is_enabled: boolean;
  config: StripeConfig;
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
