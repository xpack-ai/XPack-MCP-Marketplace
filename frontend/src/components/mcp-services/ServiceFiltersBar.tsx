"use client";

import React from 'react';
import { Input, Select, SelectItem, Button } from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ServiceFilters } from '@/types/mcp-service';
import { Search, Plus } from 'lucide-react';

interface ServiceFiltersBarProps {
  filters: ServiceFilters;
  onFiltersChange: (filters: ServiceFilters) => void;
  onAddService: () => void;
  onImportOpenAPI?: () => void;
}

export const ServiceFiltersBar: React.FC<ServiceFiltersBarProps> = ({
  filters,
  onFiltersChange,
  onImportOpenAPI
}) => {
  const { t } = useTranslation();

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };


  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Button
          color="primary"
          onPress={onImportOpenAPI}
          startContent={<Plus size={16} />}
        >
          {t('Add Service')}
        </Button>
        {/* <Input
          placeholder={t('Search services...')}
          value={filters.search}
          onValueChange={handleSearchChange}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          classNames={{
            input: "text-sm",
            inputWrapper: "h-10"
          }}
        /> */}
      </div>

      <div className="flex gap-2">
        {/* <Select
          placeholder={t('Filter by status')}
          selectedKeys={filters.status ? [filters.status] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            handleStatusChange(value || '');
          }}
          className="w-40"
          classNames={{
            trigger: "h-10"
          }}
        >
          {[
            { key: "all", label: t('All Status') },
            { key: "enabled", label: t('Online') },
            { key: "disabled", label: t('Offline') }
          ].map((item) => (
            <SelectItem key={item.key} value={item.key}>
              {item.label}
            </SelectItem>
          ))}
        </Select> */}



      </div>
    </div>
  );
};