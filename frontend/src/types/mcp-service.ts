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

// API data interface, match OpenAPI specification
export interface BaseMCPService {
  id: string;
  name: string;
  short_description: string;
  long_description?: string;
  charge_type: ChargeType;
  price?: string;
  apis: MCPServiceAPIItem[];
  tags?: string[];
}
export interface MCPService extends BaseMCPService {
  base_url: string;
  auth_method: AuthMethod;
  auth_header?: string;
  auth_token?: string;
  enabled: EnabledEnum; // 0: offline, 1: online
}

export interface MCPServiceAPIItem {
  id: string;
  name: string;
  description?: string;
}

// form data interface, used to create and edit service
export interface MCPServiceFormData {
  id?: string; // edit needed
  name: string;
  short_description: string;
  long_description?: string;
  base_url: string;
  auth_method: AuthMethod;
  auth_header?: string;
  auth_token?: string;
  charge_type: ChargeType;
  price?: string;
  enabled: EnabledEnum; // API requires string type
  apis: MCPServiceAPIItem[];
  tags?: string[];
  update_type?: string; // 用于标识更新类型，如 "openapi"
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

// service filter interface
export interface ServiceFilters {
  search: string;
  status: string;
}

// service stats interface
export interface ServiceStats {
  total: number;
  online: number;
  offline: number;
}

// service enable/disable request interface
export interface ServiceEnabledRequest {
  id: string;
  enabled: EnabledEnum; // 0: offline, 1: online
}

// delete service request interface
export interface ServiceDeleteRequest {
  id: string;
}

// predefined auth methods
export const AUTH_METHODS = [
  { value: "free", label: "free" },
  { value: "apikey", label: "API key" },
] as const;

// predefined charge types
export const CHARGE_TYPES = [
  { value: "free", label: "free" },
  { value: "per_call", label: "per call" },
  { value: "per_token", label: "per token" },
] as const;

// predefined service categories
export const SERVICE_CATEGORIES = [
  "Web Services",
  "Database",
  "AI/ML",
  "Authentication",
  "Payment",
  "Communication",
  "Analytics",
  "Storage",
  "Security",
  "Development Tools",
  "Financial",
  "Logistics & Transportation",
  "E-commerce",
  "Social Media",
  "Content Management",
  "Other",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

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
    enabled: formData.enabled,
    apis: formData.apis,
    tags: formData.tags,
    update_type: formData.update_type,
  };
}
