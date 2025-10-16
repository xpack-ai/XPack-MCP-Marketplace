"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import {
  PageExtensionConfig,
  registerPageExtensions,
} from "@/shared/registry/page-registry";
import { registerComponentInjections } from "@/shared/lib/component-injection";
import { ComponentInjectionConfig } from "@/shared/types/component-injection";
import { LangEnum } from "@/shared/types/lang";
import { mergeProjectI18nResources } from "@/shared/lib/i18n";
import { NavigationItem } from "@/shared/components/Navigation";

/**
 * Project configuration interface
 */
export interface ProjectConfig {
  project: {
    name: string;
    version: string;
    features: string[];
    environment: string;
  };

  // Page configurations
  pages?: PageExtensionConfig;

  // Component injections
  components?: ComponentInjectionConfig;

  // API configurations
  api?: {
    baseUrl?: string;
    timeout?: number;
    retries?: number;
  };

  // Feature flags
  features?: Record<string, boolean>;

  // Theme configuration
  theme?: {
    mode?: "light" | "dark" | "system";
    primaryColor?: string;
    customCss?: string;
  };

  // Security settings
  security?: {
    csp?: string;
    cors?: {
      origin: string[];
      credentials: boolean;
    };
  };

  // Navigation configuration
  navigation?: NavigationItem[];

  i18n?: {
    [key in LangEnum]?: {
      [key: string]: any;
    };
  };
}

/**
 * Default configuration
 */
const defaultConfig: ProjectConfig = {
  project: {
    name: "base",
    version: "1.0.0",
    features: [],
    environment: process.env.NODE_ENV || "development",
  },
  api: {
    timeout: 30000,
    retries: 3,
  },
  features: {},
  theme: {
    mode: "system",
  },
};

/**
 * Configuration context
 */
const ConfigContext = createContext<ProjectConfig>(defaultConfig);

/**
 * Configuration provider props
 */
interface ConfigProviderProps {
  config: Partial<ProjectConfig>;
  children: ReactNode;
}

/**
 * Configuration provider component
 */
export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  config,
  children,
}) => {
  // Merge provided config with defaults
  const mergedConfig: ProjectConfig = {
    ...defaultConfig,
    ...config,
    project: {
      ...defaultConfig.project,
      ...config.project,
    },
    api: {
      ...defaultConfig.api,
      ...config.api,
    },
    theme: {
      ...defaultConfig.theme,
      ...config.theme,
    },
    features: {
      ...defaultConfig.features,
      ...config.features,
    },
  };

  // Register configurations on mount
  useEffect(() => {
    // Register page extensions
    if (mergedConfig.pages) {
      registerPageExtensions(mergedConfig.pages);
    }

    // Register component injections
    if (mergedConfig.components) {
      registerComponentInjections(mergedConfig.components);
    }

    // Merge i18n resources from project configuration
    mergeProjectI18nResources(mergedConfig);

    // Set global configuration for debugging
    if (
      typeof window !== "undefined" &&
      mergedConfig.project.environment === "development"
    ) {
      (window as any).__PROJECT_CONFIG__ = mergedConfig;
    }
  }, [mergedConfig]);

  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Hook to use configuration
 */
export function useConfig(): ProjectConfig {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}

/**
 * Hook to use project information
 */
export function useProject() {
  const { project } = useConfig();
  return project;
}

/**
 * Hook to use API configuration
 */
export function useApiConfig() {
  const { api } = useConfig();
  return api || {};
}

/**
 * Hook to use feature flags
 */
export function useFeatures() {
  const { features } = useConfig();
  return features || {};
}

/**
 * Hook to check if a feature is enabled
 */
export function useFeature(featureName: string): boolean {
  const features = useFeatures();
  return features[featureName] === true;
}

/**
 * Hook to use theme configuration
 */
export function useThemeConfig() {
  const { theme } = useConfig();
  return theme || {};
}

/**
 * Hook to get navigation items
 */
export function useNavigationItems(): NavigationItem[] {
  const { navigation } = useConfig();
  return navigation || [];
}

/**
 * Configuration validator
 */
export function validateConfig(config: Partial<ProjectConfig>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate project configuration
  if (!config.project?.name) {
    errors.push("Project name is required");
  }

  if (!config.project?.version) {
    errors.push("Project version is required");
  }

  // Validate API configuration
  if (config.api?.timeout && config.api.timeout < 1000) {
    errors.push("API timeout should be at least 1000ms");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Development helper to get current configuration
 */
export function getGlobalConfig(): ProjectConfig | null {
  if (typeof window !== "undefined") {
    return (window as any).__PROJECT_CONFIG__ || null;
  }
  return null;
}
