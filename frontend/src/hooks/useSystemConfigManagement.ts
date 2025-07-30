import { useState, useCallback, useEffect } from "react";
import { 
  PlatformConfig, 
  LoginConfig, 
  EmailMode, 
  FaqItem, 
  TopNavigationItem, 
  EmbeddedHtmlConfig, 
  PaymentChannel 
} from "@/shared/types/system";
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

  // login config
  const [loginConfig, setLoginConfig] = useState<LoginConfig>({
    google: {
      client_id: "",
      client_secret: "",
      is_enabled: false,
    },
    email: {
      is_enabled: true, // 默认启用邮箱登录
      mode: EmailMode.PASSWORD, // 默认使用密码模式
    },
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // faq config
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState<string | null>(null);

  // top navigation config
  const [topNavigation, setTopNavigation] = useState<TopNavigationItem[]>([]);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  // embedded html config
  const [embeddedHtml, setEmbeddedHtml] = useState<EmbeddedHtmlConfig | null>(null);
  const [embeddedHtmlLoading, setEmbeddedHtmlLoading] = useState(false);
  const [embeddedHtmlError, setEmbeddedHtmlError] = useState<string | null>(null);

  // payment channels config
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // installation status
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

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
      setLoginConfig({
        google: response.login?.google || {
          client_id: "",
          client_secret: "",
          is_enabled: false,
        },
        email: response.login?.email || {
          is_enabled: true,
          mode: EmailMode.PASSWORD,
        },
      });
      setFaqItems(response.faq || []);
      setTopNavigation(response.top_navigation || []);
      setEmbeddedHtml(response.embeded_html || null);
      setPaymentChannels(response.payment_channels || []);
      setIsInstalled(response.is_installed || false);
    } catch (error) {
      console.error("Failed to load configurations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // save platform config
  const savePlatformConfig = useCallback(
    async (config: PlatformConfig, key?: "theme" | "about") => {
      if (!key) setPlatformLoading(true);
      setPlatformError(null);
      const result = await systemConfigService.updateSystemConfig(
        {
          platform: config,
        },
        key
      );
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
    },
    []
  );

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

  // save login config
  const saveLoginConfig = useCallback(async (config: LoginConfig) => {
    setLoginLoading(true);
    setLoginError(null);
    const result = await systemConfigService.updateSystemConfig({
      login: config,
    });
    if (result) {
      setLoginConfig(config);
      await revalidatePlatformConfig();
    }
    setLoginLoading(false);
    return result;
  }, []);

  // save faq config
  const saveFaqConfig = useCallback(async (items: FaqItem[]) => {
    setFaqLoading(true);
    setFaqError(null);
    const result = await systemConfigService.updateSystemConfig({
      faq: items,
    }, "faq");
    if (result) {
      setFaqItems(items);
    }
    setFaqLoading(false);
    return result;
  }, []);

  // save top navigation config
  const saveTopNavigationConfig = useCallback(async (items: TopNavigationItem[]) => {
    setNavigationLoading(true);
    setNavigationError(null);
    const result = await systemConfigService.updateSystemConfig({
      top_navigation: items,
    }, "navigation");
    if (result) {
      setTopNavigation(items);
    }
    setNavigationLoading(false);
    return result;
  }, []);

  // save embedded html config
  const saveEmbeddedHtmlConfig = useCallback(async (config: EmbeddedHtmlConfig) => {
    setEmbeddedHtmlLoading(true);
    setEmbeddedHtmlError(null);
    const result = await systemConfigService.updateSystemConfig({
      embeded_html: config,
    }, "embedded_html");
    if (result) {
      setEmbeddedHtml(config);
    }
    setEmbeddedHtmlLoading(false);
    return result;
  }, []);

  // save payment channels config
  const savePaymentChannelsConfig = useCallback(async (channels: PaymentChannel[]) => {
    setPaymentLoading(true);
    setPaymentError(null);
    const result = await systemConfigService.updateSystemConfig({
      payment_channels: channels,
    }, "payment");
    if (result) {
      setPaymentChannels(channels);
    }
    setPaymentLoading(false);
    return result;
  }, []);

  // clear errors
  const clearPlatformError = useCallback(() => setPlatformError(null), []);
  const clearAdminError = useCallback(() => setAdminError(null), []);
  const clearEmailError = useCallback(() => setEmailError(null), []);
  const clearLoginError = useCallback(() => setLoginError(null), []);
  const clearFaqError = useCallback(() => setFaqError(null), []);
  const clearNavigationError = useCallback(() => setNavigationError(null), []);
  const clearEmbeddedHtmlError = useCallback(() => setEmbeddedHtmlError(null), []);
  const clearPaymentError = useCallback(() => setPaymentError(null), []);

  // load configs on init
  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  // upload image
  const uploadImage = useCallback(
    async (file: File, sha256?: string): Promise<string> => {
      try {
        return await systemConfigService.uploadImage(file, sha256);
      } catch (error) {
        console.error("Failed to upload image:", error);
        throw error;
      }
    },
    []
  );

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

    // login config
    loginConfig,
    setLoginConfig,
    loginLoading,
    loginError,
    saveLoginConfig,
    clearLoginError,

    // faq config
    faqItems,
    setFaqItems,
    faqLoading,
    faqError,
    saveFaqConfig,
    clearFaqError,

    // top navigation config
    topNavigation,
    setTopNavigation,
    navigationLoading,
    navigationError,
    saveTopNavigationConfig,
    clearNavigationError,

    // embedded html config
    embeddedHtml,
    setEmbeddedHtml,
    embeddedHtmlLoading,
    embeddedHtmlError,
    saveEmbeddedHtmlConfig,
    clearEmbeddedHtmlError,

    // payment channels config
    paymentChannels,
    setPaymentChannels,
    paymentLoading,
    paymentError,
    savePaymentChannelsConfig,
    clearPaymentError,

    // installation status
    isInstalled,
    setIsInstalled,

    // image upload
    uploadImage,

    // global operations
    isLoading,
    loadConfigurations,
  };
};
