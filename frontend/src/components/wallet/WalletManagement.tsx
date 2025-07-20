"use client";

import React, { useState } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Card, CardBody, Button } from "@nextui-org/react";
import { Plus, CircleDollarSignIcon } from "lucide-react";
import { WalletTable, WalletRecord } from "./WalletTable";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import { useSharedStore } from "@/shared/store/share";
import { formatCurrency } from "@/shared/utils/currency";

// Mock data for demonstration
const mockWalletRecords: WalletRecord[] = [
  {
    id: "1",
    amount: 100,
    date: "2024-05-01 10:00",
    status: "completed",
  },
  {
    id: "2",
    amount: 200,
    date: "2024-05-02 12:00",
    status: "completed",
  },
  {
    id: "3",
    amount: 50,
    date: "2024-05-03 14:30",
    status: "pending",
  },
  {
    id: "4",
    amount: 150,
    date: "2024-05-04 09:15",
    status: "completed",
  },
  {
    id: "5",
    amount: 75,
    date: "2024-05-05 16:45",
    status: "failed",
  },
  {
    id: "6",
    amount: 300,
    date: "2024-05-06 11:20",
    status: "completed",
  },
];

interface WalletManagementProps {
  onRecharge: () => void;
}

const WalletManagement: React.FC<WalletManagementProps> = ({ onRecharge }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [user] = useSharedStore((state) => [state.user]);



  return (
    <DashboardDemoContent
      title={t("My Wallet")}
      description={t("Manage your wallet balance and view recharge history")}
    >
      <div className="space-y-6 w-full">
        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 " shadow="none">
          <CardBody className="p-8 relative overflow-hidden">
            {/* Background decorative circle */}
            <div className="absolute -top-8 -right-6 text-white/50">
              <CircleDollarSignIcon size={128} />
            </div>

            <div className="relative z-10">
              {/* Available Balance Label */}
              <div className="mb-2">
                <h2 className="text-white/90 text-base font-medium">
                  {t("Available Balance")}
                </h2>
              </div>

              {/* Balance Amount */}
              <div className="mb-6">
                <span className="text-white text-4xl font-bold">
                  {formatCurrency(user?.wallet?.balance || 0)}
                </span>
              </div>

              {/* Recharge Button */}
              <Button
                variant="bordered"
                startContent={<Plus size={16} />}
                onPress={onRecharge}
                aria-label="Recharge wallet"
                className="text-white border-white"
              >
                {t("Recharge")}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Recharge History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-default-700">
              {t("Recharge History")}
            </h3>
          </div>

          {/* Recharge History Table */}
          <WalletTable records={mockWalletRecords} loading={loading} />
        </div>
      </div>
    </DashboardDemoContent>
  );
};

export default WalletManagement;