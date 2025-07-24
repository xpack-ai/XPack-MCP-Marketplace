"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Button, Divider, Link } from "@nextui-org/react";
import { LogOut } from "lucide-react";
import { DashboardSidebarProps } from "@/shared/types/dashboard";
import { DynamicLogo } from "@/shared/components/DynamicLogo";

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabNavigate,
  onLogout,
  bottomPanel,
  sidebarItems,
  userProfilePanel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-[340px] h-screen bg-content1 border-r border-divider overflow-y-auto sidebar-thin">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2">
            <Link href={process.env.NEXT_PUBLIC_DOMAIN || "/"}>
              <DynamicLogo alt="Platform Logo" className="h-[20px]" />
            </Link>
          </div>
          <p className="text-default-600 text-sm">
            {t("Build incredible AI agents together")}
          </p>
        </div>

        {/* User Profile */}
        {userProfilePanel}

        {/* Navigation */}
        <div className="flex flex-col gap-4">
          {sidebarItems.map((item) => (
            <Button
              key={item.key}
              variant={activeTab === item.key ? "solid" : "bordered"}
              color={activeTab === item.key ? "primary" : "default"}
              startContent={item.icon}
              className="w-full justify-start h-auto p-4"
              onPress={() => onTabNavigate?.(item.key)}
            >
              <div className="flex flex-col items-start">
                <div className="font-medium">{t(item.label)}</div>
                <div className="text-xs opacity-80">{t(item.description)}</div>
              </div>
            </Button>
          ))}
        </div>

        <Divider className="my-6" />

        <div className="space-y-2">
          {bottomPanel}

          {/* Logout */}
          <Button
            variant="light"
            color="danger"
            startContent={<LogOut className="w-4 h-4" />}
            className="w-full justify-start"
            onPress={onLogout}
          >
            {t("Log Out")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
