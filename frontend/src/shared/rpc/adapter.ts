import { SourceType } from "../types";

export const SOURCE_TYPE = SourceType.SSG;

// Define base URLs for API requests
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8100";

// Helper function for constructing API URLs
export const getApiUrl = (endpoint: string) => {
  //if window is undefined, it means it's server side, so we need to use the API_BASE_URL
  if (
    typeof window === "undefined" &&
    (endpoint.startsWith("/v1/") || endpoint.startsWith("/api/"))
  ) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return endpoint;
};
export const getURL = (url: string) => {
  if (url.startsWith("http")) return url;
  if (process.env.NEXT_PUBLIC_STATIC_URL_PREFIX)
    return process.env.NEXT_PUBLIC_STATIC_URL_PREFIX + url;
  return url;
};
