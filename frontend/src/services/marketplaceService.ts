import { fetchAPI } from "../shared/rpc/common-function";
import { getApiUrl } from "../shared/rpc/adapter";
import { MOCK_SERVICES } from "../shared/data/services.mock";
import { ServiceData } from "@/shared/types/marketplace";
import { BaseMCPService } from "@/types/mcp-service";

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
  },
  isMock: boolean = false
): Promise<ServicesResponse> {
  if (isMock) {
    return {
      data: {
        services: MOCK_SERVICES,
      },
      page: _BasePageDetail,
    };
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.page_size)
    queryParams.append("page_size", params.page_size.toString());
  if (params.keyword) queryParams.append("keyword", params.keyword);

  const url = `/api/web/mcp_services${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
  const response = await fetchAPI<BaseMCPService[]>(getApiUrl(url));

  if (!response.success) {
    console.error("Failed to fetch services:", response.error_message);
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
 * Fetch a single service by ID
 */
export async function fetchServiceById(
  serviceId: string
): Promise<ServiceData | null> {
  const response = await fetchAPI<BaseMCPService>(
    getApiUrl(`/api/web/mcp_service_info?id=${serviceId}`),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.success) {
    console.error(
      `Failed to fetch service ${serviceId}:`,
      response.error_message
    );
    return null;
  }

  return convertMcpService([response.data])[0];
}
