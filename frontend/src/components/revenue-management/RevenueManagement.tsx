"use client";

import React, { useState, useRef, useEffect } from "react";
import { RevenueTable } from "./RevenueTable";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { Input } from "@nextui-org/react";
import { Search } from "lucide-react";
import { useTranslation } from "@/shared/lib/useTranslation";

const RevenueManagement: React.FC = () => {
  const { t } = useTranslation();
  // use custom hook to manage revenue data
  const { 
    records, 
    loading, 
    pagination, 
    setPage, 
    setSearch,
    setPaymentType,
    setSort
  } = useRevenueManagement();

  const [searchValue, setSearchValue] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // 处理搜索 - 使用防抖
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    
    // 清除之前的定时器
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    // 设置新的定时器，500ms 后触发搜索
    searchTimerRef.current = setTimeout(() => {
      setSearch(value);
    }, 500);
  };

  return (
    <DashboardDemoContent
      title="Revenue"
      description="Monitor platform revenue and view user recharge history"
    >
      <div className="space-y-6 w-full">
        {/* 搜索框 - 右上角 */}
        <div className="flex justify-end items-center gap-4">
          <Input
            isClearable
            className="w-full sm:max-w-[400px]"
            placeholder={t('Search by email')}
            startContent={<Search className="w-4 h-4" />}
            value={searchValue}
            onClear={() => {
              setSearchValue('');
              if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
              }
              setSearch('');
            }}
            onValueChange={handleSearchChange}
          />
        </div>

        {/* Revenue Table */}
        <RevenueTable
          records={records}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onPaymentTypeChange={setPaymentType}
          onSortChange={setSort}
        />
      </div>
    </DashboardDemoContent>
  );
};

export default RevenueManagement;
