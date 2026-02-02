import { SimpleMcpService } from "@/components/resource-group/AddMcpServerModal";
import { GroupService } from "@/components/resource-group/GroupServiceTable";
import { fetchAdminAPI } from "@/rpc/admin-api";
import { toast } from "react-hot-toast";
import i18n from "@/shared/lib/i18n";

export interface ResourceGroupResponse {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  service_count: number;
  create_at: string;
}

export interface ResourceGroupDetailResponse {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  update_at: number;
  create_at: string;
}
export interface ResourceGroupListResponse {
  data: ResourceGroupResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface GroupServiceListResponse {
  data: GroupService[];
  total: number;
  page: number;
  page_size: number;
}

export interface SimpleMcpServiceListResponse {
  data: SimpleMcpService[];
  total: number;
  page: number;
  page_size: number;
}


export const fetchResourceGroupDetail = async (groupId: string): Promise<ResourceGroupDetailResponse | null> => {
  try {
    const response = await fetchAdminAPI<ResourceGroupDetailResponse>(`/api/resource_group/info?id=${groupId}`);
    if (!response.success) {
      toast.error(response.error_message || i18n.t("Failed to load resource group detail"));
      return null;
    }
    return response.data || null;
  } catch (error) {
    console.error("Error fetching resource group detail:", error);
    return null;  
  }
};
/**
 * 获取资源组列表
 */
export const fetchResourceGroups = async (page: number, page_size: number, keyword: string): Promise<ResourceGroupListResponse> => {
  try {
    const response = await fetchAdminAPI<ResourceGroupResponse[]>(`/api/resource_group/list?page=${page}&page_size=${page_size}&keyword=${keyword}`);
    if (!response.success) {
      toast.error(response.error_message || i18n.t("Failed to load resource groups"));
      return {
        data: [],
        total: 0,
        page,
        page_size,
      };
    }
    return {
      data: response.data || [],
      total: response.page?.total || 0,
      page: response.page?.page || page,
      page_size: response.page?.page_size || page_size,
    };
  } catch (error) {
    console.error("Error fetching auth keys:", error);
    return {
      data: [],
      total: 0,
      page,
      page_size,
    };
  }
};
/**
 * 获取简易资源组列表
 */
export const fetchSimpleResourceGroups = async (): Promise<{ id: string, name: string }[]> => {
  try {
    const response = await fetchAdminAPI<{ id: string, name: string }[]>(`/api/resource_group/list/simple`);
    if (!response.success) {
      toast.error(response.error_message || i18n.t("Failed to load simple resource groups"));
      return []
    }
    return response.data || []
  } catch (error) {
    console.error("Error fetching auth keys:", error);
    return []
  }
};

/**
 * 修改用户资源组
 */
export const updateUserResourceGroup = async (userId: string, resourceGroupId: string): Promise<boolean> => {
  try {
  const response = await fetchAdminAPI<boolean>(`/api/user_manager/resource_group`, {
    method: "PUT",
    body: { user_id: userId, resource_group: resourceGroupId } as unknown as BodyInit,
  });
  if (!response.success) {
    toast.error(response.error_message || i18n.t("Failed to update user resource group"));
    return false;
  }
    return true;
  } catch (error) {
    console.error("Error updating user resource group:", error);
    return false
  }
};

/**
 * 获取指定资源组下的服务列表
 */
export const fetchGroupServices = async (id: string,page: number, page_size: number, keyword: string): Promise<GroupServiceListResponse> => {
  try {
    const response = await fetchAdminAPI<GroupService[]>(`/api/resource_group/service/list?id=${id}&page=${page}&page_size=${page_size}&keyword=${keyword}`);
    if (!response.success) {
      toast.error(response.error_message || i18n.t("Failed to fetch group services"));
      return {
        data: [],
        total: 0,
        page,
        page_size,
      };
    }
    return {
      data: response.data || [],
      total: response.page?.total || 0,
      page: response.page?.page || page,
      page_size: response.page?.page_size || page_size,
    };
  } catch (error) {
    console.error("Error fetching auth keys:", error);
    return {
      data: [],
      total: 0,
      page,
      page_size,
    };
  }
};

/**
 * 获取简易指定资源组下的服务列表
 */
export const fetchSimpleMcpServices = async (id: string): Promise<SimpleMcpService[]> => {
  try {
    const response = await fetchAdminAPI<SimpleMcpService[]>(`/api/resource_group/service/list/unbind?id=${id}`);
    if (!response.success) {
      toast.error(response.error_message || i18n.t("Failed to fetch simple mcp services"));
      return []
    }
    return response.data || []
  } catch (error) {
    console.error("Error fetching auth keys:", error);
    return []
  }
};

/**
 * 创建资源组
 */
export const createResourceGroup = async (name: string, isDefault: boolean): Promise<{success: boolean, id: string}> => {
  try {
    const response = await fetchAdminAPI<{id: string}>(`/api/resource_group`, {
      method: "POST",
      body: { name: name, is_default: isDefault } as unknown as BodyInit,
    });
    if (!response.success) {
      const errorMsg = response.error_message
      if (errorMsg?.endsWith('already exists')) {
        toast.error(i18n.t(errorMsg, { name: name }));
      } else if(errorMsg?.endsWith('cannot be used')) {
        toast.error(i18n.t(errorMsg, { name: name }));
      } else {
        toast.error(errorMsg || i18n.t("Failed to create resource group"));
      }
      return {
        success: false,
        id: "",
      };
    }
    return {
      success: true,
      id: response.data?.id || "",
    };
  } catch {
    return {
      success: false,
      id: "",
    };
  }
};

/**
 * 更新资源组
 */
export const updateResourceGroup = async (
  groupId: string,
  name: string,
  isDefault: boolean
): Promise<boolean> => {
  try {
    const response = await fetchAdminAPI<boolean>(`/api/resource_group?id=${groupId}`, {
      method: "PUT",
      body: { name: name, is_default: isDefault } as unknown as BodyInit,
    });
    if (!response.success) {
      const errorMsg = response.error_message
      if (errorMsg?.endsWith('already exists')) {
        toast.error(i18n.t(errorMsg, { name: name }));
      } else if(errorMsg?.endsWith('cannot be used')) {
        toast.error(i18n.t(errorMsg, { name: name }));
      } else {
        toast.error(errorMsg || i18n.t("Failed to update resource group"));
      }
      return false;
    }
    return true;
  } catch {
    return false
  }
};

/**
 * 删除资源组
 */
export const deleteResourceGroup = async (
  groupId: string,
  transferToGroupId: string
): Promise<boolean> => {
  try {
    const response = await fetchAdminAPI<boolean>(`/api/resource_group?id=${groupId}&migrate_id=${transferToGroupId}`, {
      method: "DELETE"
    });
    if (!response.success) {
      toast.error(response.error_message || i18n.t("Failed to delete resource group"));
      return false;
    }
    return true;
  } catch {
    return false
  }
};

/**
 * 从资源组中移除服务
 */
export const removeServiceFromGroup = async (
  groupId: string,
  serviceIds: string[]
): Promise<boolean> => {
  try {
    const response = await fetchAdminAPI<boolean>(`/api/resource_group/service?id=${groupId}`, {
      method: "DELETE",
      body: { services: serviceIds } as unknown as BodyInit,
    });
    if (!response.success) {
      toast.error(response.error_message || i18n.t("Failed to remove service from group"));
      return false;
    }
    return true;
  } catch {
    return false
  }
};

/**
 * 添加服务到资源组
 */
export const addServiceToGroup = async (
  groupId: string,
  services: string[]
): Promise<boolean> => {
  try {
    const response = await fetchAdminAPI<boolean>(`/api/resource_group/service?id=${groupId}`, {
      method: "PUT",
      body: { services: services } as unknown as BodyInit,
    });
    if (!response.success) {
      toast.error(response.error_message || i18n.t("Failed to add service to group"));
      return false;
    }
    return true;
  } catch {
    return false
  }
};

