"use client";

import { useTranslation as useI18nTranslation } from "@/shared/lib/useTranslation";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";

export const useTranslationWithPlatform = () => {
  const { t: originalT, ...rest } = useI18nTranslation();
  const { platformConfig } = usePlatformConfig();

  const t = (key: string, options?: any) => {
    const mergedOptions = {
      platformName: platformConfig.name || "XPack",
      ...options,
    };
    return originalT(key, mergedOptions);
  };

  return { t, ...rest };
};
