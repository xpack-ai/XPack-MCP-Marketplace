'use client';

import React from 'react';
import { PlatformConfigForm } from '@/components/system-setting/PlatformConfigForm';
import { AdminConfigForm } from '@/components/system-setting/AdminConfigForm';
import { EmailConfigForm } from '@/components/system-setting/EmailConfigForm';
import { GoogleAuthConfigForm } from '@/components/system-setting/GoogleAuthConfigForm';
import { useSystemConfigManagement } from '@/hooks/useSystemConfigManagement';
import { usePlatformConfig } from '@/shared/contexts/PlatformConfigContext';
import i18n from '@/shared/lib/i18n';

export const SystemSettingsContent: React.FC = () => {
  const { updateClientConfig } = usePlatformConfig();

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

    // google auth config
    googleAuthConfig,
    googleAuthLoading,
    saveGoogleAuthConfig,

  } = useSystemConfigManagement();

  // save admin config
  const handleSaveAdminConfig = async (config: typeof adminConfig) => {
    await saveAdminConfig(config);
  };

  // save email config
  const handleSaveEmailConfig = async (config: typeof emailConfig) => {
    await saveEmailConfig(config);
  };

  // save google auth config
  const handleSaveGoogleAuthConfig = async (config: typeof googleAuthConfig) => {
    const result = await saveGoogleAuthConfig(config);
    if (!result) return
    updateClientConfig({
      platform: platformConfig,
      login: {
        google: config,
      },
    });
  };

  // save platform config
  const handleSavePlatformConfig = async (config: typeof platformConfig) => {
    const result = await savePlatformConfig(config);
    if (!result) return
    updateClientConfig({
      platform: config,
    });
    if (config.language !== i18n.language) {
      i18n.changeLanguage(config.language);
    }
  };


  return (
    <div className="space-y-6 w-full">
      {/* platform config */}
      <PlatformConfigForm
        config={platformConfig}
        onSave={handleSavePlatformConfig}
        isLoading={platformLoading}
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

      {/* google auth config */}
      <GoogleAuthConfigForm
        config={googleAuthConfig}
        onSave={handleSaveGoogleAuthConfig}
        isLoading={googleAuthLoading}
      />
    </div>
  );
};

export default SystemSettingsContent;