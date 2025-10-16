import React, { ComponentType, useMemo } from 'react';
import { getInjectedComponent, hasComponentInjection } from '@/shared/lib/component-injection';
import { UseComponentInjection } from '@/shared/types/component-injection';

/**
 * Hook for using component injection in React components
 * Provides a clean interface for getting injected components
 */
export function useComponentInjection(): UseComponentInjection {
  return useMemo(() => ({
    getComponent<T = any>(path: string, fallback?: ComponentType<T>): ComponentType<T> {
      try {
        return getInjectedComponent(path, fallback);
      } catch (error) {
        if (fallback) {
          return fallback;
        }
        throw error;
      }
    },

    isInjected(path: string): boolean {
      return hasComponentInjection(path);
    },
  }), []);
}

/**
 * Higher-order component for component injection
 * Wraps a component to enable injection capabilities
 */
export function withComponentInjection<P extends object>(
  path: string,
  OriginalComponent: ComponentType<P>
) {
  const InjectedComponent = (props: P) => {
    const { getComponent } = useComponentInjection();
    const Component = getComponent(path, OriginalComponent);
    return <Component {...props} />;
  };

  InjectedComponent.displayName = `withComponentInjection(${OriginalComponent.displayName || OriginalComponent.name || 'Component'})`;
  
  return InjectedComponent;
}