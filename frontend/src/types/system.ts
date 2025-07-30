// 系统设置相关类型定义

import {
  GoogleAuthConfig,
  PlatformConfig,
  LoginConfig,
  FaqItem,
  TopNavigationItem,
  EmbeddedHtmlConfig,
  PaymentChannel,
} from "@/shared/types/system";

// API return system config data structure
export interface SystemConfigApiData {
  platform: PlatformConfig;
  account: AdminConfig;
  email: EmailConfig;
  login: LoginConfig;
  faq?: FaqItem[];
  top_navigation?: TopNavigationItem[];
  embeded_html?: EmbeddedHtmlConfig;
  payment_channels?: PaymentChannel[];
  is_installed?: boolean;
}
// admin config
export interface AdminConfig {
  username: string; // admin username
  password: string; // admin password
}

// email config
export interface EmailConfig {
  smtp_host: string; // SMTP host
  smtp_port: string; // SMTP port
  smtp_user: string; // SMTP username
  smtp_password: string; // SMTP password
  smtp_sender: string; // sender email
}

// client-side google auth config (without sensitive data)
export interface ClientGoogleAuthConfig {
  client_id: string; // Google Client ID
  is_enabled: boolean; // whether to enable google login
}

// system config
export interface SystemConfig {
  platform: PlatformConfig;
  admin: AdminConfig;
  email: EmailConfig;
  googleAuth: GoogleAuthConfig;
}

// system config form data
export interface SystemConfigFormData {
  platform: Partial<PlatformConfig>;
  admin: Partial<AdminConfig>;
  email: Partial<EmailConfig>;
  googleAuth: Partial<GoogleAuthConfig>;
}

// system config test result
export interface SystemConfigTestResult {
  success: boolean;
  message: string;
  details?: any;
}
