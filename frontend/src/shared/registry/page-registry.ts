import { ComponentType } from 'react';
import type { Metadata } from 'next';

/**
 * Page configuration interface
 * Defines the structure for page registration
 */
export interface PageConfig {
  component: ComponentType<any>;
  layout?: ComponentType<any>;
  metadata?: Metadata | ((params?: any) => Metadata | Promise<Metadata>);
  permissions?: string[];
  features?: string[];
  loading?: ComponentType;
  error?: ComponentType;
}

/**
 * Page extension configuration
 * Allows projects to extend or override base pages
 */
export interface PageExtensionConfig {
  [path: string]: {
    component?: ComponentType<any>;
    layout?: ComponentType<any>;
    metadata?: Partial<Metadata>;
    permissions?: string[];
    features?: string[];
    beforeRender?: ComponentType[];
    afterRender?: ComponentType[];
    extends?: string; // Path to base page
    priority?: number;
  };
}

/**
 * Page registry class
 * Manages page registration and resolution with extension support
 */
class PageRegistryImpl {
  private basePages = new Map<string, PageConfig>();
  private extensions = new Map<string, PageExtensionConfig[string][]>();

  /**
   * Register a base page
   */
  registerBasePage(path: string, config: PageConfig): void {
    this.basePages.set(path, config);
  }

  /**
   * Register page extensions
   */
  registerExtensions(extensions: PageExtensionConfig): void {
    Object.entries(extensions).forEach(([path, extension]) => {
      if (!this.extensions.has(path)) {
        this.extensions.set(path, []);
      }
      
      const pathExtensions = this.extensions.get(path)!;
      pathExtensions.push(extension);
      
      // Sort by priority (higher first)
      pathExtensions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    });
  }

  /**
   * Match dynamic route patterns
   */
  private matchDynamicRoute(actualPath: string, patternPath: string): boolean {
    const actualSegments = actualPath.split('/').filter(Boolean);
    const patternSegments = patternPath.split('/').filter(Boolean);

    if (actualSegments.length !== patternSegments.length) {
      return false;
    }

    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i];
      const actualSegment = actualSegments[i];

      // Check if pattern segment is a dynamic parameter
      if (patternSegment.startsWith('[') && patternSegment.endsWith(']')) {
        // Dynamic segment matches any value
        continue;
      }

      // Static segment must match exactly
      if (patternSegment !== actualSegment) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find matching page pattern for actual path
   */
  private findMatchingPattern(path: string): string | null {
    // First try exact match
    if (this.basePages.has(path)) {
      return path;
    }

    // Then try dynamic route matching
    for (const registeredPath of this.basePages.keys()) {
      if (this.matchDynamicRoute(path, registeredPath)) {
        return registeredPath;
      }
    }

    return null;
  }

  /**
   * Resolve a page configuration with extensions applied
   */
  resolvePage(path: string): PageConfig | null {
    const matchingPattern = this.findMatchingPattern(path);
    
    if (!matchingPattern) {
      return null;
    }

    const basePage = this.basePages.get(matchingPattern);
    const extensions = this.extensions.get(matchingPattern) || [];

    if (!basePage && extensions.length === 0) {
      return null;
    }

    // Start with base page or empty config
    let resolvedConfig: PageConfig = basePage || {
      component: () => null,
    };

    // Apply extensions in priority order
    for (const extension of extensions) {
      resolvedConfig = this.mergePageConfig(resolvedConfig, extension);
    }

    return resolvedConfig;
  }

  /**
   * Get all registered pages
   */
  getAllPages(): Record<string, PageConfig> {
    const allPaths = new Set([
      ...this.basePages.keys(),
      ...this.extensions.keys(),
    ]);

    const result: Record<string, PageConfig> = {};
    
    for (const path of allPaths) {
      const resolved = this.resolvePage(path);
      if (resolved) {
        result[path] = resolved;
      }
    }

    return result;
  }

  /**
   * Check if a page exists
   */
  hasPage(path: string): boolean {
    return this.findMatchingPattern(path) !== null;
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.basePages.clear();
    this.extensions.clear();
  }

  /**
   * Merge page configuration with extension
   */
  private mergePageConfig(
    base: PageConfig,
    extension: PageExtensionConfig[string]
  ): PageConfig {
    return {
      ...base,
      component: extension.component || base.component,
      layout: extension.layout || base.layout,
      metadata: {
        ...base.metadata,
        ...extension.metadata,
      },
      permissions: extension.permissions || base.permissions,
      features: extension.features || base.features,
    };
  }
}

// Global page registry instance
export const pageRegistry = new PageRegistryImpl();

/**
 * Register base pages from configuration
 */
export function registerBasePages(pages: Record<string, PageConfig>): void {
  Object.entries(pages).forEach(([path, config]) => {
    pageRegistry.registerBasePage(path, config);
  });
}

/**
 * Register page extensions
 */
export function registerPageExtensions(extensions: PageExtensionConfig): void {
  pageRegistry.registerExtensions(extensions);
}

/**
 * Get a page configuration
 */
export function getPageConfig(path: string): PageConfig | null {
  return pageRegistry.resolvePage(path);
}

/**
 * Check if a page is registered
 */
export function hasPageConfig(path: string): boolean {
  return pageRegistry.hasPage(path);
}

/**
 * Hook for using page registry in React components
 */
export function usePageRegistry() {
  return {
    getPage: getPageConfig,
    hasPage: hasPageConfig,
    getAllPages: () => pageRegistry.getAllPages(),
  };
}