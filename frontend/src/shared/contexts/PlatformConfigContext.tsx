"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  PlatformConfig,
  PlatformConfigResponse,
  Theme,
  LoginConfig,
  FaqItem,
  TopNavigationItem,
  EmbeddedHtmlConfig,
  PaymentChannel,
} from "@/shared/types/system";
export const _DefaultPlatformConfig: PlatformConfig = {
  name: "XPack",
  logo: "/static/logo/logo.png",
  currency: "USD",
  language: "en",
  website_title: "Connect Your AI Agent to the Real World - XPack",
  headline: "Connect Your AI Agent to the Real World",
  subheadline: "",
  theme: Theme.DEFAULT,
  domain: "",
  is_showcased: false,
  mcp_server_prefix: "",
  x_title: "",
  x_description: "",
  x_image_url: "",
  facebook_title: "",
  facebook_description: "",
  facebook_image_url: "",
  meta_description: "",
};
interface PlatformConfigContextType {
  platformConfig: PlatformConfig;
  loginConfig: LoginConfig | null;
  faqItems: FaqItem[];
  topNavigation: TopNavigationItem[];
  embeddedHtml: EmbeddedHtmlConfig | null;
  paymentChannels: PaymentChannel[];
  isInstalled: boolean;
  updateClientConfig: (config: PlatformConfigResponse) => void;
}

const PlatformConfigContext = createContext<
  PlatformConfigContextType | undefined
>(undefined);

interface PlatformConfigProviderProps {
  children: ReactNode;
  initConfig?: PlatformConfigResponse;
}

export const PlatformConfigProvider: React.FC<PlatformConfigProviderProps> = ({
  children,
  initConfig,
}) => {
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(
    initConfig?.platform || _DefaultPlatformConfig
  );
  const [loginConfig, setLoginConfig] = useState<LoginConfig | null>(
    initConfig?.login || null
  );
  const [faqItems, setFaqItems] = useState<FaqItem[]>(initConfig?.faq || []);
  const [topNavigation, setTopNavigation] = useState<TopNavigationItem[]>(
    initConfig?.top_navigation || []
  );
  const [embeddedHtml, setEmbeddedHtml] = useState<EmbeddedHtmlConfig | null>(
    initConfig?.embeded_html || null
  );
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>(
    initConfig?.payment_channels || []
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(
    initConfig?.is_installed || false
  );

  const updateClientConfig = (config: PlatformConfigResponse) => {
    if (config.platform) setPlatformConfig(config.platform);
    if (config.login) setLoginConfig(config.login);
    if (config.faq) setFaqItems(config.faq);
    if (config.top_navigation) setTopNavigation(config.top_navigation);
    if (config.embeded_html) setEmbeddedHtml(config.embeded_html);
    if (config.payment_channels) setPaymentChannels(config.payment_channels);
    if (config.is_installed !== undefined) setIsInstalled(config.is_installed);
  };
  return (
    <PlatformConfigContext.Provider
      value={{
        platformConfig,
        loginConfig,
        faqItems,
        topNavigation,
        embeddedHtml,
        paymentChannels,
        isInstalled,
        updateClientConfig,
      }}
    >
      {children}
    </PlatformConfigContext.Provider>
  );
};

export const usePlatformConfig = () => {
  const context = useContext(PlatformConfigContext);
  if (context === undefined) {
    throw new Error(
      "usePlatformConfig must be used within a PlatformConfigProvider"
    );
  }
  return context;
};
