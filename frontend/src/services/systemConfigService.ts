import { fetchAdminAPI } from "@/rpc/admin-api";
import i18n from "@/shared/lib/i18n";
import {
  PlatformConfig,
  LoginConfig,
  FaqItem,
  TopNavigationItem,
  EmbeddedHtmlConfig,
  PaymentChannel,
} from "@/shared/types/system";
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
  async updateSystemConfig(
    config: {
      platform?: PlatformConfig;
      account?: AdminConfig;
      email?: EmailConfig;
      login?: LoginConfig;
      faq?: FaqItem[];
      top_navigation?: TopNavigationItem[];
      embeded_html?: EmbeddedHtmlConfig;
      payment_channels?: PaymentChannel[];
      is_installed?: boolean;
    },
    key?:
      | "theme"
      | "about"
      | "faq"
      | "navigation"
      | "embedded_html"
      | "payment"
      | "password"
  ): Promise<boolean> {
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
    switch (key) {
      case "theme":
        toast.success(i18n.t("Theme changed successfully"));
        break;
      case "about":
        toast.success(i18n.t("About page saved successfully"));
        break;
      case "faq":
        toast.success(i18n.t("FAQ updated successfully"));
        break;
      case "navigation":
        toast.success(i18n.t("Navigation updated successfully"));
        break;
      case "embedded_html":
        toast.success(i18n.t("Embedded HTML updated successfully"));
        break;
      case "payment":
        toast.success(i18n.t("Payment channels updated successfully"));
        break;
      case "password":
        toast.success(i18n.t("Password updated successfully"));
        break;
      default: {
        toast.success(i18n.t("System config updated successfully"));
        break;
      }
    }
    return true;
  }

  // upload image
  async uploadImage(file: File, sha256?: string): Promise<string> {
    const formData = new FormData();
    formData.append("img", file);

    // add sha256 parameter for image uniqueness verification
    if (sha256) {
      formData.append("sha256", sha256);
    }

    const response = await fetchAdminAPI<{ file_path: string }>(
      "/api/upload/image",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.success) {
      toast.error(response.error_message || i18n.t("Failed to upload image"));
      throw new Error(response.error_message || "Failed to upload image");
    }
    return response.data.file_path;
  }
}

export const systemConfigService = new SystemConfigService();
