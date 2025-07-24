"use client";

import React, { useState } from "react";
import { PlatformConfigForm } from "@/components/system-setting/PlatformConfigForm";
import { AdminConfigForm } from "@/components/system-setting/AdminConfigForm";
import { EmailConfigForm } from "@/components/system-setting/EmailConfigForm";
import { useSystemConfigManagement } from "@/hooks/useSystemConfigManagement";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Theme } from "@/shared/types/system";
import i18n from "@/shared/lib/i18n";

export const SystemSettingsContent: React.FC = () => {
  const { updateClientConfig } = usePlatformConfig();
  const [isAboutLoading, setIsAboutLoading] = useState(false);

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

  return (
    <div className="space-y-6 w-full">
      {/* platform config */}
      <PlatformConfigForm
        config={platformConfig}
        onSave={handleSavePlatformConfig}
        onThemeChange={handleThemeChange}
        onAboutSave={handleAboutSave}
        isLoading={platformLoading}
        isAboutLoading={isAboutLoading}
        onImageUpload={uploadImage}
      />

      {/* admin config */}
      <AdminConfigForm
        config={adminConfig}
        onSave={handleSaveAdminConfig}
        isLoading={adminLoading}
      />

      {/* email config */}
      <EmailConfigForm
        config={emailConfig}
        onSave={handleSaveEmailConfig}
        isLoading={emailLoading}
      />
    </div>
  );
};

export default SystemSettingsContent;
