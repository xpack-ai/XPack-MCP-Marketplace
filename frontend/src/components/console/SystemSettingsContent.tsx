"use client";

import React, { useState } from "react";
import { HomepageSettings } from "@/components/system-setting/HomepageSettings";
import { AboutPageSettings } from "@/components/system-setting/AboutPageSettings";
import { EmailAndAdminSettings } from "@/components/system-setting/EmailAndAdminSettings";
import { useSystemConfigManagement } from "@/hooks/useSystemConfigManagement";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Theme } from "@/shared/types/system";
import i18n from "@/shared/lib/i18n";
import { PlatformConfigForm } from "../system-setting/PlatformConfigForm";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import { useTranslation } from "@/shared/lib/useTranslation";
import { SidebarSubItem, TabKey } from "@/shared/types/dashboard";
import { LoginSettingsContent } from "./LoginSettingsContent";

interface SystemSettingsContentProps {
  activeSubTab?: string;
  subTab?: SidebarSubItem;
  onTabNavigate: (tab: TabKey, subTab?: string) => void;
}

export const SystemSettingsContent: React.FC<SystemSettingsContentProps> = ({
  activeSubTab,
  subTab,
  onTabNavigate,
}) => {
  const { updateClientConfig } = usePlatformConfig();
  const [isAboutLoading, setIsAboutLoading] = useState(false);
  const { t } = useTranslation();
  const {
    // platform config
    platformConfig,
    platformLoading,
    savePlatformConfig,

    // admin config
    adminConfig,
    adminLoading,
    saveAdminConfig,

    // email config
    emailConfig,
    emailLoading,
    saveEmailConfig,

    // image upload
    uploadImage,

    // login config
    loginConfig,
    saveLoginConfig,
  } = useSystemConfigManagement();

  // save admin config
  const handleSaveAdminConfig = async (config: typeof adminConfig) => {
    await saveAdminConfig(config);
  };

  // save email config
  const handleSaveEmailConfig = async (config: typeof emailConfig) => {
    await saveEmailConfig(config);
  };

  // save platform config
  const handleSavePlatformConfig = async (config: typeof platformConfig) => {
    const result = await savePlatformConfig(config);
    if (!result) return;
    updateClientConfig({
      platform: config,
    });
    if (config.language !== i18n.language) {
      i18n.changeLanguage(config.language);
    }
  };

  // handle theme change
  const handleThemeChange = async (theme: Theme) => {
    const updatedConfig = { ...platformConfig, theme };
    const result = await savePlatformConfig(updatedConfig, "theme");
    if (!result) return;
    updateClientConfig({
      platform: updatedConfig,
    });
  };

  // handle about save
  const handleAboutSave = async (aboutContent: string) => {
    setIsAboutLoading(true);
    const updatedConfig = { ...platformConfig, about_page: aboutContent };
    const result = await savePlatformConfig(updatedConfig, "about");
    setIsAboutLoading(false);
    if (!result) return;
    updateClientConfig({
      platform: updatedConfig,
    });
  };

  // Render content based on active sub tab
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "homepage":
        return <HomepageSettings />;
      case "about-page":
        return (
          <AboutPageSettings
            config={platformConfig}
            onAboutSave={handleAboutSave}
            onImageUpload={uploadImage}
            isAboutLoading={isAboutLoading}
          />
        );
      case "email-admin":
        return (
          <EmailAndAdminSettings
            emailConfig={emailConfig}
            adminConfig={adminConfig}
            onSaveEmailConfig={handleSaveEmailConfig}
            onSaveAdminConfig={handleSaveAdminConfig}
            isLoading={emailLoading}
            isAdminLoading={adminLoading}
          />
        );
      case "login-settings":
        return (
          <LoginSettingsContent
            onTabNavigate={onTabNavigate}
            loginConfig={loginConfig}
            saveLoginConfig={saveLoginConfig}
            emailConfig={emailConfig}
          />
        );
      case "general":
      default:
        return (
          <PlatformConfigForm
            config={platformConfig}
            onSave={handleSavePlatformConfig}
            onThemeChange={handleThemeChange}
            isLoading={platformLoading}
          />
        );
    }
  };

  return (
    <DashboardDemoContent
      title={t(subTab?.label || "System Settings")}
      description={t(subTab?.description || "Platform basic configuration")}
    >
      {renderSubTabContent()}
    </DashboardDemoContent>
  );
};

export default SystemSettingsContent;
