"use client";

import React from "react";
import { EmailConfigForm } from "@/components/login-setting/EmailConfigForm";
import { GoogleAuthConfigForm } from "@/components/login-setting/GoogleAuthConfigForm";
import { useSystemConfigManagement } from "@/hooks/useSystemConfigManagement";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { LoginConfig, GoogleAuthConfig } from "@/shared/types/system";
import { TabKey } from "@/shared/types/dashboard";
import { useTranslation } from "@/shared/lib/useTranslation";
import { toast } from "react-hot-toast";

interface LoginSettingsContentProps {
  onTabNavigate?: (tab: TabKey) => void;
}

export const LoginSettingsContent: React.FC<LoginSettingsContentProps> = ({
  onTabNavigate,
}) => {
  const { t } = useTranslation();
  const { updateClientConfig } = usePlatformConfig();

  const {
    // login config
    loginConfig,
    loginLoading,
    saveLoginConfig,

    // email config
    emailConfig,

    // platform config
    platformConfig,
  } = useSystemConfigManagement();

  // 验证至少有一种登录方式启用
  const validateLoginMethods = (config: LoginConfig): boolean => {
    const isGoogleEnabled =
      config.google?.is_enabled && config.google?.client_id;
    const isEmailEnabled = config.email?.is_enabled;

    const enabledCount = [isGoogleEnabled, isEmailEnabled].filter(
      Boolean
    ).length;

    if (enabledCount === 0) {
      toast.error(t("At least one login method must be enabled"));
      return false;
    }

    return true;
  };

  // save login config
  const handleSaveLoginConfig = async (config: LoginConfig) => {
    if (!validateLoginMethods(config)) {
      return;
    }

    const result = await saveLoginConfig(config);
    if (!result) return;
    updateClientConfig({
      platform: platformConfig,
      login: config,
    });
  };

  // save google auth config
  const handleSaveGoogleAuthConfig = async (config: GoogleAuthConfig) => {
    const updatedLoginConfig = {
      ...loginConfig,
      google: config,
    };

    if (!validateLoginMethods(updatedLoginConfig)) {
      return;
    }

    const result = await saveLoginConfig(updatedLoginConfig);
    if (!result) return;
    updateClientConfig({
      platform: platformConfig,
      login: updatedLoginConfig,
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* email config */}
      <EmailConfigForm
        config={loginConfig}
        emailConfig={emailConfig}
        onSave={handleSaveLoginConfig}
        isLoading={loginLoading}
        onTabNavigate={onTabNavigate}
      />

      {/* google auth config */}
      <GoogleAuthConfigForm
        config={loginConfig.google}
        onSave={handleSaveGoogleAuthConfig}
        isLoading={loginLoading}
      />
    </div>
  );
};
