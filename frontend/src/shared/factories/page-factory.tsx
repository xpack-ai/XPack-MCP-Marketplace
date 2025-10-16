import React, { ComponentType } from "react";
import type { Metadata } from "next";
import { PageConfig, getPageConfig } from "@/shared/registry/page-registry";

/**
 * Page factory props
 */
interface PageFactoryProps {
  path: string;
  params?: Record<string, any>;
  searchParams?: Record<string, any>;
  fallback?: ComponentType;
}
/**
 * Default error component
 */
const DefaultError: React.FC<{ error?: Error }> = ({ error }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-4">
          {error?.message || "An unexpected error occurred"}
        </p>
        <div className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 cursor-pointer inline-block">
          Reload Page
        </div>
      </div>
    </div>
  );
};

/**
 * Page wrapper component that handles layout, loading, and error states
 */
const PageWrapper: React.FC<{
  config: PageConfig;
  props: any;
}> = ({ config, props }) => {
  const { component: PageComponent, layout: Layout } = config;

  const WrappedComponent = () => <PageComponent {...props} />;

  if (Layout) {
    return (
      <Layout>
        <WrappedComponent />
      </Layout>
    );
  }

  return <WrappedComponent />;
};

/**
 * Page factory component
 * Dynamically creates pages based on registry configuration
 */
export const PageFactory: React.FC<PageFactoryProps> = ({
  path,
  params = {},
  searchParams = {},
  fallback,
}) => {
  const config = getPageConfig(path);

  if (!config) {
    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent />;
    }

    return <DefaultError error={new Error(`Page not found: ${path}`)} />;
  }

  const pageProps = {
    params,
    searchParams,
  };

  return <PageWrapper config={config} props={pageProps} />;
};

/**
 * Higher-order component for creating page components
 */
export function createPage(path: string) {
  return function Page(props: any) {
    return <PageFactory path={path} {...props} />;
  };
}

/**
 * Generate metadata for a page
 */
export async function generatePageMetadata(
  path: string,
  params?: Record<string, any>
): Promise<Metadata> {
  const config = getPageConfig(path);

  if (!config?.metadata) {
    return {
      title: "Page",
      description: "Page description",
    };
  }

  // If metadata is a function, call it with params
  if (typeof config.metadata === "function") {
    return await config.metadata(params || {});
  }

  return config.metadata;
}

/**
 * Check if user has permission to access a page
 */
export function checkPagePermissions(
  path: string,
  userPermissions: string[] = []
): boolean {
  const config = getPageConfig(path);

  if (!config?.permissions || config.permissions.length === 0) {
    return true; // No permissions required
  }

  // Check if user has any of the required permissions
  return config.permissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

/**
 * Check if page features are enabled
 */
export function checkPageFeatures(
  path: string,
  enabledFeatures: string[] = []
): boolean {
  const config = getPageConfig(path);

  if (!config?.features || config.features.length === 0) {
    return true; // No features required
  }

  // Check if all required features are enabled
  return config.features.every((feature) => enabledFeatures.includes(feature));
}

/**
 * Page access validator
 */
export function validatePageAccess(
  path: string,
  userPermissions: string[] = [],
  enabledFeatures: string[] = []
): {
  canAccess: boolean;
  reason?: string;
} {
  const config = getPageConfig(path);

  if (!config) {
    return {
      canAccess: false,
      reason: "Page not found",
    };
  }

  // Check permissions
  if (!checkPagePermissions(path, userPermissions)) {
    return {
      canAccess: false,
      reason: "Insufficient permissions",
    };
  }

  // Check features
  if (!checkPageFeatures(path, enabledFeatures)) {
    return {
      canAccess: false,
      reason: "Required features not enabled",
    };
  }

  return {
    canAccess: true,
  };
}
