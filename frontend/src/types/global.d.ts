import { PlatformConfigResponse } from "@/shared/types/system";

declare global {
  interface Window {
    __PLATFORM_CONFIG__?: PlatformConfigResponse | null;
    _BACKEND_LOAD_LANG__?: boolean;
  }
}

export {};
