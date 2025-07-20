import { _DefaultPlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { fetchAPI } from "@/shared/rpc/common-function";
import { PlatformConfigResponse } from "@/shared/types/system";

export class PlatformConfigService {
  private pendingRequest: Promise<PlatformConfigResponse> | null = null;

  async getPlatformConfig(): Promise<PlatformConfigResponse> {
    // 如果已经有正在进行的请求，直接返回该 Promise
    if (this.pendingRequest) {
      console.info("Waiting for pending platform config request");
      return this.pendingRequest;
    }

    // 创建新的请求
    this.pendingRequest = this.fetchPlatformConfig();
    
    try {
      const result = await this.pendingRequest;
      return result;
    } finally {
      // 请求完成后清除 pending 状态
      this.pendingRequest = null;
    }
  }

  private async fetchPlatformConfig(): Promise<PlatformConfigResponse> {
    const response = await fetchAPI<PlatformConfigResponse>(
      "/api/common/config",
      {
        method: "GET",
      }
    );
    console.info("Global get platform config: ", response.data);

    if (!response.success) {
      console.error(response.error_message);
      return {
        platform: _DefaultPlatformConfig,
      };
    }

    return response.data;
  }
}

export const platformConfigService = new PlatformConfigService();
