"use client";

import { useState, useCallback } from "react";
import { MCPService } from "@/shared/types/mcp-service";
import {
  GetMCPResourceGroupsParams,
  getMCPServiceDetail,
  parseOpenAPIDocumentForUpdate as parseOpenAPIDocumentForUpdateAPI,
  fetchMCPResourceGroups as fetchMCPResourceGroupsAPI,
  deleteResourceGroup as deleteResourceGroupAPI,
  addServiceToGroup as addServiceToGroupAPI,
  fetchUnboundResourceGroups as fetchUnboundResourceGroupsAPI,
} from "@/services/mcpService";

export const useMCPServiceDetail = () => {
  const [serviceDetail, setServiceDetail] = useState<MCPService | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // get server detail
  const getServiceDetail = useCallback(
    async (serviceId: string): Promise<MCPService | null> => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const response = await getMCPServiceDetail({ id: serviceId });

        if (response.success && response.data) {
          setServiceDetail(response.data);
          return response.data;
        } else {
          setDetailError(
            response.error_message || "Failed to load server detail"
          );
          setServiceDetail(null);
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load server detail";
        setDetailError(errorMessage);
        setServiceDetail(null);
        console.error("Get server detail error:", err);
        return null;
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  // clear server detail
  const clearServiceDetail = useCallback(() => {
    setServiceDetail(null);
    setDetailError(null);
  }, []);

  // parse OpenAPI document for update
  const parseOpenAPIDocumentForUpdate = useCallback(
    async (
      serviceId: string,
      url?: string,
      file?: File,
      apiPath?: string
    ): Promise<MCPService> => {
      setUpdateLoading(true);
      setUpdateError(null);

      try {
        const response = await parseOpenAPIDocumentForUpdateAPI(
          {
            id: serviceId,
            file,
            url,
          },
          apiPath
        );

        if (response.success && response.data) {
          // Update the server detail with the new data
          setServiceDetail(response.data);
          return response.data;
        } else {
          throw new Error(
            response.error_message ||
            "Failed to parse OpenAPI document for update"
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to parse OpenAPI document for update";
        setUpdateError(errorMessage);
        throw err;
      } finally {
        setUpdateLoading(false);
      }
    },
    []
  );

  /**
   * 获取资源组列表
   * @param page 页码
   * @param page_size 每页条数
   * @param keyword 关键词
   * @returns 资源组列表
   */
  const fetchMCPResourceGroups = useCallback(async (id: string, page: number, page_size: number, keyword: string): Promise<GetMCPResourceGroupsParams> => {
    const response = await fetchMCPResourceGroupsAPI(id, page, page_size, keyword);
    return response;
  }, []);

  /**
   * 删除资源组
   * @param serviceById 服务ID
   * @param resourceGroupId 资源组ID
   * @returns 是否删除成功
   */
  const deleteResourceGroup = useCallback(async (serviceById: string, resourceGroupId: string[]): Promise<boolean> => {
    const response = await deleteResourceGroupAPI(serviceById, resourceGroupId);
    return response;
  }, []);

  /**
   * 添加服务到资源组
   * @param groupId 资源组ID
   * @param serverIds 服务ID列表
   * @returns 是否添加成功
   */
  const addServiceToGroup = useCallback(async (groupId: string, serverIds: string[]): Promise<boolean> => {
    const response = await addServiceToGroupAPI(groupId, serverIds);
    return response;
  }, []);

  return {
    serviceDetail,
    detailLoading,
    detailError,
    updateLoading,
    updateError,
    getServiceDetail,
    clearServiceDetail,
    parseOpenAPIDocumentForUpdate,
    fetchMCPResourceGroups,
    deleteResourceGroup,
    addServiceToGroup
  };
};
