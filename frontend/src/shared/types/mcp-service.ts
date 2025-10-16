import { ChargeType } from "@/shared/types/marketplace";

export enum AuthMethod {
  None = "none",
  APIKey = "apikey",
  BearerToken = "token",
}

export enum EnabledEnum {
  Offline = 0,
  Online = 1,
}
export enum SourceType {
  Manual = "manual",
  Imported = "imported",
}
export interface MCPAuthHeaderItem {
  name: string;
  value: string;
  description?: string;
}
// API data interface, match OpenAPI specification
export interface BaseMCPService {
  id: string;
  name: string;
  short_description: string;
  long_description?: string;
  charge_type: ChargeType;
  price?: string;
  input_token_price?: string;
  output_token_price?: string;
  apis: MCPServiceAPIItem[];
  tags?: string[];
}
export interface MCPService extends BaseMCPService {
  base_url: string;
  slug_name?: string; // Server ID, affects MCP access URL
  auth_method: AuthMethod;
  auth_header?: string;
  auth_token?: string;
  enabled: EnabledEnum; // 0: offline, 1: online
  source_type?: SourceType; // manual or imported
  headers?: MCPAuthHeaderItem[]; // headers to be sent with the request
  service_type?: string; // server type: openapi, webscraper, etc.
  [key: string]: any;
}

export interface MCPServiceAPIItem {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

// form data interface, used to create and edit service
export interface MCPServiceFormData {
  id?: string; // edit needed
  name: string;
  slug_name?: string; // Server ID, affects MCP access URL
  short_description: string;
  long_description?: string;
  base_url: string;
  auth_method: AuthMethod;
  auth_header?: string;
  auth_token?: string;
  charge_type: ChargeType;
  price?: string;
  input_token_price?: string; // Price for input tokens when charge_type is PerToken
  output_token_price?: string; // Price for output tokens when charge_type is PerToken
  enabled: EnabledEnum; // API requires string type
  apis: MCPServiceAPIItem[];
  headers?: MCPAuthHeaderItem[]; // add headers to form data
  tags?: string[];
  update_type?: string; // 用于标识更新类型，如 "openapi"
  source_type?: SourceType; // manual or imported
  server_config?: string; // server config in JSON format
  [key: string]: any;
}

// OpenAPI generator data interface
export interface OpenAPIGeneratorData {
  url?: string;
  file?: File;
}

// OpenAPI parse response interface
export interface OpenAPIParseResponse {
  service_id: string;
}

// server filter interface
export interface ServiceFilters {
  search: string;
  status: string;
}

// server stats interface
export interface ServiceStats {
  total: number;
  online: number;
  offline: number;
}

// server enable/disable request interface
export interface ServiceEnabledRequest {
  id: string;
  enabled: EnabledEnum; // 0: offline, 1: online
}

// delete server request interface
export interface ServiceDeleteRequest {
  id: string;
}

// tool function: convert frontend form data to API data
export function convertFormToAPI(
  formData: MCPServiceFormData
): Omit<MCPService, "id"> & { update_type?: string } {
  return {
    name: formData.name,
    short_description: formData.short_description,
    long_description: formData.long_description,
    base_url: formData.base_url,
    auth_method: formData.auth_method,
    auth_header: formData.auth_header,
    auth_token: formData.auth_token,
    charge_type: formData.charge_type,
    price: formData.price,
    input_token_price: formData.input_token_price,
    output_token_price: formData.output_token_price,
    enabled: formData.enabled,
    apis: formData.apis,
    headers: formData.headers,
    tags: formData.tags,
    update_type: formData.update_type,
  };
}
