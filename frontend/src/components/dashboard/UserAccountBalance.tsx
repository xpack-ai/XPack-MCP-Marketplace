"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import AccountBalanceTable from "./AccountBalanceTable";

const UserAccountBalance: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardDemoContent
      title={t("Account Balance")}
      description={t("View your balance and transaction history")}
    >
      <div className="space-y-6 w-full">
        <AccountBalanceTable />
      </div>
    </DashboardDemoContent>
  );
};

export default UserAccountBalance;
