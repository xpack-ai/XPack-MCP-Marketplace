"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStore } from "@/shared/store/global";
import DashboardSidebar from "@/shared/components/DashboardSidebar";
import { SidebarItem, TabKey } from "@/shared/types/dashboard";
import { useSharedStore } from "@/shared/store/share";
import { formatCurrency } from "@/shared/utils/currency";

// Import dashboard content components
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import WalletManagement from "@/components/wallet/WalletManagement";
import UserAccountBalance from "@/components/dashboard/UserAccountBalance";
import { Home, Key, Wallet } from "lucide-react";
import { Avatar, Card, CardBody, Button, Divider, Link } from "@nextui-org/react";
import { RechargeModal } from "@/shared/components/modal/RechargeModal";
import { useTranslation } from "@/shared/lib/useTranslation";
import { ChangePasswordModal } from "@/components/common/ChangePasswordModal";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { RegisterType } from "@/shared/store/User";
import { EmailMode } from "@/shared/types/system";

const DashboardContent: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const searchParams = useSearchParams();
  const [user_token, user] = useSharedStore((state) => [
    state.user_token,
    state.user,
  ]);
  const { loginConfig, paymentChannels } = usePlatformConfig();

  const [logOut, useGetUser] = useGlobalStore((state) => [
    state.logOut,
    state.useGetUser,
  ]);
  const { data } = useGetUser();

  // Recharge modal state
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const getInitialTab = (): TabKey => {
    const tabFromUrl = searchParams.get("tab") as TabKey;
    if (tabFromUrl && [TabKey.OVERVIEW, TabKey.WALLET, TabKey.USER_ACCOUNT].includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return TabKey.OVERVIEW;
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    React.useState(false);

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleChangePasswordClose = () => {
    setIsChangePasswordModalOpen(false);
  };
  useEffect(() => {
    if (!data) return;
    if (data.code === "1000001") {
      console.warn("user not found");
      return;
    }
  }, [data]);

  // If user is not logged in, redirect to login page
  useEffect(() => {
    if (!user_token) {
      window.location.href = "/";
    }
  }, [user_token]);

  const handleLogout = () => {
    // use global store logout method
    logOut();
    window.location.href = "/";
  };

  // handle recharge with proper error handling and loading states
  const handleRecharge = async () => {
    setIsRechargeModalOpen(true);
  };

  const sidebarItems: SidebarItem[] = [
    {
      key: TabKey.OVERVIEW,
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      description: "Manage your integration and auth key",
    },
  ];

  const handleTabNavigate = (tab: TabKey | string) => {
    setActiveTab(tab as TabKey);
    // update url params
    if (tab === TabKey.OVERVIEW) {
      // when switch to dashboard, clear all query params, only keep base path
      router.push("/console", { scroll: false });
    } else {
      // other tabs set corresponding tab params
      const params = new URLSearchParams();
      params.set("tab", tab);
      router.push(`/console?${params.toString()}`, { scroll: false });
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
            loginConfig?.email?.is_enabled &&
            loginConfig?.email?.mode === EmailMode.PASSWORD &&
            user?.register_type === RegisterType.EMAIL && (
              <Button
                variant="light"
                color="default"
                startContent={<Key className="w-4 h-4" />}
                className="w-full justify-start mb-2"
                onPress={handleChangePassword}
              >
                {t("Change Password")}
              </Button>
            )
          }
          userProfilePanel={
            user && (
              <div className="mb-6 space-y-3">
                {/* User Information Card */}
                <Card className="border-1 bg-default-100" shadow="none">
                  <CardBody className="p-4 gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        isBordered
                        src={user?.avatar || ""}
                        name={user.user_name || "User"}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.user_name || "Jack Liu"}
                        </p>
                        <p className="text-tiny text-default-600">
                          {user.user_email || "dev@xpack.ai"}
                        </p>
                      </div>
                    </div>
                    <Divider />
                    <div className="flex justify-between text-xs">
                      <div className="flex gap-2 items-center">
                        <Wallet size={16} />
                        <span>
                          {t("Balance: {{amount}}", {
                            amount: "",
                          }).replace("{{amount}}", "")}
                          <Link
                            href="#"
                            className="text-xs cursor-pointer"
                            onPress={() => handleTabNavigate(TabKey.USER_ACCOUNT)}
                          >
                            {formatCurrency(user?.wallet?.balance || 0)}
                          </Link>
                        </span>
                      </div>

                      {paymentChannels.length > 0 && (
                        <Button
                          variant="bordered"
                          onPress={handleRecharge}
                          aria-label="Recharge wallet"
                          size="sm"
                        >
                          {t("Recharge")}
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>
            )
          }
        />

        {/* Main Content */}
        <div className="flex-1 h-screen overflow-y-auto">
          {activeTab === TabKey.OVERVIEW && <DashboardOverview />}
          {activeTab === TabKey.WALLET && (
            <WalletManagement onRecharge={() => setIsRechargeModalOpen(true)} />
          )}
          {activeTab === TabKey.USER_ACCOUNT && <UserAccountBalance />}
        </div>
      </div>

      {/* recharge modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
      />
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleChangePasswordClose}
      />
    </div>
  );
};

const DashboardMain: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardMain;
