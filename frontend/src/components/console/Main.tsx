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
import { Cog, CreditCard, DollarSign, Home, Settings, Users } from "lucide-react";

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
                "system-settings",
            ].includes(tabFromUrl)
        ) {
            return tabFromUrl;
        }
        return "console";
    };

    const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);
    const sidebarItems: SidebarItem[] = [
        {
            key: "console",
            icon: <Home className="w-5 h-5" />,
            label: t("Dashboard"),
            description: t("Overview and analytics"),
        },
        {
            key: "mcp-services",
            icon: <Settings className="w-5 h-5" />,
            label: t("MCP Services"),
            description: t("Manage MCP services and API tools"),
        },
        {
            key: "user-management",
            icon: <Users className="w-5 h-5" />,
            label: t("User Management"),
            description: t("Manage registered users"),
        },
        {
            key: "revenue-management",
            icon: <DollarSign className="w-5 h-5" />,
            label: t("Revenue Management"),
            description: t("View user recharge history"),
        },
        {
            key: "payment-channels",
            icon: <CreditCard className="w-5 h-5" />,
            label: t("Payment Channels"),
            description: t("Configure payment channels"),
        },
        {
            key: "system-settings",
            icon: <Cog className="w-5 h-5" />,
            label: t("System Settings"),
            description: t("Platform basic configuration"),
        },
    ];


    // If admin is not logged in, redirect to admin login page
    useEffect(() => {
        if (!admin_token) {
            router.push("/admin-signin");
        }
    }, [admin_token, router]);

    const handleTabNavigate = (tab: TabKey) => {
        setActiveTab(tab);
        // update url params
        if (tab === "console") {
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
            case "mcp-services":
                return <MCPServicesManagement />;
            case "user-management":
                return (
                    <div className="h-full overflow-auto">
                        <UserManagement />
                    </div>
                );
            case "revenue-management":
                return (
                    <div className="h-full overflow-auto">
                        <RevenueManagement />
                    </div>
                );
            case "payment-channels":
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
