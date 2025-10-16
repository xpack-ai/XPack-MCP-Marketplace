import { ComponentType } from 'react';

/**
 * Component injection configuration interface
 * Defines how components can be overridden or extended
 */
export interface ComponentInjectionItem {
  /** The component to inject */
  component: ComponentType<any>;
  /** Priority for component resolution (higher priority wins) */
  priority: number;
  /** Description of what this injection does */
  description?: string;
  /** Whether this component should completely replace the original */
  replace?: boolean;
  /** Conditions under which this component should be used */
  conditions?: {
    /** Environment conditions */
    env?: string[];
    /** Feature flags */
    features?: string[];
    /** Custom condition function */
    custom?: () => boolean;
  };
}

/**
 * Component injection configuration map
 * Maps component paths to their injection configurations
 */
export interface ComponentInjectionConfig {
  [componentPath: string]: ComponentInjectionItem;
}

/**
 * Component registry for managing injected components
 */
export interface ComponentRegistry {
  /** Register a component injection */
  register(path: string, config: ComponentInjectionItem): void;
  /** Get the best matching component for a path */
  resolve<T = any>(path: string): ComponentType<T> | null;
  /** Get all registered components for a path */
  getAll(path: string): ComponentInjectionItem[];
  /** Clear all registrations */
  clear(): void;
}

/**
 * Hook for using injected components
 */
export interface UseComponentInjection {
  /** Get a component by path, with fallback */
  getComponent<T = any>(path: string, fallback?: ComponentType<T>): ComponentType<T>;
  /** Check if a component is injected */
  isInjected(path: string): boolean;
}