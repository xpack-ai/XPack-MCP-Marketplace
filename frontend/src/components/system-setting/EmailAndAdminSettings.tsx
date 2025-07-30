"use client";

import React from "react";
import { EmailConfigForm } from "./EmailConfigForm";
import { AdminConfig, EmailConfig } from "@/types/system";
import { AdminConfigForm } from "./AdminConfigForm";

interface EmailAndAdminSettingsProps {
  emailConfig: EmailConfig;
  adminConfig: AdminConfig;
  onSaveEmailConfig: (config: EmailConfig) => void;
  onSaveAdminConfig: (config: AdminConfig) => void;
  isLoading?: boolean;
  isAdminLoading?: boolean;
}

export const EmailAndAdminSettings: React.FC<EmailAndAdminSettingsProps> = ({
  emailConfig,
  adminConfig,
  onSaveEmailConfig,
  onSaveAdminConfig,
  isLoading = false,
  isAdminLoading = false,
}) => {
  return (
    <div className="space-y-4">
      <EmailConfigForm
        config={emailConfig}
        onSave={onSaveEmailConfig}
        isLoading={isLoading}
      />
      <AdminConfigForm
        config={adminConfig}
        onSave={onSaveAdminConfig}
        isLoading={isAdminLoading}
      />
    </div>
  );
};
