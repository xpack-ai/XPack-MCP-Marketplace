'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, AccordionItem, Accordion, Select, SelectItem } from '@nextui-org/react';
import { PlatformConfig } from '@/shared/types/system';
import { useTranslation } from "@/shared/lib/useTranslation";
import { SUPPORTED_LANGUAGES } from '@/shared/lib/i18n';

interface PlatformConfigFormProps {
  config: PlatformConfig;
  onSave: (config: PlatformConfig) => void;
  isLoading?: boolean;
}

export const PlatformConfigForm: React.FC<PlatformConfigFormProps> = ({
  config,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PlatformConfig>(config);

  // when context config updated, sync to form
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (field: keyof PlatformConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    onSave(formData);
  };

  const isFormValid = formData.name.trim() !== '' && formData.currency?.trim() !== '';

  return (
    <Accordion variant='splitted' itemClasses={{
      base: 'shadow-none border-1',
    }} defaultExpandedKeys={['platform-config']} className='px-0'>
      <AccordionItem key="platform-config" title={
        <div className="flex flex-col justify-between">
          <h3 className="text-lg font-semibold">{t('Platform Information')}</h3>
          <p className="text-sm text-gray-500">{t('Configure platform logo, name, titles, language')}</p>
        </div>
      }>
        <div className="space-y-4">
          {/* platform name */}
          <Input
            label={t('Platform Name')}
            placeholder={t('Enter platform name')}
            description={t('The name displayed across the platform')}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            isRequired
          />

          {/* platform logo */}
          <Input
            label={t('Platform Logo URL')}
            placeholder="https://example.com/logo.png"
            description={t('URL of the platform logo image (optional)')}
            value={formData.logo || ''}
            onChange={(e) => handleInputChange('logo', e.target.value)}
          />

          {/* website title */}
          <Input
            label={t('Website Title')}
            placeholder={t('Enter website title')}
            description={t('The title displayed in browser tab and search results')}
            value={formData.website_title || ''}
            onChange={(e) => handleInputChange('website_title', e.target.value)}
          />

          {/* homepage headline */}
          <Input
            label={t('Headline')}
            placeholder={t('Enter homepage headline')}
            description={t('Main headline displayed on the homepage')}
            value={formData.headline || ''}
            onChange={(e) => handleInputChange('headline', e.target.value)}
          />

          {/* homepage subheadline */}
          <Input
            label={t('Subheadline')}
            placeholder={t('Enter homepage subheadline')}
            description={t('Secondary headline displayed below the main headline')}
            value={formData.subheadline || ''}
            onChange={(e) => handleInputChange('subheadline', e.target.value)}
          />

          {/* platform language */}
          <Select
            label={t('Platform Language')}
            placeholder={t('Select platform language')}
            selectedKeys={formData.language ? [formData.language] : ['en']}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              if (selectedKey) {
                handleInputChange('language', selectedKey);
              }
            }}
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <SelectItem key={language.name} value={language.name}>
                {language.label}
              </SelectItem>
            ))}
          </Select>

          {/* comming soon:currency unit */}
          {/* <Select
            label={t('Currency Unit')}
            placeholder={t('Select currency')}
            description={t('Default currency for the platform')}
            selectedKeys={formData.currency ? [formData.currency] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              if (selectedKey) {
                handleInputChange('currency', selectedKey);
              }
            }}
            isRequired
          >
            {getCurrencyOptions().map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </Select> */}
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