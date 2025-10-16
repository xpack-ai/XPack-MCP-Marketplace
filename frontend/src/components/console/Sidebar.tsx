"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Button, Divider, Tooltip } from "@nextui-org/react";
import { ExternalLinkIcon, LogOut, Settings } from "lucide-react";
import { DashboardSidebarProps } from "@/shared/types/dashboard";
import { DynamicLogo } from "@/shared/components/DynamicLogo";
import { FaDiscord } from "react-icons/fa";
import Link from "next/link";

interface ConsoleSidebarProps extends DashboardSidebarProps {
  onSettingsClick?: () => void;
}

const ConsoleSidebar: React.FC<ConsoleSidebarProps> = ({
  activeTab,
  onTabNavigate,
  onLogout,
  sidebarItems,
  onSettingsClick,
}) => {
  const { t } = useTranslation();

  // Filter out system settings from sidebar items
  const filteredSidebarItems = sidebarItems.filter(
    (item) => item.key !== "system-settings"
  );

  return (
    <>
      <div className="flex h-screen">
        {/* Main Sidebar */}
        <div className="py-2 px-4 w-[300px] overflow-hidden border-r border-divider flex flex-col justify-between bg-default-50">
          {/* Header */}
          <div className="mb-6 mt-4 flex gap-2 justify-between items-center">
            <Link href="/" prefetch target="_blank">
              <DynamicLogo
                alt="Platform Logo"
                className="max-w-full h-[32px] object-contain"
              />
            </Link>
            <Tooltip content={t("Open in new tab")} closeDelay={0} disableAnimation>
              <Link
                href="/"
                prefetch
                target="_blank"
                className="hover:text-primary"
              >
                <ExternalLinkIcon size={18} />
              </Link>
            </Tooltip>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2 flex-1">
            {filteredSidebarItems.map((item) => (
              <Button
                key={item.key}
                variant={activeTab === item.key ? "flat" : "light"}
                color={activeTab === item.key ? "primary" : "default"}
                startContent={item.icon}
                className="w-full h-auto p-4 justify-start"
                onPress={() => onTabNavigate?.(item.key)}
              >
                {t(item.label)}
              </Button>
            ))}
          </div>

          <div>
            <Divider className="my-2" />

            <div className="space-y-2">
              <Button
                variant="light"
                startContent={<FaDiscord size={18} />}
                className="w-full h-auto p-4 justify-start"
                onPress={() => {
                  window.open("https://discord.gg/cyZfcdCXkW", "_blank");
                }}
              >
                {t("Discord")}
              </Button>

              {/* Settings */}
              <Button
                variant="light"
                startContent={<Settings size={18} />}
                className="w-full h-auto p-4 justify-start"
                onPress={onSettingsClick}
              >
                {t("Settings")}
              </Button>

              {/* Logout */}
              <Button
                variant="light"
                color="danger"
                startContent={<LogOut size={18} />}
                className="w-full h-auto p-4 justify-start"
                onPress={onLogout}
              >
                {t("Log Out")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConsoleSidebar;
