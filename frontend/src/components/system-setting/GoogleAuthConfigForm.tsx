'use client';

import React, { useEffect, useState } from 'react';
import { Input, Button, Switch, AccordionItem, Accordion } from '@nextui-org/react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from "@/shared/lib/useTranslation";
import { getGoogleRedirectUri } from '@/hooks/useLogin';
import { GoogleAuthConfig } from '@/shared/types/system';

interface GoogleAuthConfigFormProps {
  config: GoogleAuthConfig;
  onSave: (config: GoogleAuthConfig) => void;
  isLoading?: boolean;
}

export const GoogleAuthConfigForm: React.FC<GoogleAuthConfigFormProps> = ({
  config,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<GoogleAuthConfig>(config);
  const [showClientSecret, setShowClientSecret] = useState(false);
  useEffect(() => {
    setFormData(config);
  }, [config]);
  const handleInputChange = (field: keyof GoogleAuthConfig, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isFormValid = formData.client_id.trim() !== '';

  return (
    <Accordion variant='splitted' itemClasses={{
      base: 'shadow-none border-1',
    }} defaultExpandedKeys={['google-auth-config']} className='px-0'>
      <AccordionItem key="google-auth-config" title={
        <div className="flex flex-col justify-between">
          <h3 className="text-lg font-semibold">{t('Google Login Settings')}</h3>
          <p className="text-sm text-gray-500">{t('Configure Google OAuth integration')}</p>
        </div>
      }>
        <div className="space-y-4">
          {/* enable google login */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{t('Enable Google Login')}</span>
              <span className="text-xs text-gray-500">{t('Allow users to sign in with Google')}</span>
            </div>
            <Switch
              isSelected={formData.is_enabled}
              onValueChange={(value) => {
                handleInputChange('is_enabled', value);
                onSave({
                  ...formData,
                  is_enabled: value
                });
              }}
              color="primary"
              size='sm'
            />
          </div>

          {/* Google Client ID */}
          <Input
            label={t('Google Client ID')}
            placeholder={t('OAuth 2.0 Client ID from Google Cloud Console')}
            value={formData.client_id}
            onChange={(e) => handleInputChange('client_id', e.target.value)}
            isRequired
            isDisabled={!formData.is_enabled}
          />

          {/* Google Client Secret */}
          <Input
            label={t('Google Client Secret')}
            placeholder={t('OAuth 2.0 Client Secret (optional, for server-side verification)')}
            value={formData.client_secret || ''}
            onChange={(e) => handleInputChange('client_secret', e.target.value)}
            type={showClientSecret ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowClientSecret(!showClientSecret)}
                className="focus:outline-none"
                disabled={!formData.is_enabled}
              >
                {showClientSecret ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            isDisabled={!formData.is_enabled}
          />

          {/* Redirect URI */}
          <Input
            label={t('Redirect URI')}
            placeholder="https://yourdomain.com/auth/google/callback"
            description={t('Authorized redirect URI configured in Google Cloud Console')}
            value={getGoogleRedirectUri()}
            isDisabled={true}
          />

        </div>

        {/* Action Buttons */}
        {
          formData.is_enabled && (
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
          )
        }
      </AccordionItem>
    </Accordion>
  );
};