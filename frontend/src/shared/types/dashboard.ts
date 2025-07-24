export enum TabKey {
  CONSOLE = "console",
  MCP_SERVICES = "mcp-services",
  USER_MANAGEMENT = "user-management",
  REVENUE_MANAGEMENT = "revenue-management",
  PAYMENT_CHANNELS = "payment-channels",
  LOGIN_SETTINGS = "login-settings",
  SYSTEM_SETTINGS = "system-settings",
  OVERVIEW = "overview",
  WALLET = "wallet",
  ACCOUNT = "account",
}

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
  bottomPanel?: React.ReactNode;
  sidebarItems: SidebarItem[];
  userProfilePanel?: React.ReactNode;
}
