"use client";

import React, { useState, useEffect } from "react";
import { overviewService } from "@/services/overviewService";
import { PlatformOverviewData } from "@/types/dashboard";
import "./ConsoleStats.css"
import { Alert, Card, CardBody, CardFooter } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { ChartBarIcon, DollarSignIcon, ServerIcon, UserIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => {
  const { t } = useTranslation();
  return (
    <Card shadow="none" className="border-1">
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{t(title)}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="ml-4 text-blue-500">
            {icon}
          </div>
        </div>
      </CardBody>
      <CardFooter>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{t(description)}</p>
        )}
      </CardFooter>
    </Card>
  );
};

const ConsoleStats: React.FC = () => {
  const { t } = useTranslation();
  const [overviewData, setOverviewData] = useState<PlatformOverviewData | null>(null);
  const fetchOverviewData = async () => {
    try {
      const data = await overviewService.getPlatformOverview();
      setOverviewData(data);
    } catch (err) {
      console.error('Failed to fetch overview data:', err);
    } finally {
    }
  };
  // get platform overview data
  useEffect(() => {
    fetchOverviewData();
  }, []);


  return (
    <div className="space-y-6">
      {/* stat card grid */}
      <div className="xpack-console-stats-grid gap-4">
        <StatCard
          title="Total Users"
          value={overviewData?.total_user.toLocaleString() || 0}
          icon={
            <UserIcon size={32} />
          }
          description="Platform registered users"
        />
        <StatCard
          title="Total Revenue"
          value={overviewData?.total_balance.toLocaleString() || 0}
          icon={
            <DollarSignIcon size={32} />
          }
          description="Platform total fund pool"
        />
        <StatCard
          title="Today's API Calls"
          value={overviewData?.invoke_count.today.toLocaleString() || 0}
          icon={
            <ChartBarIcon size={32} />
          }
          description="API call count"
        />

        <StatCard
          title="Total MCP Services"
          value={overviewData?.total_service.toLocaleString() || 0}
          icon={
            <ServerIcon size={32} />
          }
          description="Deployed services"
        />
      </div>

      {/* welcome guide */}
      <Alert color="primary" title={t("Welcome to XPack.AI Open Source")} description={t("This is your AI service management center. You can quickly view platform core data on the left and manage and configure your MCP services, users, payment channels, etc.")}></Alert>
    </div>
  );
};

export default ConsoleStats;