"use client";

import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { i18nPromise } from "@/shared/lib/i18n";

interface ClientI18nProviderProps {
  children: React.ReactNode;
}

export const ClientI18nProvider: React.FC<ClientI18nProviderProps> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initAll = async () => {
    if (!i18n.isInitialized) {
      await i18nPromise;
      const storedLang = localStorage.getItem("i18nextLng");
      // only switch when the stored language is different from the current language
      if (storedLang && storedLang !== i18n.language) {
        await i18n.changeLanguage(storedLang);
      }
    }
    setIsInitialized(true);
  };
  useEffect(() => {
    initAll();
  }, []);

  return (
    <div
      style={{
        opacity: isInitialized ? 1 : 0,
        transition: "opacity 0.2s ease-in-out",
      }}
    >
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </div>
  );
};
