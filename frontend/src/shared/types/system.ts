export interface PlatformConfig {
  logo?: string; // platform logo url
  name: string; // platform name
  currency?: string; // currency unit, e.g. 'USD', 'CNY', 'EUR'
  language?: string; // platform language, default 'en'
  website_title?: string; // website title
  headline?: string; // homepage headline
  subheadline?: string; // homepage subheadline
}
export interface PlatformConfigResponse {
  platform: PlatformConfig;
  login?: {
    google?: {
      client_id: string;
      is_enabled: boolean;
    };
  };
}

// google auth config
export interface GoogleAuthConfig {
  client_id: string; // Google Client ID
  client_secret?: string; // Google Client Secret (optional, for server-side validation)
  is_enabled: boolean; // whether to enable google login
}
