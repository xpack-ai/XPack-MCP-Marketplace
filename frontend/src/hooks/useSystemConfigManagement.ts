import { useState, useCallback, useEffect } from "react";
import { GoogleAuthConfig, PlatformConfig } from "@/shared/types/system";
import { systemConfigService } from "@/services/systemConfigService";
import { AdminConfig, EmailConfig } from "@/types/system";
import { md5Encrypt } from "@/shared/utils/crypto";
import { revalidatePlatformConfig } from "@/app/actions/revalidate";

export const useSystemConfigManagement = () => {
  // platform config
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    name: "",
    logo: "",
    currency: "USD",
  });
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformError, setPlatformError] = useState<string | null>(null);

  // admin config
  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    username: "",
    password: "",
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // email config
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_password: "",
    smtp_sender: "",
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // google auth config
  const [googleAuthConfig, setGoogleAuthConfig] = useState<GoogleAuthConfig>({
    client_id: "",
    client_secret: "",
    is_enabled: false,
  });
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  // global loading
  const [isLoading, setIsLoading] = useState(false);

  // load all configs
  const loadConfigurations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await systemConfigService.getSystemConfig();

      setPlatformConfig(response.platform);
      setAdminConfig(response.account);
      setEmailConfig(
        response.email || {
          smtp_host: "",
          smtp_port: "587",
          smtp_user: "",
          smtp_password: "",
          smtp_sender: "",
        }
      );
      setGoogleAuthConfig(response.login?.google);
    } catch (error) {
      console.error("Failed to load configurations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // save platform config
  const savePlatformConfig = useCallback(async (config: PlatformConfig) => {
    setPlatformLoading(true);
    setPlatformError(null);
    const result = await systemConfigService.updateSystemConfig({
      platform: config,
    });
    if (result) {
      setPlatformConfig(config);
      // 重新验证平台配置缓存
      try {
        await revalidatePlatformConfig();
        console.info("Platform config cache revalidated successfully");
      } catch (error) {
        console.error("Failed to revalidate platform config cache:", error);
      }
    }
    setPlatformLoading(false);
    return result;
  }, []);

  // save admin config
  const saveAdminConfig = useCallback(async (config: AdminConfig) => {
    setAdminLoading(true);
    setAdminError(null);
    const result = await systemConfigService.updateSystemConfig({
      account: {
        ...config,
        password: md5Encrypt(config.password),
      },
    });
    if (result) {
      setAdminConfig(config);
    }
    setAdminLoading(false);
    return result;
  }, []);

  // save email config
  const saveEmailConfig = useCallback(async (config: EmailConfig) => {
    setEmailLoading(true);
    setEmailError(null);
    const result = await systemConfigService.updateSystemConfig({
      email: config,
    });
    if (result) {
      setEmailConfig(config);
    }
    setEmailLoading(false);
    return result;
  }, []);

  // save google auth config
  const saveGoogleAuthConfig = useCallback(async (config: GoogleAuthConfig) => {
    setGoogleAuthLoading(true);
    setGoogleAuthError(null);
    const result = await systemConfigService.updateSystemConfig({
      login: {
        google: config,
      },
    });
    if (result) {
      setGoogleAuthConfig(config);
      await revalidatePlatformConfig();
    }
    setGoogleAuthLoading(false);
    return result;
  }, []);

  // clear errors
  const clearPlatformError = useCallback(() => setPlatformError(null), []);
  const clearAdminError = useCallback(() => setAdminError(null), []);
  const clearEmailError = useCallback(() => setEmailError(null), []);
  const clearGoogleAuthError = useCallback(() => setGoogleAuthError(null), []);

  // load configs on init
  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  return {
    // platform config
    platformConfig,
    setPlatformConfig,
    platformLoading,
    platformError,
    savePlatformConfig,
    clearPlatformError,

    // admin config
    adminConfig,
    setAdminConfig,
    adminLoading,
    adminError,
    saveAdminConfig,
    clearAdminError,

    // email config
    emailConfig,
    setEmailConfig,
    emailLoading,
    emailError,
    saveEmailConfig,
    clearEmailError,

    // google auth config
    googleAuthConfig,
    setGoogleAuthConfig,
    googleAuthLoading,
    googleAuthError,
    saveGoogleAuthConfig,
    clearGoogleAuthError,

    // global operations
    isLoading,
    loadConfigurations,
  };
};
