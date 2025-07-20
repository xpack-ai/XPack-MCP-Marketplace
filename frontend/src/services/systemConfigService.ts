import { fetchAdminAPI } from "@/rpc/admin-api";
import i18n from "@/shared/lib/i18n";
import { GoogleAuthConfig, PlatformConfig } from "@/shared/types/system";
import { AdminConfig, EmailConfig, SystemConfigApiData } from "@/types/system";
import toast from "react-hot-toast";

export class SystemConfigService {
  // get system config
  async getSystemConfig(): Promise<SystemConfigApiData> {
    const response = await fetchAdminAPI<SystemConfigApiData>(
      "/api/sysconfig/info",
      {
        method: "GET",
      }
    );

    if (!response.success) {
      throw new Error(
        response.error_message || "Failed to fetch system config"
      );
    }
    return response.data;
  }

  // update system config
  async updateSystemConfig(config: {
    platform?: PlatformConfig;
    account?: AdminConfig;
    email?: EmailConfig;
    login?: {
      google?: GoogleAuthConfig;
    };
  }): Promise<boolean> {
    const response = await fetchAdminAPI("/api/sysconfig/info", {
      method: "PUT",
      body: config as unknown as BodyInit,
    });

    if (!response.success) {
      toast.error(
        response.error_message || i18n.t("Failed to update system config")
      );
      return false;
    }
    toast.success(i18n.t("System config updated successfully"));
    return true;
  }
}

export const systemConfigService = new SystemConfigService();
