'use client';

import React from 'react';
import { StripeConfigForm } from './StripeConfigForm';
import { useTranslation } from "@/shared/lib/useTranslation";
import { usePaymentChannelManagement } from "@/hooks/usePaymentChannelManagement";
import { StripeConfig } from "@/types/payment";
import { toast } from "react-hot-toast";

export const PaymentChannelsContent: React.FC = () => {
  const { t } = useTranslation();

  const {
    stripeConfig,
    isSaving,
    saveStripeConfig,
    testStripeConnection,
  } = usePaymentChannelManagement();


  // test stripe connection
  const handleTestStripeConnection = async (config: StripeConfig) => {
    const result = await testStripeConnection(config);

    if (result.success) {
      toast.success(t("Stripe connection test successful"));
    } else {
      toast.error(result.message || t("Stripe connection test failed"));
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* stripe configuration */}
      <StripeConfigForm
        config={stripeConfig}
        onSave={saveStripeConfig}
        onTest={handleTestStripeConnection}
        isLoading={isSaving}
        isTestLoading={false}
      />
    </div>
  );
};

export default PaymentChannelsContent;