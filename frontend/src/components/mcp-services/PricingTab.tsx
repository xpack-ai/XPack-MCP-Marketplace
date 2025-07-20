"use client";

import React from 'react';
import {
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { MCPServiceFormData } from '@/types/mcp-service';
import { getCurrencySymbol } from '@/shared/utils/currency';
import { ChargeType } from '@/shared/types/marketplace';

interface PricingTabProps {
  formData: MCPServiceFormData;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
}

export const PricingTab: React.FC<PricingTabProps> = ({
  formData,
  onInputChange
}) => {
  const { t } = useTranslation();


  return (
    <div className="space-y-4">
      <Select
        label={t('Charge Type')}
        selectedKeys={formData.charge_type ? [formData.charge_type] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;
          onInputChange('charge_type', selectedKey);
        }}
        renderValue={() => {
          const selectedKey = formData.charge_type || ChargeType.PerCall;
          if (selectedKey === ChargeType.Free) return t('Free');
          return t(selectedKey === ChargeType.PerCall ? 'Per Call' : 'Per Token');
        }}
      >
        <SelectItem key="free" value={ChargeType.Free}>
          <div className="flex flex-col">
            <span>{t('Free')}</span>
            <span className="text-xs text-gray-500">{t('No charge for API calls')}</span>
          </div>
        </SelectItem>
        <SelectItem key="per_call" value={ChargeType.PerCall}>
          <div className="flex flex-col">
            <span>{t('Per Call')}</span>
            <span className="text-xs text-gray-500">{t('Fixed price per API call')}</span>
          </div>
        </SelectItem>
      </Select>

      {formData.charge_type !== ChargeType.Free && (
        <Input
          label={t('Price')}
          type="number"
          min="0"
          step="0.01"
          value={formData.price || ''}
          onChange={(e) => onInputChange('price', e.target.value)}
          description={t('Price per unit (call or token)')}
          startContent={<span className="text-gray-500 leading-[20px]">{getCurrencySymbol()}</span>}
        />
      )}
    </div>
  );
};