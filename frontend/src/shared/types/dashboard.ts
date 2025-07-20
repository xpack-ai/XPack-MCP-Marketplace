export type TabKey =
  | "console"
  | "mcp-services"
  | "user-management"
  | "revenue-management"
  | "payment-channels"
  | "system-settings"
  | "overview"
  | "wallet"
  | "account";

export interface SidebarItem {
  key: TabKey;
  icon: React.ReactNode;
  label: string;
  description: string;
}

export interface DashboardSidebarProps {
  activeTab: TabKey;
  onTabNavigate?: (tab: TabKey) => void;
  onLogout: () => void;
  sidebarItems: SidebarItem[];
  userProfilePanel?: React.ReactNode;
}
