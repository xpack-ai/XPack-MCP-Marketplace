import { useSharedStore } from "../store/share";
import { ApiResponse } from "../types";
import { getApiUrl } from "./adapter";
const getAuth = () => {
  //? window.localStorage.get('user_token') prevent extension includeChromeStore asynchrounous  problem
  return (
    useSharedStore?.getState?.()?.user_token ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("user_token")
      : "")
  );
};
/**
 * Simplified fetch API for SSG application
 */
export const fetchAPI = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    // Add default headers
    options.headers = {
      "Content-Type": "application/json",
      // Prevent potential "Ill-formed language" errors by ensuring a valid default language tag
      "Accept-Language": "en-US,en;q=0.9",
      Authorization: getAuth() || undefined,
      ...(typeof window === "undefined"
        ? {
            noCache: true,
          }
        : {}),
      ...(options.headers || {}),
    } as any;

    // Process JSON body
    if (options.body && typeof options.body === "object") {
      options.body = JSON.stringify(options.body);
    }

    const response = await fetch(getApiUrl(url), options);
    const contentType = response.headers.get("Content-Type");

    // Parse response based on content type
    if (contentType?.includes("application/json")) {
      const result = await response.json();
      return result;
    } else {
      // Default fallback if not JSON
      return {
        success: response.ok,
        code: response.status.toString(),
        error_message: response.ok ? undefined : response.statusText,
        data: null as T,
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Request aborted:", url);
    } else {
      console.error("Fetch error:", error);
    }
    throw error;
  }
};
