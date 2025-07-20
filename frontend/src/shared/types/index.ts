export enum SourceType {
  ContentPanel = "ContentPanel",
  WebTool = "WebTool",
  SSG = "SSG",
}

// 基础API响应接口
export interface BaseApiResponse {
  code: string;
  error_message?: string;
  success: boolean;
}

// 数组响应接口 (用于列表接口)
export interface ApiArrayResponse<T = any> extends BaseApiResponse {
  data: T[];
  page: {
    page: number;
    page_size: number;
    total: number;
  };
}

// 对象响应接口 (用于单个对象接口)
export interface ApiObjectResponse<T = any> extends BaseApiResponse {
  data: T;
}

// 通用API响应接口 (保持向后兼容)
export interface ApiResponse<T = any> extends BaseApiResponse {
  data: T;
  page?: {
    page: number;
    page_size: number;
    total: number;
  };
}
