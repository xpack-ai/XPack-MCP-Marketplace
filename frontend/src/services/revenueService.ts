import { ApiArrayResponse } from "@/shared/types";
import { RevenueRecord } from "@/types/revenue";
import { fetchAdminAPI } from "@/rpc/admin-api";

// revenue list API response interface (according to API document xpack-response-array format)
export interface RevenueListApiResponse
  extends ApiArrayResponse<RevenueRecord> {}

// get revenue list params interface
export interface GetRevenueListParams {
  page: number;
  page_size: number;
  start_date?: string;
  end_date?: string;
  user_id?: string;
  search?: string;
  status?: string;
  payment_type?: string; // 付款方式筛选
  sort_by?: string; // 排序字段
  sort_order?: 'asc' | 'desc'; // 排序顺序
}

/**
 * get revenue list
 */
export const getRevenueList = async (
  params: GetRevenueListParams
): Promise<RevenueListApiResponse> => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    page_size: params.page_size.toString(),
    ...(params.start_date && { start_date: params.start_date }),
    ...(params.end_date && { end_date: params.end_date }),
    ...(params.user_id && { user_id: params.user_id }),
    ...(params.search && { keyword: params.search }),
    ...(params.status && { status: params.status }),
    ...(params.payment_type && { filter_payment_type: params.payment_type }),
    ...(params.sort_by === 'amount' && params.sort_order && { sort_amount: params.sort_order }),
  });

  const response = await fetchAdminAPI<RevenueRecord[]>(
    `/api/order/list?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );

  // ensure the response format is ApiArrayResponse
  return {
    ...response,
    page: response.page || { page: 1, page_size: 10, total: 0 },
  } as RevenueListApiResponse;
};
