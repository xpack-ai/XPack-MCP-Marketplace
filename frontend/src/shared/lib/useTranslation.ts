"use client";

import { useTranslation as useI18nextTranslation } from "react-i18next";

export const useTranslation = () => {
  const { t, i18n, ready } = useI18nextTranslation();

  const translate = (key: string, options?: any): string => {
    const result = t(key, options);
    return typeof result === "string" ? result : key;
  };

  return {
    t: translate,
    i18n,
    ready,
  };
};
