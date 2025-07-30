"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Button, Divider, Link, Tooltip } from "@nextui-org/react";
import { LogOut } from "lucide-react";
import { DashboardSidebarProps } from "@/shared/types/dashboard";
import { DynamicLogo } from "@/shared/components/DynamicLogo";
import { FaDiscord } from "react-icons/fa";

const ConsoleSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  activeSubTab,
  onTabNavigate,
  onLogout,
  sidebarItems,
}) => {
  const { t } = useTranslation();

  const handleSubItemClick = (parentKey: string, subKey: string) => {
    onTabNavigate?.(parentKey as any, subKey);
  };

  return (
    <div className="flex h-screen">
      {/* Main Sidebar */}
      <div className="py-2 px-2 w-[70px] overflow-hidden border-r border-divider flex flex-col justify-between">
        {/* Header */}
        <div className="mb-6 mt-4 flex flex-col items-center gap-2">
          <Link href={process.env.NEXT_PUBLIC_DOMAIN || "/"}>
            <DynamicLogo
              alt="Platform Logo"
              className="max-w-full h-auto max-h-[30px]"
            />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2 flex-1">
          {sidebarItems.map((item) => (
            <React.Fragment key={item.key}>
              <Tooltip
                content={t(item.label)}
                closeDelay={0}
                disableAnimation
                placement="right"
              >
                <Button
                  key={item.key}
                  variant={activeTab === item.key ? "flat" : "light"}
                  color={activeTab === item.key ? "primary" : "default"}
                  startContent={item.icon}
                  className="w-full h-auto p-4"
                  onPress={() => onTabNavigate?.(item.key)}
                  isIconOnly
                ></Button>
              </Tooltip>
            </React.Fragment>
          ))}
        </div>

        <div>
          <Divider className="my-2" />

          <div className="space-y-2">
            <Tooltip
              content={t("Discord")}
              closeDelay={0}
              disableAnimation
              placement="right"
            >
              <Button
                variant="light"
                startContent={<FaDiscord size={18} />}
                className="w-full h-auto p-4"
                onPress={() => {
                  window.open("https://discord.gg/cyZfcdCXkW", "_blank");
                }}
                isIconOnly
              ></Button>
            </Tooltip>

            {/* Logout */}
            <Tooltip
              content={t("Log Out")}
              closeDelay={0}
              disableAnimation
              placement="right"
            >
              <Button
                variant="light"
                color="danger"
                startContent={<LogOut size={18} />}
                className="w-full h-auto p-4"
                onPress={onLogout}
                isIconOnly
              ></Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Sub Menu Panel */}
      {(() => {
        const activeItem = sidebarItems.find((item) => item.key === activeTab);
        if (!activeItem?.subItems?.length) return null;

        return (
          <div className="relative bg-content2/50 border-r overflow-hidden w-[240px] p-3">
            <div className="mb-3 pb-2 border-b">
              <h4 className="font-medium text-sm text-default-700">
                {t(activeItem.label)}
              </h4>
              <p className="text-xs text-default-500 mt-1">
                {t(activeItem.description)}
              </p>
            </div>

            <div className="space-y-1">
              {activeItem.subItems?.map((subItem) => {
                const isSubActive = activeSubTab === subItem.key;

                return (
                  <React.Fragment key={subItem.key}>
                    <Button
                      key={subItem.key}
                      variant={isSubActive ? "flat" : "light"}
                      color={isSubActive ? "primary" : "default"}
                      size="sm"
                      className={`w-full justify-start h-auto p-2 text-left ${
                        isSubActive
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-default-100"
                      }`}
                      onPress={() =>
                        handleSubItemClick(activeItem.key, subItem.key)
                      }
                    >
                      <div className="flex flex-col items-start w-full">
                        <div className="font-medium text-xs">
                          {t(subItem.label)}
                        </div>
                        {subItem.description && (
                          <div className="text-xs opacity-60 mt-0.5 truncate w-full">
                            {t(subItem.description)}
                          </div>
                        )}
                      </div>
                    </Button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ConsoleSidebar;
