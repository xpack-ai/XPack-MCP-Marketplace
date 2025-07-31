"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAdminStore } from "@/store/admin";
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
  CreditCard,
  DollarSign,
  Home,
  Settings,
  Users,
  ServerIcon,
} from "lucide-react";
import ConsoleSidebar from "./Sidebar";

const ConsoleContent: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [admin_token] = useAdminStore((state) => [state.admin_token]);

  const _DefaultSubTab = "general";

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

  const getInitialSubTab = (): string | undefined => {
    const subTabFromUrl = searchParams.get("subtab");
    return subTabFromUrl || _DefaultSubTab;
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);
  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(
    getInitialSubTab
  );
  const sidebarItems: SidebarItem[] = [
    {
      key: TabKey.CONSOLE,
      icon: <Home size={18} />,
      label: t("Dashboard"),
      description: t("Overview and analytics"),
    },
    {
      key: TabKey.MCP_SERVICES,
      icon: <ServerIcon size={18} />,
      label: t("MCP Services"),
      description: t("Manage MCP services and API tools"),
    },
    {
      key: TabKey.USER_MANAGEMENT,
      icon: <Users size={18} />,
      label: t("User Management"),
      description: t("Manage registered users"),
    },
    {
      key: TabKey.REVENUE_MANAGEMENT,
      icon: <DollarSign size={18} />,
      label: t("Revenue Management"),
      description: t("View user recharge history"),
    },
    {
      key: TabKey.PAYMENT_CHANNELS,
      icon: <CreditCard size={18} />,
      label: t("Payment Channels"),
      description: t("Configure payment channels"),
    },
    {
      key: TabKey.SYSTEM_SETTINGS,
      icon: <Settings size={18} />,
      label: t("System Settings"),
      description: t("Platform basic configuration"),
      // Sub-menu items for System Settings
      subItems: [
        {
          key: "general",
          label: "General",
          description: "Platform basic configuration",
        },
        {
          key: "login-settings",
          label: "Login Settings",
          description: "Configure authentication methods",
        },
        {
          key: "homepage",
          label: "Homepage",
          description: "Homepage content and theme settings",
        },
        {
          key: "about-page",
          label: "About Page",
          description: "About page content configuration",
        },
        {
          key: "email-admin",
          label: "Email & Admin",
          description: "Email and administrator settings",
        },
      ],
    },
  ];

  // If admin is not logged in, redirect to admin login page
  useEffect(() => {
    if (!admin_token) {
      router.push("/admin");
    }
  }, [admin_token, router]);

  const handleTabNavigate = (tab: TabKey, subTab?: string) => {
    setActiveTab(tab);
    setActiveSubTab(subTab || _DefaultSubTab);

    // update url params
    if (tab === TabKey.CONSOLE) {
      // when switch to dashboard, clear all query params, only keep base path
      router.push("/console", { scroll: false });
    } else {
      // other tabs set corresponding tab params
      const params = new URLSearchParams();
      params.set("tab", tab);

      // add subtab parameter if provided
      if (subTab) {
        params.set("subtab", subTab);
      }

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
      case "system-settings":
        return (
          <SystemSettingsContent
            activeSubTab={activeSubTab}
            subTab={sidebarItems
              .find((item) => item.key === activeTab)
              ?.subItems?.find((item) => item.key === activeSubTab)}
            onTabNavigate={handleTabNavigate}
          />
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
        <ConsoleSidebar
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onTabNavigate={handleTabNavigate}
          onLogout={handleLogout}
          sidebarItems={sidebarItems}
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
