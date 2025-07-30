import { ApiArrayResponse, ApiObjectResponse } from "@/shared/types";
import { User } from "@/types/user";
import { fetchAdminAPI } from "@/rpc/admin-api";
import toast from "react-hot-toast";
import i18n from "@/shared/lib/i18n";
import { md5Encrypt, sha256Encrypt } from "@/shared/utils/crypto";

// user list API response interface (according to API document xpack-response-array format)
export interface UserListApiResponse extends ApiArrayResponse<User> {}

// delete user API response interface (according to API document xpack-response-object format)
export interface DeleteUserApiResponse extends ApiObjectResponse<{}> {}

// get user list params interface
export interface GetUserListParams {
  page: number;
  page_size: number;
  search?: string;
  status?: string;
}

/**
 * get user list
 */
export const getUserList = async (
  params: GetUserListParams
): Promise<UserListApiResponse> => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    page_size: params.page_size.toString(),
    ...(params.search && { search: params.search }),
    ...(params.status && { status: params.status }),
  });

  const response = await fetchAdminAPI<User[]>(
    `/api/user_manager/account/list?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );

  // ensure the response format is ApiArrayResponse
  return {
    ...response,
    page: response.page || { page: 1, page_size: 10, total: 0 },
  } as UserListApiResponse;
};

/**
 * delete user
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  const response = await fetchAdminAPI(
    `/api/user_manager/account?id=${userId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.success) {
    toast.error(response.error_message || i18n.t("Failed to delete user"));
    return false;
  }
  toast.success(i18n.t("User deleted successfully"));
  return true;
};

/**
 * recharge user balance
 */
export const rechargeUser = async (
  userId: string,
  amount: number
): Promise<boolean> => {
  // Create request body
  const body = {
    user_id: userId,
    balance: amount,
    type: "incr",
  };

  // Generate timestamp
  const timestamp = Date.now().toString();

  // Generate signature: sha256(md5((x-xpack-timestamp){body}))
  // For this implementation, we're using a simplified approach
  // In a real implementation, you would use actual crypto functions
  const bodyString = JSON.stringify(body);
  const signature = sha256Encrypt(md5Encrypt(`${timestamp}${bodyString}`));
  const response = await fetchAdminAPI(`/api/user_manager/balance/recharge`, {
    method: "POST",
    headers: {
      "x-xpack-timestamp": timestamp,
      "x-xpack-sign": signature,
    },
    body: body as unknown as BodyInit,
  });

  if (!response.success) {
    toast.error(response.error_message || i18n.t("Failed to recharge user"));
    return false;
  }
  toast.success(i18n.t("User recharged successfully"));
  return true;
};
