"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FaqSettings } from "./FaqSettings";
import { TopNavigationSettings } from "./TopNavigationSettings";
import { EmbeddedHtmlSettings } from "./EmbeddedHtmlSettings";
import { useHomepageConfigManagement } from "@/hooks/useHomepageConfigManagement";

interface HomepageSettingsProps {
  // 预留接口，后续扩展
}

export const HomepageSettings: React.FC<HomepageSettingsProps> = () => {
  const { t } = useTranslation();
  const {
    homepageConfig,
    error,
    saveFaqConfig,
    saveNavigationConfig,
    saveEmbeddedHtmlConfig,
  } = useHomepageConfigManagement();

  // 显示错误提示
  useEffect(() => {
    if (error) {
      toast.error(t("Failed to load homepage config"));
    }
  }, [error, t]);

  return (
    <div className="space-y-4">
      {/* FAQ Management */}
      <FaqSettings onSave={saveFaqConfig} config={homepageConfig.faq} />

      {/* Top Navigation */}
      <TopNavigationSettings
        onSave={saveNavigationConfig}
        config={homepageConfig.top_navigation}
      />

      {/* Embedded HTML */}
      <EmbeddedHtmlSettings
        onSave={saveEmbeddedHtmlConfig}
        config={homepageConfig.embeded_html}
      />
    </div>
  );
};
