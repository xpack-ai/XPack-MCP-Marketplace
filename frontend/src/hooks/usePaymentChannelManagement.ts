import { useState, useEffect, useCallback } from "react";
import {
  PaymentChannelApiItem,
  StripeConfig,
  PaymentChannelTestResult,
} from "@/types/payment";
import { paymentChannelService } from "@/services/paymentChannelService";

export const usePaymentChannelManagement = () => {
  const [channels, setChannels] = useState<PaymentChannelApiItem[]>([]);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>({
    secret: "",
    webhook_secret: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<PaymentChannelTestResult | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  // get payment channel list
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentChannelService.getPaymentChannelList();

      setChannels(response.data);

      // find stripe channel and get config
      const stripeChannel = response.data.find(
        (channel) => channel.id === "stripe"
      );
      if (stripeChannel) {
        setStripeConfig(stripeChannel.config);
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

  // save stripe config
  const saveStripeConfig = useCallback(async (config: StripeConfig) => {
    setIsSaving(true);
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
      setIsSaving(false);
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
        await paymentChannelService.enablePaymentChannel(channelId);
        await fetchChannels(); // re-fetch list
        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to enable payment channel";
        setError(errorMessage);
        return { success: false, message: errorMessage };
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
        await paymentChannelService.disablePaymentChannel(channelId);
        await fetchChannels(); // re-fetch list
        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to disable payment channel";
        setError(errorMessage);
        return { success: false, message: errorMessage };
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
    isSaving,
    loading,
    error,
    testResult,
    fetchChannels,
    saveStripeConfig,
    testStripeConnection,
    enableChannel,
    disableChannel,
    clearTestResult,
    clearError,
  };
};
