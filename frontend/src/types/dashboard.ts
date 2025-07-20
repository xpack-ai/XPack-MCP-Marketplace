// dashboard related type definitions

// platform overview data structure (API return)
export interface PlatformOverviewData {
  total_user: number;
  total_balance: number;
  total_service: number;
  invoke_count: {
    today: number;
  };
}
