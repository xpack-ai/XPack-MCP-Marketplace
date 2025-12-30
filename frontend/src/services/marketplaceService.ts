import { fetchAPI } from "../shared/rpc/common-function";
import { ServiceData } from "@/shared/types/marketplace";
import { BaseMCPService } from "@/shared/types/mcp-service";

// Types that match the API responses

interface ServicesResponse {
  data: ServicesResponseData;
  page: {
    page: number;
    page_size: number;
    total: number;
  };
}

interface FetchServicesParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  tag?: string;
}
interface ServicesResponseData {
  services: ServiceData[];
}
const _BasePageDetail = {
  page: 1,
  page_size: 50,
  total: 0,
};
const convertMcpService = (services: BaseMCPService[]): ServiceData[] => {
  return services.map((service) => ({
    ...service,
    service_id: service.id,
    tools: service.apis,
  }));
};

/**
 * Fetch all services from the API
 */
export async function fetchServices(
  params: FetchServicesParams = {
    page_size: _BasePageDetail.page_size,
    page: _BasePageDetail.page,
    keyword: "",
    tag: "",
  }
): Promise<ServicesResponse> {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.page_size)
    queryParams.append("page_size", params.page_size.toString());
  if (params.keyword) queryParams.append("keyword", params.keyword);
  if (params.tag) queryParams.append("tag", params.tag);
  const response = await fetchAPI<BaseMCPService[]>(
    `/api/web/mcp_services${queryParams.toString() ? "?" + queryParams.toString() : ""}`
  );

  if (!response.success) {
    console.error("Failed to fetch servers:", response.error_message);
    return {
      data: {
        services: [],
      },
      page: _BasePageDetail,
    };
  }

  return {
    data: {
      services: convertMcpService(response.data),
    },
    page: response.page || _BasePageDetail,
  };
}

/**
 * Fetch a single server by ID
 */
export async function fetchServiceById(
  serviceId: string
): Promise<ServiceData | null> {
  const response = await fetchAPI<BaseMCPService>(
    `/api/web/mcp_service_info?id=${serviceId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.success) {
    console.error(
      `Failed to fetch server ${serviceId}:`,
      response.error_message
    );
    return null;
  }

  return convertMcpService([response.data])[0];
}


/**
 * Fetch tags list
 */
export async function fetchTagsList(
): Promise<string[] | []> {
  const response = await fetchAPI<string[]>(
    `/api/web/mcp_tags`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.success) {
    return [];
  }

  return response.data || []
}
