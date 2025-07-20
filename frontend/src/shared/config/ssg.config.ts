/**
 * SSG (Static Site Generation) Configuration
 *
 * This file contains configuration for SSG behavior:
 * - How many popular products to pre-generate
 * - ISR revalidation intervals
 * - Fallback behavior settings
 */

export const SSG_CONFIG = {
  // Number of popular products to pre-generate at build time
  // Other products will be generated on-demand with fallback
  POPULAR_PRODUCTS_LIMIT: 50,

  // ISR revalidation interval in seconds
  // How often to check for updates and regenerate pages
  REVALIDATION_INTERVAL: 3600 * 24,

  // Enable fallback for non-pre-generated pages
  // 'blocking' - server-side render on first request then cache
  // 'true' - show loading state then hydrate
  // false - 404 for non-pre-generated pages
  FALLBACK_MODE: "blocking" as const,

  // Cache settings
  CACHE: {
    // Memory cache size for ISR (0 = unlimited)
    ISR_MEMORY_CACHE_SIZE: 0,

    // How long to cache pages in seconds
    PAGE_CACHE_TTL: 3600 * 24, // 1 day
  },
} as const;

// Stand-alone constant so that pages can statically import a literal value.
// Next.js requires `export const revalidate` to reference an Identifier or literal,
// not a computed member expression.
export const REVALIDATION_INTERVAL = 86400;

/**
 * Environment-specific overrides
 */
export const getSSGConfig = () => {
  const env = process.env.NODE_ENV;

  if (env === "development") {
    return {
      ...SSG_CONFIG,
      // In development, generate fewer pages for faster builds
      POPULAR_PRODUCTS_LIMIT: 10,
      // More frequent revalidation in development
      REVALIDATION_INTERVAL: 10,
    };
  }

  return SSG_CONFIG;
};
