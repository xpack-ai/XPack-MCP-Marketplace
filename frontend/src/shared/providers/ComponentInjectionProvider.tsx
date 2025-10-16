"use client";

import React, { createContext, useContext, ReactNode, ComponentType } from "react";
import { ComponentInjectionConfig } from "@/shared/types/component-injection";

/**
 * Component injection context
 */
interface ComponentInjectionContextType {
  getComponent<T = any>(path: string, fallback?: ComponentType<T>): ComponentType<T> | null;
  isInjected(path: string): boolean;
}

const ComponentInjectionContext = createContext<ComponentInjectionContextType | null>(null);

/**
 * Component injection provider props
 */
interface ComponentInjectionProviderProps {
  injections: ComponentInjectionConfig;
  children: ReactNode;
}

/**
 * Component injection provider
 * Provides local component injection capabilities
 */
export const ComponentInjectionProvider: React.FC<ComponentInjectionProviderProps> = ({
  injections,
  children,
}) => {
  // Create a local registry for this provider scope
  const localRegistry = new Map<string, ComponentType>();

  // Register injections in local registry
  React.useEffect(() => {
    Object.entries(injections).forEach(([path, config]) => {
      localRegistry.set(path, config.component);
    });
  }, [injections]);

  const contextValue: ComponentInjectionContextType = {
    getComponent<T = any>(path: string, fallback?: ComponentType<T>): ComponentType<T> | null {
      const component = localRegistry.get(path);
      if (component) {
        return component as ComponentType<T>;
      }
      return fallback || null;
    },

    isInjected(path: string): boolean {
      return localRegistry.has(path);
    },
  };

  return (
    <ComponentInjectionContext.Provider value={contextValue}>
      {children}
    </ComponentInjectionContext.Provider>
  );
};

/**
 * Hook to use component injection context
 */
export function useLocalComponentInjection(): ComponentInjectionContextType {
  const context = useContext(ComponentInjectionContext);
  if (!context) {
    throw new Error("useLocalComponentInjection must be used within ComponentInjectionProvider");
  }
  return context;
}