// Theme enum
export enum Theme {
  DEFAULT = "default",
  MODERN = "modern",
  CLASSIC = "classic",
  CREATIVE = "creative",
  TEMU = "temu",
}
export enum EmailMode {
  PASSWORD = "password",
  CAPTCHA = "captcha",
}

export interface PlatformConfig {
  logo?: string; // platform logo url
  name: string; // platform name
  currency?: string; // currency unit, e.g. 'USD', 'CNY', 'EUR'
  language?: string; // platform language, default 'en'
  website_title?: string; // website title
  headline?: string; // homepage headline
  subheadline?: string; // homepage subheadline
  theme?: Theme; // platform theme for homepage and marketplace templates
  about_page?: string; // about page content (markdown)
}

export type ThemeType = Theme;
export interface PlatformConfigResponse {
  platform: PlatformConfig;
  login?: LoginConfig;
}

// google auth config
export interface GoogleAuthConfig {
  client_id: string; // Google Client ID
  client_secret?: string; // Google Client Secret (optional, for server-side validation)
  is_enabled: boolean; // whether to enable google login
}

// email login config
export interface EmailLoginConfig {
  is_enabled: boolean; // whether to enable email login
  mode: EmailMode; // authentication mode
}

// login config
export interface LoginConfig {
  google: GoogleAuthConfig;
  email?: EmailLoginConfig;
}
