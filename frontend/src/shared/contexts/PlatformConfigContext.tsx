'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PlatformConfig, PlatformConfigResponse, GoogleAuthConfig } from '@/shared/types/system';
export const _DefaultPlatformConfig: PlatformConfig = {
  name: "XPack",
  logo: "/static/logo/logo.png",
  currency: "USD",
  language: "en",
  website_title: "Connect Your AI Agent to the Real World - XPack",
  headline: "Connect Your AI Agent to the Real World",
  subheadline: "Open‑source MCP marketplace — publish or consume APIs in minutes.",
};
interface PlatformConfigContextType {
  platformConfig: PlatformConfig;
  googleAuthConfig: GoogleAuthConfig | null;
  updateClientConfig: (config: PlatformConfigResponse) => void;
}


const PlatformConfigContext = createContext<PlatformConfigContextType | undefined>(undefined);

interface PlatformConfigProviderProps {
  children: ReactNode;
  initConfig: PlatformConfigResponse;
}

export const PlatformConfigProvider: React.FC<PlatformConfigProviderProps> = ({
  children,
  initConfig,
}) => {
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(initConfig.platform || _DefaultPlatformConfig);
  const [googleAuthConfig, setGoogleAuthConfig] = useState<GoogleAuthConfig | null>(initConfig.login?.google || null);
  const updateClientConfig = (config: PlatformConfigResponse) => {
    if (config.platform) setPlatformConfig(config.platform);
    if (config.login?.google) setGoogleAuthConfig(config.login?.google);
  };
  return (
    <PlatformConfigContext.Provider value={{ platformConfig, googleAuthConfig, updateClientConfig }}>
      {children}
    </PlatformConfigContext.Provider>
  );
};

export const usePlatformConfig = () => {
  const context = useContext(PlatformConfigContext);
  if (context === undefined) {
    throw new Error('usePlatformConfig must be used within a PlatformConfigProvider');
  }
  return context;
};