"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAdminStore } from "@/store/admin";
import DashboardSidebar from "@/shared/components/DashboardSidebar";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import ConsoleStats from "@/components/console/ConsoleStats";
import PaymentChannelsContent from "@/components/console/PaymentChannelsContent";
import SystemSettingsContent from "@/components/console/SystemSettingsContent";
import { SidebarItem, TabKey } from "@/shared/types/dashboard";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import { MCPServicesManagement } from "@/components/mcp-services/MCPServicesManagement";
import UserManagement from "@/components/user-management/UserManagement";
import RevenueManagement from "@/components/revenue-management/RevenueManagement";
import {
  Cog,
  CreditCard,
  DollarSign,
  Home,
  Settings,
  Users,
  LogIn,
} from "lucide-react";
import { LoginSettingsContent } from "@/components/console/LoginSettingsContent";
import { Button } from "@nextui-org/react";
import { FaDiscord } from "react-icons/fa";

const ConsoleContent: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [admin_token] = useAdminStore((state) => [state.admin_token]);

  const getInitialTab = (): TabKey => {
    const tabFromUrl = searchParams.get("tab") as TabKey;
    if (
      tabFromUrl &&
      [
        "mcp-services",
        "user-management",
        "revenue-management",
        "payment-channels",
        "login-settings",
        "system-settings",
      ].includes(tabFromUrl)
    ) {
      return tabFromUrl;
    }
    return TabKey.CONSOLE;
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);
  const sidebarItems: SidebarItem[] = [
    {
      key: TabKey.CONSOLE,
      icon: <Home className="w-5 h-5" />,
      label: t("Dashboard"),
      description: t("Overview and analytics"),
    },
    {
      key: TabKey.MCP_SERVICES,
      icon: <Settings className="w-5 h-5" />,
      label: t("MCP Services"),
      description: t("Manage MCP services and API tools"),
    },
    {
      key: TabKey.USER_MANAGEMENT,
      icon: <Users className="w-5 h-5" />,
      label: t("User Management"),
      description: t("Manage registered users"),
    },
    {
      key: TabKey.REVENUE_MANAGEMENT,
      icon: <DollarSign className="w-5 h-5" />,
      label: t("Revenue Management"),
      description: t("View user recharge history"),
    },
    {
      key: TabKey.PAYMENT_CHANNELS,
      icon: <CreditCard className="w-5 h-5" />,
      label: t("Payment Channels"),
      description: t("Configure payment channels"),
    },
    {
      key: TabKey.LOGIN_SETTINGS,
      icon: <LogIn className="w-5 h-5" />,
      label: t("Login Settings"),
      description: t("Configure authentication methods"),
    },
    {
      key: TabKey.SYSTEM_SETTINGS,
      icon: <Cog className="w-5 h-5" />,
      label: t("System Settings"),
      description: t("Platform basic configuration"),
    },
  ];

  // If admin is not logged in, redirect to admin login page
  useEffect(() => {
    if (!admin_token) {
      router.push("/admin");
    }
  }, [admin_token, router]);

  const handleTabNavigate = (tab: TabKey) => {
    setActiveTab(tab);
    // update url params
    if (tab === TabKey.CONSOLE) {
      // when switch to dashboard, clear all query params, only keep base path
      router.push("/console", { scroll: false });
    } else {
      // other tabs set corresponding tab params
      const params = new URLSearchParams();
      params.set("tab", tab);
      router.push(`/console?${params.toString()}`, { scroll: false });
    }
  };

  const { adminLogout } = useAdminLogin();

  const handleLogout = () => {
    // use admin logout method
    adminLogout();
  };

  // render different content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case TabKey.MCP_SERVICES:
        return <MCPServicesManagement />;
      case TabKey.USER_MANAGEMENT:
        return (
          <div className="h-full overflow-auto">
            <UserManagement />
          </div>
        );
      case TabKey.REVENUE_MANAGEMENT:
        return (
          <div className="h-full overflow-auto">
            <RevenueManagement />
          </div>
        );
      case TabKey.PAYMENT_CHANNELS:
        return (
          <DashboardDemoContent
            title={t("Payment Channels")}
            description={t("Configure payment channels")}
          >
            <PaymentChannelsContent />
          </DashboardDemoContent>
        );
      case "login-settings":
        return (
          <DashboardDemoContent
            title={t("Login Settings")}
            description={t("Configure authentication methods")}
          >
            <LoginSettingsContent onTabNavigate={handleTabNavigate} />
          </DashboardDemoContent>
        );
      case "system-settings":
        return (
          <DashboardDemoContent
            title={t("System Settings")}
            description={t("Platform basic configuration")}
          >
            <SystemSettingsContent />
          </DashboardDemoContent>
        );
      default:
        return (
          <DashboardDemoContent
            title={t("Admin Dashboard")}
            description={t("Platform management and analytics")}
          >
            <ConsoleStats />
          </DashboardDemoContent>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          onTabNavigate={handleTabNavigate}
          onLogout={handleLogout}
          sidebarItems={sidebarItems}
          bottomPanel={
            <Button
              variant="light"
              startContent={<FaDiscord className="w-5 h-5" />}
              className="w-full justify-start h-auto p-3"
              onPress={() => {
                window.open("https://discord.gg/cyZfcdCXkW", "_blank");
              }}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-medium">{t("Discord")}</span>
              </div>
            </Button>
          }
        />

        {/* Main Content */}
        <div className="flex-1 h-screen overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
};

const ConsoleMain: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          {t("Loading...")}
        </div>
      }
    >
      <ConsoleContent />
    </Suspense>
  );
};

export default ConsoleMain;
