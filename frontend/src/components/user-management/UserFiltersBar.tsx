"use client";

import React from 'react';
import { Input } from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Search } from 'lucide-react';

interface UserFiltersBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const UserFiltersBar: React.FC<UserFiltersBarProps> = ({
  searchQuery,
  onSearchChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder={t('Search users...')}
          value={searchQuery}
          onValueChange={onSearchChange}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          classNames={{
            input: "text-sm",
            inputWrapper: "h-10"
          }}
        />
      </div>
    </div>
  );
};