import { useState, useCallback, useEffect } from "react";
import { HomepageConfig } from "@/services/homepageConfigService";
import {
  FaqItem,
  TopNavigationItem,
  EmbeddedHtmlConfig,
} from "@/shared/types/system";
import { homepageConfigService } from "@/services/homepageConfigService";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { revalidatePlatformConfig } from "@/app/actions/revalidate";

export const useHomepageConfigManagement = () => {
  const { updateClientConfig } = usePlatformConfig();

  // homepage config state
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>({
    faq: [],
    top_navigation: [],
    embeded_html: {
      is_enabled: false,
      html: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load homepage config
  const loadHomepageConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await homepageConfigService.getHomepageConfig();
      setHomepageConfig(config);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load homepage config";
      setError(errorMessage);
      console.error("Failed to load homepage config:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // save homepage config
  const saveHomepageConfig = useCallback(
    async (config: {
      faq?: FaqItem[];
      top_navigation?: TopNavigationItem[];
      embeded_html?: EmbeddedHtmlConfig;
    }): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const result = await homepageConfigService.updateHomepageConfig(config);
        if (result) {
          updateClientConfig(config);
          await revalidatePlatformConfig();
        }
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save homepage config";
        setError(errorMessage);
        console.error("Failed to save homepage config:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // save FAQ data
  const saveFaqConfig = useCallback(
    async (faqs: FaqItem[]): Promise<boolean> => {
      return await saveHomepageConfig({ faq: faqs });
    },
    [saveHomepageConfig]
  );

  // save navigation data
  const saveNavigationConfig = useCallback(
    async (navigationItems: TopNavigationItem[]): Promise<boolean> => {
      return await saveHomepageConfig({ top_navigation: navigationItems });
    },
    [saveHomepageConfig]
  );

  // save embedded HTML data
  const saveEmbeddedHtmlConfig = useCallback(
    async (htmlData: EmbeddedHtmlConfig): Promise<boolean> => {
      return await saveHomepageConfig({ embeded_html: htmlData });
    },
    [saveHomepageConfig]
  );

  // clear error
  const clearError = useCallback(() => setError(null), []);

  // load config on init
  useEffect(() => {
    loadHomepageConfig();
  }, [loadHomepageConfig]);

  return {
    // state
    homepageConfig,
    loading,
    error,

    // actions
    loadHomepageConfig,
    saveHomepageConfig,
    saveFaqConfig,
    saveNavigationConfig,
    saveEmbeddedHtmlConfig,
    clearError,
  };
};
