"use client";

import React, { useState } from "react";
import { EmailConfigForm } from "@/components/login-setting/EmailConfigForm";
import { GoogleAuthConfigForm } from "@/components/login-setting/GoogleAuthConfigForm";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { LoginConfig, GoogleAuthConfig } from "@/shared/types/system";
import { TabKey } from "@/shared/types/dashboard";
import { useTranslation } from "@/shared/lib/useTranslation";
import { toast } from "react-hot-toast";
import { EmailConfig } from "@/types/system";

interface LoginSettingsContentProps {
  onTabNavigate?: (tab: TabKey) => void;
  loginConfig: LoginConfig;
  saveLoginConfig: (config: LoginConfig) => Promise<boolean>;
  emailConfig: EmailConfig;
  type?: "email" | "google";
}

export const LoginSettingsContent: React.FC<LoginSettingsContentProps> = ({
  onTabNavigate,
  loginConfig,
  saveLoginConfig,
  emailConfig,
  type = "email",
}) => {
  const [googleSubmitLoading, setGoogleSubmitLoading] = useState(false);
  const [emailSubmitLoading, setEmailSubmitLoading] = useState(false);
  const { t } = useTranslation();
  const { updateClientConfig } = usePlatformConfig();

  // check if at least one login method is enabled
  const validateLoginMethods = (config: LoginConfig): boolean => {
    const isGoogleEnabled = config.google?.is_enabled;
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

    setEmailSubmitLoading(true);
    const result = await saveLoginConfig(config);
    if (!result) return;
    updateClientConfig({
      login: config,
    });
    setEmailSubmitLoading(false);
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

    setGoogleSubmitLoading(true);
    const result = await saveLoginConfig(updatedLoginConfig);
    if (!result) return;
    updateClientConfig({
      login: updatedLoginConfig,
    });
    setGoogleSubmitLoading(false);
  };

  return (
    <div className="space-y-4 w-full">
      {/* email config */}
      {type === "email" && (
        <EmailConfigForm
          config={loginConfig}
          emailConfig={emailConfig}
          onSave={handleSaveLoginConfig}
          isLoading={emailSubmitLoading}
          onTabNavigate={onTabNavigate}
        />
      )}

      {/* google auth config */}
      {type === "google" && (
        <GoogleAuthConfigForm
          config={loginConfig.google}
          onSave={handleSaveGoogleAuthConfig}
          isLoading={googleSubmitLoading}
        />
      )}
    </div>
  );
};
