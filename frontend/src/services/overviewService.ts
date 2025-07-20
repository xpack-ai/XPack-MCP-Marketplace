import { fetchAdminAPI } from "@/rpc/admin-api";
import { PlatformOverviewData } from "@/types/dashboard";

export class OverviewService {
  // get platform overview data
  async getPlatformOverview(): Promise<PlatformOverviewData> {
    const response = await fetchAdminAPI<PlatformOverviewData>(
      "/api/overview/platform",
      {
        method: "GET",
      }
    );

    if (!response.success) {
      throw new Error(
        response.error_message || "Failed to fetch platform overview"
      );
    }
    return response.data;
  }
}

export const overviewService = new OverviewService();
