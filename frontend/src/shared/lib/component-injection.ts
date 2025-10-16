import { ComponentType } from 'react';
import {
  ComponentInjectionItem,
  ComponentInjectionConfig,
  ComponentRegistry,
} from '@/shared/types/component-injection';

/**
 * Component registry implementation
 * Manages component injections with priority-based resolution
 */
class ComponentRegistryImpl implements ComponentRegistry {
  private registry = new Map<string, ComponentInjectionItem[]>();

  register(path: string, config: ComponentInjectionItem): void {
    if (!this.registry.has(path)) {
      this.registry.set(path, []);
    }
    
    const items = this.registry.get(path)!;
    items.push(config);
    
    // Sort by priority (higher priority first)
    items.sort((a, b) => b.priority - a.priority);
  }

  resolve<T = any>(path: string): ComponentType<T> | null {
    const items = this.registry.get(path);
    if (!items || items.length === 0) {
      return null;
    }

    // Find the first item that meets conditions
    for (const item of items) {
      if (this.meetsConditions(item)) {
        return item.component as ComponentType<T>;
      }
    }

    return null;
  }

  getAll(path: string): ComponentInjectionItem[] {
    return this.registry.get(path) || [];
  }

  clear(): void {
    this.registry.clear();
  }

  private meetsConditions(item: ComponentInjectionItem): boolean {
    if (!item.conditions) {
      return true;
    }

    const { env, features, custom } = item.conditions;

    // Check environment conditions
    if (env && env.length > 0) {
      const currentEnv = process.env.NODE_ENV || 'development';
      if (!env.includes(currentEnv)) {
        return false;
      }
    }

    // Check feature flags (placeholder for future implementation)
    if (features && features.length > 0) {
      // TODO: Implement feature flag checking
      // For now, assume all features are enabled
    }

    // Check custom condition
    if (custom && typeof custom === 'function') {
      try {
        return custom();
      } catch (error) {
        console.warn('Component injection custom condition failed:', error);
        return false;
      }
    }

    return true;
  }
}

// Global component registry instance
export const componentRegistry = new ComponentRegistryImpl();

/**
 * Register component injections from a configuration object
 */
export function registerComponentInjections(config: ComponentInjectionConfig): void {
  Object.entries(config).forEach(([path, item]) => {
    componentRegistry.register(path, item);
  });
}

/**
 * Get an injected component with fallback
 */
export function getInjectedComponent<T = any>(
  path: string,
  fallback?: ComponentType<T>
): ComponentType<T> {
  const injected = componentRegistry.resolve<T>(path);
  if (injected) {
    return injected;
  }
  
  if (fallback) {
    return fallback;
  }
  
  throw new Error(`No component found for path: ${path}`);
}

/**
 * Check if a component path has injections
 */
export function hasComponentInjection(path: string): boolean {
  return componentRegistry.getAll(path).length > 0;
}