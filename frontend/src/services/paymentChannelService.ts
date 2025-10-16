import {
  StripeConfig,
  AlipayConfig,
  WechatConfig,
  PaymentChannelApiItem,
  PaymentChannelListResponse,
  PaymentChannelTestResult,
} from "@/types/payment";
import { fetchAdminAPI } from "@/rpc/admin-api";
import { toast } from "react-hot-toast";
import i18n from "@/shared/lib/i18n";

export class PaymentChannelService {
  // get payment channel list
  async getPaymentChannelList(
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaymentChannelListResponse> {
    const response = await fetchAdminAPI<PaymentChannelApiItem[]>(
      `/api/payment_channel/list?page=${page}&page_size=${pageSize}`,
      {
        method: "GET",
      }
    );

    if (!response.success) {
      throw new Error(
        response.error_message || "Failed to fetch payment channels"
      );
    }

    return {
      data: response.data || [],
    };
  }

  // get payment channel info (stripe config)
  async getStripeConfig(): Promise<StripeConfig | null> {
    const response = await fetchAdminAPI<StripeConfig>(
      "/api/payment_channel/info",
      {
        method: "GET",
      }
    );

    if (!response.success) {
      if (response.code === "404") {
        return null; // Configuration does not exist
      }
      throw new Error(
        response.error_message || "Failed to fetch Stripe config"
      );
    }
    return response.data;
  }

  // Generic method to save payment channel configuration
  async savePaymentChannelConfig<T>(
    channelId: string,
    config: T,
    channelName: string
  ): Promise<boolean> {
    const response = await fetchAdminAPI<T>("/api/payment_channel/info", {
      method: "PUT",
      body: {
        id: channelId,
        config: {
          ...config,
          is_enabled: undefined,
        },
      } as unknown as BodyInit,
    });

    if (!response.success) {
      toast.error(
        response.error_message ||
          i18n.t("Failed to save {{channelName}} config", { channelName })
      );
      return false;
    }
    toast.success(
      i18n.t("{{channelName}} config saved successfully", { channelName })
    );
    return true;
  }

  // Save Stripe configuration
  async saveStripeConfig(config: StripeConfig): Promise<boolean> {
    return this.savePaymentChannelConfig("stripe", config, "Stripe");
  }

  // Generic method to test payment channel connection
  async testPaymentChannelConnection<T>(
    channelId: string,
    config: T,
    channelName: string
  ): Promise<PaymentChannelTestResult> {
    try {
      const response = await fetchAdminAPI<any>("/api/payment_channel/test", {
        method: "POST",
        body: {
          id: channelId,
          config: {
            ...config,
            is_enabled: undefined,
          },
        } as unknown as BodyInit,
      });

      if (!response.success) {
        return {
          success: false,
          message:
            response.error_message ||
            i18n.t("{{channelName}} connection test failed", { channelName }),
          details: response.data,
        };
      }

      return {
        success: true,
        message: i18n.t("{{channelName}} connection test successful", {
          channelName,
        }),
        details: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  // Test Stripe connection
  async testStripeConnection(
    config: StripeConfig
  ): Promise<PaymentChannelTestResult> {
    return this.testPaymentChannelConnection("stripe", config, "Stripe");
  }

  // enable payment channel
  async enablePaymentChannel(id: string): Promise<boolean> {
    const response = await fetchAdminAPI("/api/payment_channel/enable", {
      method: "PUT",
      body: {
        id,
      } as unknown as BodyInit,
    });

    if (!response.success) {
      toast.error(
        response.error_message || i18n.t("Failed to enable payment channel")
      );
      return false;
    }
    toast.success(i18n.t("Payment channel enabled successfully"));
    return true;
  }

  // disable payment channel
  async disablePaymentChannel(id: string): Promise<boolean> {
    const response = await fetchAdminAPI("/api/payment_channel/disable", {
      method: "PUT",
      body: {
        id,
      } as unknown as BodyInit,
    });

    if (!response.success) {
      toast.error(
        response.error_message || i18n.t("Failed to disable payment channel")
      );
      return false;
    }
    toast.success(i18n.t("Payment channel disabled successfully"));
    return true;
  }

  // Save Alipay configuration
  async saveAlipayConfig(config: AlipayConfig): Promise<boolean> {
    return this.savePaymentChannelConfig("alipay", config, "Alipay");
  }

  // Save WeChat configuration
  async saveWechatConfig(config: WechatConfig): Promise<boolean> {
    return this.savePaymentChannelConfig("wechat", config, "WeChat");
  }

  // Test Alipay connection
  async testAlipayConnection(
    config: AlipayConfig
  ): Promise<PaymentChannelTestResult> {
    return this.testPaymentChannelConnection("alipay", config, "Alipay");
  }

  // Test WeChat connection
  async testWechatConnection(
    config: WechatConfig
  ): Promise<PaymentChannelTestResult> {
    return this.testPaymentChannelConnection("wechat", config, "WeChat");
  }

  // validate stripe config
  validateStripeConfig(config: Partial<StripeConfig>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.secret) {
      errors.push("Secret Key cannot be empty");
    } else if (!config.secret.startsWith("sk_")) {
      errors.push("Secret Key format is incorrect, should start with sk_");
    }

    // Webhook Secret is optional
    if (config.webhook_secret && !config.webhook_secret.startsWith("whsec_")) {
      errors.push(
        "Webhook Secret format is incorrect, should start with whsec_"
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const paymentChannelService = new PaymentChannelService();
