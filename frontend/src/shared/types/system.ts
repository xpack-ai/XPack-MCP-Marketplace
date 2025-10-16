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
  domain?: string; // platform domain
  is_showcased?: boolean; // whether to showcase in xpack official case list
  mcp_server_prefix?: string; // MCP server domain prefix for API calls
  x_title?: string; // x title
  x_description?: string; // x description
  x_image_url?: string; // x image url
  facebook_title?: string; // facebook title
  facebook_description?: string; // facebook description
  facebook_image_url?: string; // facebook image url
  meta_description?: string; // meta description
  [key: string]: any;
}

export type ThemeType = Theme;
// FAQ item
export interface FaqItem {
  question: string;
  answer: string;
}
export enum TopNavigationTargetEnum {
  SELF = "_self",
  BLANK = "_blank",
}
// Top navigation item
export interface TopNavigationItem {
  title: string;
  link: string;
  target: TopNavigationTargetEnum;
}

// Embedded HTML config
export interface EmbeddedHtmlConfig {
  is_enabled: boolean;
  html: string;
}

// Payment channel
export interface PaymentChannel {
  id: string;
  name: string;
}

export interface PlatformConfigResponse {
  platform?: PlatformConfig;
  login?: LoginConfig;
  faq?: FaqItem[];
  top_navigation?: TopNavigationItem[];
  embeded_html?: EmbeddedHtmlConfig;
  payment_channels?: PaymentChannel[];
  is_installed?: boolean;
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
