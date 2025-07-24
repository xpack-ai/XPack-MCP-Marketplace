"use client";

import React, { useEffect, useState } from "react";
import {
  Switch,
  AccordionItem,
  Accordion,
  Select,
  SelectItem,
  Button,
  Alert,
  Link,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { EmailMode, LoginConfig } from "@/shared/types/system";
import { EmailConfig } from "@/types/system";
import { TabKey } from "@/shared/types/dashboard";

interface EmailConfigFormProps {
  config: LoginConfig;
  emailConfig: EmailConfig;
  onSave: (config: LoginConfig) => Promise<void>;
  isLoading?: boolean;
  onTabNavigate?: (tab: TabKey) => void;
}

export const EmailConfigForm: React.FC<EmailConfigFormProps> = ({
  config,
  emailConfig,
  onSave,
  isLoading = false,
  onTabNavigate,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LoginConfig>(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleToggleEnabled = async (enabled: boolean) => {
    const updatedConfig = {
      ...config,
      email: {
        ...config.email,
        is_enabled: enabled,
        mode: config.email?.mode || EmailMode.PASSWORD,
      },
    };
    // when toggle the switch, save directly, same as GoogleAuthConfigForm
    await onSave(updatedConfig);
  };

  const handleModeChange = (mode: EmailMode) => {
    // no longer save directly, but update the local state
    setFormData((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        is_enabled: prev.email?.is_enabled || false,
        mode,
      },
    }));
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  const isEmailConfigured = !!emailConfig?.smtp_host;
  const isCaptchaMode = formData.email?.mode === EmailMode.CAPTCHA;
  const isEmailEnabled = formData.email?.is_enabled || false;

  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        base: "shadow-none border-1",
      }}
      defaultExpandedKeys={["email-login"]}
      className="px-0"
    >
      <AccordionItem
        key="email-login"
        title={
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">{t("Email Login")}</h3>
              <p className="text-sm text-gray-500">
                {t("Configure email-based authentication")}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* enable email login */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t("Enable Email Login")}
              </span>
              <span className="text-xs text-gray-500">
                {t("Allow users to sign in with email")}
              </span>
            </div>
            <Switch
              isSelected={isEmailEnabled}
              onValueChange={handleToggleEnabled}
              color="primary"
              size="sm"
              isDisabled={isLoading || (isCaptchaMode && !isEmailConfigured)}
            />
          </div>

          {/* authentication mode selection */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {t("Authentication Mode")}
                </span>
                <span className="text-xs text-gray-500">
                  {t("Choose how users authenticate with email")}
                </span>
              </div>
              <Select
                selectedKeys={[formData.email?.mode || EmailMode.PASSWORD]}
                onSelectionChange={(keys) => {
                  const mode = Array.from(keys)[0] as EmailMode;
                  handleModeChange(mode);
                }}
                size="sm"
                isDisabled={isLoading || !isEmailEnabled}
                renderValue={() => {
                  const selectedKey =
                    formData.email?.mode || EmailMode.PASSWORD;
                  if (selectedKey === EmailMode.PASSWORD)
                    return t("Email/Password");
                  return t(
                    selectedKey === EmailMode.CAPTCHA
                      ? "Email/Verification Code"
                      : "Email/Password"
                  );
                }}
              >
                <SelectItem key={EmailMode.PASSWORD} value={EmailMode.PASSWORD}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {t("Email/Password")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t("Traditional email and password authentication")}
                    </span>
                  </div>
                </SelectItem>
                <SelectItem key={EmailMode.CAPTCHA} value={EmailMode.CAPTCHA}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {t("Email/Verification Code")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t("Passwordless login with email verification code")}
                    </span>
                  </div>
                </SelectItem>
              </Select>
            </div>
          </div>

          {/* email configuration hint - only show in captcha mode */}
          {isEmailEnabled && isCaptchaMode && !isEmailConfigured && (
            <Alert color="warning" variant="flat" className="mb-4">
              <div className="flex gap-2">
                <span>
                  {t(
                    "Email service is not configured. Please configure email settings first."
                  )}
                </span>
                <Link
                  className="text-sm underline cursor-pointer"
                  onPress={() => {
                    onTabNavigate?.(TabKey.SYSTEM_SETTINGS);
                  }}
                >
                  {t("Go to Settings")}
                </Link>
              </div>
            </Alert>
          )}

          {/* save button - only show in enabled state */}
          {isEmailEnabled && (
            <div className="flex gap-3 py-4">
              <Button
                color="primary"
                variant="solid"
                onPress={handleSave}
                isLoading={isLoading}
                size="sm"
              >
                {t("Save")}
              </Button>
            </div>
          )}
        </div>
      </AccordionItem>
    </Accordion>
  );
};
