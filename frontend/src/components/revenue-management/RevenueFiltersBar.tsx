"use client";

import React from 'react';
import { Input, Select, SelectItem } from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Search } from 'lucide-react';

interface RevenueFiltersBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export const RevenueFiltersBar: React.FC<RevenueFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange
}) => {
  const { t } = useTranslation();

  const statusOptions = [
    { key: 'all', label: t('All Status') },
    { key: 'completed', label: t('Completed') },
    { key: 'pending', label: t('Pending') },
    { key: 'failed', label: t('Failed') }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder={t('Search by email or transaction ID...')}
          value={searchQuery}
          onValueChange={onSearchChange}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          className="w-full"
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          placeholder={t('Filter by status')}
          selectedKeys={[statusFilter]}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            onStatusChange(selectedKey);
          }}
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
};