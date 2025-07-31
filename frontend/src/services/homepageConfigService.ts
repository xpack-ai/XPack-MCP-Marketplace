import { fetchAdminAPI } from "@/rpc/admin-api";
import i18n from "@/shared/lib/i18n";
import {
  EmbeddedHtmlConfig,
  FaqItem,
  TopNavigationItem,
} from "@/shared/types/system";
import toast from "react-hot-toast";

export interface HomepageConfig {
  faq: FaqItem[];
  top_navigation: TopNavigationItem[];
  embeded_html: EmbeddedHtmlConfig;
}

export class HomepageConfigService {
  // get homepage config
  async getHomepageConfig(): Promise<HomepageConfig> {
    const response = await fetchAdminAPI<HomepageConfig>(
      "/api/sysconfig/homepage",
      {
        method: "GET",
      }
    );

    if (!response.success) {
      throw new Error(
        response.error_message || "Failed to fetch homepage config"
      );
    }
    return response.data;
  }

  // update homepage config
  async updateHomepageConfig(config: {
    faq?: FaqItem[];
    top_navigation?: TopNavigationItem[];
    embeded_html?: EmbeddedHtmlConfig;
  }): Promise<boolean> {
    const response = await fetchAdminAPI("/api/sysconfig/homepage", {
      method: "PUT",
      body: config as unknown as BodyInit,
    });

    if (!response.success) {
      toast.error(
        response.error_message || i18n.t("Failed to update homepage config")
      );
      return false;
    }
    toast.success(i18n.t("Homepage config updated successfully"));
    return true;
  }
}

export const homepageConfigService = new HomepageConfigService();
