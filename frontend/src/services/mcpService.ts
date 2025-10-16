import { ApiArrayResponse, ApiObjectResponse } from "@/shared/types";
import { fetchAdminAPI } from "@/rpc/admin-api";
import {
  MCPService,
  MCPServiceFormData,
  OpenAPIParseResponse,
} from "@/shared/types/mcp-service";
import { toast } from "react-hot-toast";
import i18n from "@/shared/lib/i18n";

// MCP server list API response interface
export interface MCPServiceListApiResponse
  extends ApiArrayResponse<MCPService> {}

// MCP server detail API response interface
export interface MCPServiceDetailApiResponse
  extends ApiObjectResponse<MCPService> {}

// OpenAPI parse API response interface
export interface OpenAPIParseApiResponse
  extends ApiObjectResponse<OpenAPIParseResponse> {}

// get MCP server list params interface
export interface GetMCPServiceListParams {
  page: number;
  page_size: number;
  search?: string;
  status?: string;
}

// get MCP server detail params interface
export interface GetMCPServiceDetailParams {
  id: string;
}

// OpenAPI parse params interface
export interface ParseOpenAPIParams {
  file?: File;
  url?: string;
}

// OpenAPI parse for update params interface
export interface ParseOpenAPIUpdateParams {
  file?: File;
  url?: string;
  id: string; // 服务ID，用于更新
}

/**
 * get MCP server list
 */
export const getMCPServiceList = async (
  params: GetMCPServiceListParams
): Promise<MCPServiceListApiResponse> => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    page_size: params.page_size.toString(),
    ...(params.search && { search: params.search }),
    ...(params.status && { status: params.status }),
  });

  const response = await fetchAdminAPI<MCPService[]>(
    `/api/mcp/service/list?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );

  // ensure the response format is ApiArrayResponse
  return {
    ...response,
    page: response.page || { page: 1, page_size: 10, total: 0 },
  } as MCPServiceListApiResponse;
};

/**
 * get MCP server detail
 */
export const getMCPServiceDetail = async (
  params: GetMCPServiceDetailParams
): Promise<MCPServiceDetailApiResponse> => {
  const queryParams = new URLSearchParams({
    id: params.id,
  });

  const response = await fetchAdminAPI<MCPService>(
    `/api/mcp/service/info?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );

  return response as MCPServiceDetailApiResponse;
};

/**
 * save MCP server (create or update)
 */
export const saveMCPService = async (
  formData: MCPServiceFormData
): Promise<boolean> => {
  const response = await fetchAdminAPI("/api/mcp/service", {
    method: "PUT",
    body: formData as unknown as BodyInit,
  });
  if (!response.success) {
    toast.error(response.error_message || i18n.t("Failed to update server"));
    return false;
  }
  toast.success(i18n.t("Server updated successfully"));
  return true;
};

/**
 * delete MCP server
 */
export const deleteMCPService = async (id: string): Promise<boolean> => {
  const response = await fetchAdminAPI("/api/mcp/service", {
    method: "DELETE",
    body: { id } as unknown as string,
  });

  if (!response.success) {
    toast.error(response.error_message || i18n.t("Failed to delete server"));
    return false;
  }
  toast.success(i18n.t("Server deleted successfully"));
  return true;
};

/**
 * 切换MCP服务状态（启用/禁用）
 */
export const toggleMCPServiceStatus = async (
  id: string,
  enabled: number
): Promise<boolean> => {
  const response = await fetchAdminAPI("/api/mcp/service/enabled", {
    method: "PUT",
    body: {
      id,
      enabled,
    } as unknown as string,
  });

  if (!response.success) {
    toast.error(
      response.error_message || i18n.t("Failed to toggle service status")
    );
    return false;
  }
  toast.success(i18n.t("Server status toggled successfully"));
  return true;
};

/**
 * parse OpenAPI document
 */
export const parseOpenAPIDocument = async (
  params: ParseOpenAPIParams,
  apiPath?: string
): Promise<OpenAPIParseApiResponse> => {
  const formData = new FormData();

  if (params.file) {
    formData.append("file", params.file);
  }
  if (params.url) {
    formData.append("url", params.url);
  }

  const response = await fetchAdminAPI<OpenAPIParseResponse>(
    apiPath || "/api/mcp/openapi_parse",
    {
      method: "POST",
      body: formData,
      // do not set Content-Type, let browser set multipart/form-data boundary
    }
  );
  if (!response.success) {
    toast.error(response.error_message || "Failed to parse OpenAPI document");
  }

  return response as OpenAPIParseApiResponse;
};

/**
 * parse OpenAPI document for update
 */
export const parseOpenAPIDocumentForUpdate = async (
  params: ParseOpenAPIUpdateParams,
  apiPath?: string
): Promise<ApiObjectResponse<MCPService>> => {
  const formData = new FormData();

  if (params.file) {
    formData.append("file", params.file);
  }
  if (params.url) {
    formData.append("url", params.url);
  }
  formData.append("id", params.id);

  const response = await fetchAdminAPI<MCPService>(
    apiPath || "/api/mcp/openapi_parse_update",
    {
      method: "POST",
      body: formData,
      // do not set Content-Type, let browser set multipart/form-data boundary
    }
  );
  if (!response.success) {
    toast.error(
      response.error_message || "Failed to parse OpenAPI document for update"
    );
  }

  return response as ApiObjectResponse<MCPService>;
};
