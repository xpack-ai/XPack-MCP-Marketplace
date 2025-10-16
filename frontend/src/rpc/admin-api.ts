import { useAdminStore } from "@/store/admin";
import { ApiResponse } from "@/shared/types";
import { getApiUrl } from "@/shared/rpc/adapter";

const getAdminAuth = () => {
  return (
    useAdminStore?.getState?.()?.admin_token ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("admin_token")
      : "")
  );
};

export const fetchAdminAPI = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const isFormData =
    Object.prototype.toString.call(options.body) === "[object FormData]";
  try {
    options.headers = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "Accept-Language": "en-US,en;q=0.9",
      Authorization: getAdminAuth() || undefined,
      ...options.headers,
      ...(typeof window !== "undefined"
        ? window.__XPACK_GLOBAL_AJAX_HEADERS__ || {}
        : {}),
    } as any;

    // Process JSON body
    if (options.body && typeof options.body === "object" && !isFormData) {
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
        error_message: response.ok ? "" : response.statusText,
        data: null as T,
      };
    }
  } catch (error) {
    console.error("Admin API request failed:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      error_message:
        error instanceof Error ? error.message : "Network request failed",
      data: null as T,
    };
  }
};
