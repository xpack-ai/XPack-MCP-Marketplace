"use client";

import { useTranslation as useI18nextTranslation } from "react-i18next";

/**
 * Enhanced useTranslation hook that supports custom project translations
 * This hook provides access to both base translations and project-specific custom translations
 */
export const useTranslation = (namespace?: string) => {
  const { t: baseT, i18n, ready, ...rest } = useI18nextTranslation(namespace);

  /**
   * Enhanced translation function that supports custom translations
   * @param key - Translation key
   * @param options - Translation options
   * @returns Translated string
   */
  const translate = (key: string, options?: any): string => {
    // First try the specified namespace or default namespace
    const result = baseT(key, options);
    
    // If translation is not found (returns the key), try custom namespace
    if (result === key) {
      const customResult = baseT(`custom:${key}`, options);
      if (customResult !== `custom:${key}`) {
        return typeof customResult === "string" ? customResult : key;
      }
    }
    
    return typeof result === "string" ? result : key;
  };

  /**
   * Translation function specifically for custom namespace
   * @param key - Translation key
   * @param options - Translation options
   * @returns Translated string from custom namespace
   */
  const translateCustom = (key: string, options?: any): string => {
    const result = baseT(`custom:${key}`, options);
    return typeof result === "string" ? result : key;
  };

  return {
    t: translate,
    tc: translateCustom, // custom translation function
    i18n,
    ready,
    ...rest,
  };
};
