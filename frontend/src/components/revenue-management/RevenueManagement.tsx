"use client";

import React from "react";
import { RevenueTable } from "./RevenueTable";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";

const RevenueManagement: React.FC = () => {

  // use custom hook to manage revenue data
  const {
    records,
    loading,
    pagination,
    setPage,
  } = useRevenueManagement();


  return (
    <DashboardDemoContent
      title="Revenue Management"
      description="Monitor platform revenue and view user recharge history"
    >
      <div className="space-y-6 w-full">
        {/* comming soon:Filters */}
        {/* <RevenueFiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatus}
        /> */}

        {/* Revenue Table */}
        <RevenueTable
          records={records}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>
    </DashboardDemoContent>
  );
};

export default RevenueManagement;
