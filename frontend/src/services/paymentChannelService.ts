import {
  StripeConfig,
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

  // Save Stripe configuration
  async saveStripeConfig(config: StripeConfig): Promise<boolean> {
    const response = await fetchAdminAPI<StripeConfig>(
      "/api/payment_channel/info",
      {
        method: "PUT",
        body: {
          id: "stripe",
          config: config,
        } as unknown as BodyInit,
      }
    );

    if (!response.success) {
      toast.error(
        response.error_message || i18n.t("Failed to save Stripe config")
      );
      return false;
    }
    toast.success(i18n.t("Stripe config saved successfully"));
    return true;
  }

  // Test Stripe connection
  async testStripeConnection(
    config: StripeConfig
  ): Promise<PaymentChannelTestResult> {
    try {
      const response = await fetchAdminAPI<any>("/api/payment_channel/info", {
        method: "PUT",
        body: JSON.stringify(config),
      });

      if (!response.success) {
        return {
          success: false,
          message: response.error_message || "Stripe connection test failed",
          details: response.data,
        };
      }

      return {
        success: true,
        message: "Stripe connection test successful",
        details: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  // enable payment channel
  async enablePaymentChannel(id: string): Promise<void> {
    const response = await fetchAdminAPI("/api/payment_channel/enable", {
      method: "POST",
      body: {
        id,
      } as unknown as BodyInit,
    });

    if (!response.success) {
      throw new Error(
        response.error_message || "Failed to enable payment channel"
      );
    }
  }

  // disable payment channel
  async disablePaymentChannel(id: string): Promise<void> {
    const response = await fetchAdminAPI("/api/payment_channel/disable", {
      method: "POST",
      body: {
        id,
      } as unknown as BodyInit,
    });

    if (!response.success) {
      throw new Error(
        response.error_message || "Failed to disable payment channel"
      );
    }
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

// export service instance
export const paymentChannelService = new PaymentChannelService();
