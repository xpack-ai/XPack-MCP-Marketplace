'use client';

import React, { useEffect, useState } from 'react';
import { Input, Button, AccordionItem, Accordion } from '@nextui-org/react';
import { Eye, EyeOff } from 'lucide-react';
import { StripeConfig } from '@/types/payment';
import { useTranslation } from "@/shared/lib/useTranslation";

interface StripeConfigFormProps {
  config: StripeConfig;
  onSave: (config: StripeConfig) => void;
  onTest: (config: StripeConfig) => void;
  isLoading?: boolean;
  isTestLoading?: boolean;
}

export const StripeConfigForm: React.FC<StripeConfigFormProps> = ({
  config,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<StripeConfig>(config);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  useEffect(() => {
    console.log("config", config);
    setFormData(config);
  }, [config]);

  const handleInputChange = (field: keyof StripeConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };


  const isFormValid = formData.secret.trim() !== '' && formData.webhook_secret.trim() !== '';

  return (
    <Accordion variant='splitted' itemClasses={{
      base: 'shadow-none border-1',
    }} defaultExpandedKeys={['stripe-config']} className='px-0'>
      <AccordionItem key="stripe-config" title={
        <div className="flex flex-col justify-between">
          <h3 className="text-lg font-semibold">{t('Stripe Configuration')}</h3>
          <p className="text-sm text-gray-500">{t('Configure Stripe payment interface')}</p>
        </div>
      } >
        <div className="space-y-4">
          {/* Secret Key */}
          <Input
            label={t('Secret Key')}
            placeholder="sk_test_... or sk_live_..."
            description={t('Stripe secret key for server-side API calls')}
            value={formData.secret}
            onChange={(e) => handleInputChange('secret', e.target.value)}
            type={showSecretKey ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="focus:outline-none"
              >
                {showSecretKey ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            isRequired
          />

          {/* Webhook Secret (Optional) */}
          <Input
            label={t('Webhook Secret')}
            placeholder="whsec_..."
            description={t('Webhook signing secret for verifying Stripe events')}
            value={formData.webhook_secret || ''}
            onChange={(e) => handleInputChange('webhook_secret', e.target.value)}
            type={showWebhookSecret ? "text" : "password"}
            isRequired
            endContent={
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="focus:outline-none"
              >
                {showWebhookSecret ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 py-4">
          <Button
            color="primary"
            variant="solid"
            onPress={handleSave}
            isLoading={isLoading}
            isDisabled={!isFormValid}
            size='sm'
          >
            {t('Save')}
          </Button>
        </div>
      </AccordionItem>
    </Accordion>
  );
};