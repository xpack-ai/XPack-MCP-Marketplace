import { PlatformConfigResponse } from "@/shared/types/system";

declare global {
  interface Window {
    __PLATFORM_CONFIG__?: PlatformConfigResponse | null;
    _BACKEND_LOAD_LANG__?: boolean;
    __XPACK_GLOBAL_AJAX_HEADERS__?: { [key: string]: string };
  }
}

export {};
