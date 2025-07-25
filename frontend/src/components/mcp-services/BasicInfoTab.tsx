"use client";

import React from 'react';
import {
  Input,
  Select,
  SelectItem,
  Chip,
} from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { AuthMethod, MCPServiceFormData } from '@/types/mcp-service';

interface BasicInfoTabProps {
  formData: MCPServiceFormData;
  newTag: string;
  setNewTag: (value: string) => void;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  newTag,
  setNewTag,
  onInputChange,
  onAddTag,
  onRemoveTag
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Input
        label={t('Service Name')}
        placeholder={t('Enter service name')}
        value={formData.name}
        onChange={(e) => onInputChange('name', e.target.value)}
        isRequired
      />

      <Input
        label={t('Short Description')}
        placeholder={t('Brief description of the service')}
        value={formData.short_description || ''}
        onChange={(e) => onInputChange('short_description', e.target.value)}
        isRequired
      />

      <Input
        label={t('API Endpoint')}
        placeholder="https://api.example.com/v1"
        value={formData.base_url || ''}
        onChange={(e) => onInputChange('base_url', e.target.value)}
        isRequired
      />

      <Select
        label={t('Authentication Type')}
        selectedKeys={formData.auth_method ? [formData.auth_method] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;
          onInputChange('auth_method', selectedKey);
          // clear auth config when switch auth type
          onInputChange('auth_header', '');
          onInputChange('auth_token', '');
        }}
      >
        <SelectItem key="none" value={AuthMethod.None}>{t('None')}</SelectItem>
        <SelectItem key="apikey" value={AuthMethod.APIKey}>{t('API Key')}</SelectItem>
        <SelectItem key="token" value={AuthMethod.BearerToken}>{t('Bearer Token')}</SelectItem>
      </Select>

      {/* auth config input fields */}
      {formData.auth_method === AuthMethod.APIKey && (
        <div className="space-y-4">
          <Input
            label={t('API Key Header Name')}
            placeholder="X-API-Key"
            value={formData.auth_header || ''}
            onChange={(e) => onInputChange('auth_header', e.target.value)}
            description={t('The header name for the API key (e.g., X-API-Key, Authorization)')}
          />
          <Input
            label={t('API Key Value')}
            placeholder={t('Enter API key')}
            type="password"
            value={formData.auth_token || ''}
            onChange={(e) => onInputChange('auth_token', e.target.value)}
            autoComplete='new-password'

          />
        </div>
      )}

      {formData.auth_method === AuthMethod.BearerToken && (
        <Input
          label={t('Bearer Token')}
          placeholder={t('Enter bearer token')}
          type="password"
          value={formData.auth_token || ''}
          onChange={(e) => onInputChange('auth_token', e.target.value)}
          description={t('The bearer token for authentication')}
          autoComplete='new-password'
        />
      )}

      {/* tag management */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('Tags')}</label>
        <div className="flex gap-2">
          <Input
            placeholder={t('Add tag')}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && onAddTag()}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData.tags || []).map((tag, index) => (
            <Chip
              key={index}
              onClose={() => onRemoveTag(tag)}
              variant="flat"
            >
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
};