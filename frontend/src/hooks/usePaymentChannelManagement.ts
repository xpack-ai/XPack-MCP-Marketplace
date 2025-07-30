import { useState, useEffect, useCallback } from "react";
import {
  PaymentChannelApiItem,
  StripeConfig,
  AlipayConfig,
  WechatConfig,
  PaymentChannelTestResult,
} from "@/types/payment";
import { paymentChannelService } from "@/services/paymentChannelService";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { revalidatePlatformConfig } from "@/app/actions/revalidate";

export const usePaymentChannelManagement = () => {
  const { updateClientConfig, paymentChannels } = usePlatformConfig();
  const [channels, setChannels] = useState<PaymentChannelApiItem[]>([]);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>({
    secret: "",
    webhook_secret: "",
    is_enabled: false,
  });
  const [alipayConfig, setAlipayConfig] = useState<AlipayConfig>({
    app_id: "",
    app_private_key: "",
    alipay_public_key: "",
    is_enabled: false,
  });
  const [wechatConfig, setWechatConfig] = useState<WechatConfig>({
    app_id: "",
    mch_id: "",
    is_enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<PaymentChannelTestResult | null>(
    null
  );
  const [isWechatSaving, setIsWechatSaving] = useState(false);
  const [isStripeSaving, setIsStripeSaving] = useState(false);
  const [isAlipaySaving, setIsAlipaySaving] = useState(false);

  // get payment channel list
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentChannelService.getPaymentChannelList();

      setChannels(response.data);

      // find channels and get configs
      const stripeChannel = response.data.find(
        (channel) => channel.id === "stripe"
      );
      if (stripeChannel) {
        setStripeConfig({
          ...stripeChannel.config,
          is_enabled: stripeChannel.is_enabled,
        } as StripeConfig);
      }

      const alipayChannel = response.data.find(
        (channel) => channel.id === "alipay"
      );
      if (alipayChannel) {
        setAlipayConfig({
          ...alipayChannel.config,
          is_enabled: alipayChannel.is_enabled,
        } as AlipayConfig);
      }

      const wechatChannel = response.data.find(
        (channel) => channel.id === "wechat"
      );
      if (wechatChannel) {
        setWechatConfig({
          ...wechatChannel.config,
          is_enabled: wechatChannel.is_enabled,
        } as WechatConfig);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get payment channel list"
      );
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // test alipay connection
  const testAlipayConnection = useCallback(async (config: AlipayConfig) => {
    setLoading(true);
    setError(null);

    try {
      const result = await paymentChannelService.testAlipayConnection(config);
      setTestResult(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to test alipay connection";
      const failedResult: PaymentChannelTestResult = {
        success: false,
        message: errorMessage,
      };
      setTestResult(failedResult);
      setError(errorMessage);
      return failedResult;
    } finally {
      setLoading(false);
    }
  }, []);

  // test wechat connection
  const testWechatConnection = useCallback(async (config: WechatConfig) => {
    setLoading(true);
    setError(null);

    try {
      const result = await paymentChannelService.testWechatConnection(config);
      setTestResult(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to test wechat connection";
      const failedResult: PaymentChannelTestResult = {
        success: false,
        message: errorMessage,
      };
      setTestResult(failedResult);
      setError(errorMessage);
      return failedResult;
    } finally {
      setLoading(false);
    }
  }, []);

  // save alipay config
  const saveAlipayConfig = useCallback(async (config: AlipayConfig) => {
    setIsAlipaySaving(true);
    setError(null);

    try {
      const result = await paymentChannelService.saveAlipayConfig(config);
      if (result) {
        setAlipayConfig(config);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save alipay config";
      setError(errorMessage);
      return false;
    } finally {
      setIsAlipaySaving(false);
    }
  }, []);

  // save wechat config
  const saveWechatConfig = useCallback(async (config: WechatConfig) => {
    setIsWechatSaving(true);
    setError(null);

    try {
      const result = await paymentChannelService.saveWechatConfig(config);
      if (result) {
        setWechatConfig(config);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save wechat config";
      setError(errorMessage);
      return false;
    } finally {
      setIsWechatSaving(false);
    }
  }, []);

  // save stripe config
  const saveStripeConfig = useCallback(async (config: StripeConfig) => {
    setIsStripeSaving(true);
    setError(null);

    try {
      const result = await paymentChannelService.saveStripeConfig(config);
      if (result) {
        setStripeConfig(config);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save stripe config";
      setError(errorMessage);
      return false;
    } finally {
      setIsStripeSaving(false);
    }
  }, []);

  // test stripe connection
  const testStripeConnection = useCallback(async (config: StripeConfig) => {
    setLoading(true);
    setError(null);

    try {
      const result = await paymentChannelService.testStripeConnection(config);
      setTestResult(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to test stripe connection";
      const failedResult: PaymentChannelTestResult = {
        success: false,
        message: errorMessage,
      };
      setTestResult(failedResult);
      setError(errorMessage);
      return failedResult;
    } finally {
      setLoading(false);
    }
  }, []);

  // enable payment channel
  const enableChannel = useCallback(
    async (channelId: string) => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await paymentChannelService.enablePaymentChannel(channelId);
        if (result) {
          updateClientConfig({
            payment_channels: [
              ...paymentChannels,
              { id: channelId, name: channelId },
            ],
          });
          await revalidatePlatformConfig();
        }
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to enable payment channel";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchChannels]
  );

  // disable payment channel
  const disableChannel = useCallback(
    async (channelId: string) => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await paymentChannelService.disablePaymentChannel(channelId);
        if (result) {
          updateClientConfig({
            payment_channels: paymentChannels.filter(
              (channel) => channel.id !== channelId
            ),
          });
          await revalidatePlatformConfig();
        }
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to disable payment channel";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchChannels]
  );

  // clear test result
  const clearTestResult = useCallback(() => {
    setTestResult(null);
  }, []);

  // clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // initial load
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return {
    channels,
    stripeConfig,
    alipayConfig,
    wechatConfig,
    isWechatSaving,
    isStripeSaving,
    isAlipaySaving,
    loading,
    error,
    testResult,
    fetchChannels,
    saveStripeConfig,
    saveAlipayConfig,
    saveWechatConfig,
    testStripeConnection,
    testAlipayConnection,
    testWechatConnection,
    enableChannel,
    disableChannel,
    clearTestResult,
    clearError,
  };
};
