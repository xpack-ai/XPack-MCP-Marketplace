import { useState, useEffect, useCallback, useRef } from "react";
import { ResourceGroup } from "@/components/resource-group/GroupList";
import { GroupService } from "@/components/resource-group/GroupServiceTable";
import {
  fetchResourceGroups,
  fetchGroupServices,
  createResourceGroup,
  updateResourceGroup,
  deleteResourceGroup,
  removeServiceFromGroup,
  fetchSimpleResourceGroups,
  addServiceToGroup,
} from "@/api/resourceGroup.api";
import { toast } from "react-hot-toast";
import { useTranslation } from "@/shared/lib/useTranslation";


export const useResourceGroups = () => {
  const [groups, setGroups] = useState<ResourceGroup[]>([]);
  const [groupServices, setGroupServices] = useState<GroupService[]>([]);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false);
  const { t } = useTranslation();

  const [simpleResourceGroups, setSimpleResourceGroups] = useState<{ id: string, name: string }[]>([]);
  
  // 菜单列表（GroupList）的分页和搜索状态
  const groupListParams = useRef({
    page: 1,
    pageSize: 10,
    keyword: ""
  });

  // 服务列表（GroupServiceTable）的分页状态
  const [serviceTablePagination, setServiceTablePagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const serviceTableParams = useRef({
    pageSize: 10,
    keyword: ""
  });

  // 加载资源组列表（支持初始加载和追加加载）
  const loadGroups = useCallback(async (page: number, page_size: number, search_keyword: string, append: boolean = false) => {
    setLoading(true);
    try {
      groupListParams.current = {
        page,
        pageSize: page_size,
        keyword: search_keyword
      };
      
      const response = await fetchResourceGroups(page, page_size, search_keyword);
      const mappedData = response.data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        isDefault: item.is_default,
        serviceCount: item.service_count,
        createdAt: item.create_at,
      }));
      
      if (append) {
        // 追加模式：将新数据追加到现有数据后面
        setGroups((prev) => {
          const newGroups = [...prev, ...mappedData];
          setHasMore(newGroups.length < response.total);
          return newGroups;
        });
      } else {
        // 重置模式：替换所有数据
        setGroups(mappedData);
        setHasMore(mappedData.length < response.total);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载更多资源组（追加数据）
  const loadMoreGroups = useCallback(async () => {
    if (loading || !hasMore) return;
    
    const { page, pageSize, keyword } = groupListParams.current;
    await loadGroups(page + 1, pageSize, keyword, true);
  }, [loading, hasMore, loadGroups]);

  // 加载指定组的服务列表（支持分页）
  const loadGroupServices = useCallback(async (
    groupId: string,
    page: number = 1,
    pageSize: number = 10,
    keyword: string = ""
  ) => {
    setServicesLoading(true);
    try {
      const response = await fetchGroupServices(groupId, page, pageSize, keyword);
      setGroupServices(response.data);
      setServiceTablePagination({
        page: response.page,
        pageSize: response.page_size,
        total: response.total,
      });
      // 保存当前的 pageSize 和 keyword 到 ref
      serviceTableParams.current = {
        pageSize: response.page_size,
        keyword
      };
    } catch (error) {
      console.error(t("Failed to load group services"), error);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // 创建资源组
  const handleCreateGroup = useCallback(
    async (name: string, isDefault: boolean): Promise<string> => {
      try {
        const result = await createResourceGroup(name, isDefault);
        if (!result.success) {
          return "";
        }
        // 创建成功后重新加载列表（重置到第1页）
        toast.success(t("Resource group created successfully"));
        const { pageSize, keyword } = groupListParams.current;
        await loadGroups(1, pageSize, keyword, false);
        // 触发滚动到顶部
        setShouldScrollToTop(true);
        return result.id;
      } catch {
        return "";
      }
    },
    [loadGroups]
  );

  // 更新资源组
  const handleUpdateGroup = useCallback(
    async (groupId: string, name: string, isDefault: boolean): Promise<boolean> => {
      try {
        const result = await updateResourceGroup(groupId, name, isDefault);
        if (!result) {
          return false;
        }
        // 更新成功后重新加载列表（重置到第1页）
        const { pageSize, keyword } = groupListParams.current;
        await loadGroups(1, pageSize, keyword, false);
        toast.success(t("Resource group updated successfully"));
        return true;
      } catch {
        return false;
      }
    },
    [loadGroups]
  );

  // 删除资源组
  const handleDeleteGroup = useCallback(
    async (groupId: string, transferToGroupId: string): Promise<boolean> => {
      try {
        const result = await deleteResourceGroup(groupId, transferToGroupId);
        if (!result) {
          return false;
        }
        // 删除成功后重新加载列表（重置到第1页）
        const { pageSize, keyword } = groupListParams.current;
        await loadGroups(1, pageSize, keyword, false);
        toast.success(t("Resource group deleted successfully"));
        return true;
      } catch {
        return false;
      }
    },
    [loadGroups]
  );

  // 服务列表翻页
  const handleServicePageChange = useCallback(
    async (groupId: string, page: number) => {
      await loadGroupServices(
        groupId,
        page,
        serviceTableParams.current.pageSize,
        serviceTableParams.current.keyword
      );
    },
    [loadGroupServices]
  );

  // 添加服务到组
  const handleAddServiceToGroup = useCallback(
    async (groupId: string, serviceIds: string[]): Promise<boolean> => {
      try {
        const success = await addServiceToGroup(groupId, serviceIds);
        if (!success) {
          return false;
        }
        toast.success(t("Services added successfully"));
        return true;
      } catch {
        return false;
      }
    },
    [loadGroupServices, serviceTablePagination.page]
  );

  // 从组中移除服务
  const handleRemoveService = useCallback(
    async (groupId: string, serviceId: string): Promise<boolean> => {
      try {
        const success = await removeServiceFromGroup(groupId, [serviceId]);
        if (!success) {
          return false;
        }
        toast.success(t("Service removed successfully"));
        return true;
      } catch {
        return false;
      }
    },
    [loadGroupServices, serviceTablePagination.page]
  );

  // 加载简单资源组列表（用于下拉选择）
  const loadSimpleResourceGroups = useCallback(async () => {
    try {
      const data = await fetchSimpleResourceGroups();
      setSimpleResourceGroups(data);
      return data
    } catch (error) {
      console.error("Failed to load simple resource groups:", error);
      return []
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadGroups(1, 10, "");
  }, [loadGroups]);

  return {
    groups,
    simpleResourceGroups,
    groupServices,
    serviceTablePagination,
    serviceTableParams,
    loading,
    servicesLoading,
    hasMore,
    shouldScrollToTop,
    setShouldScrollToTop,
    loadGroups,
    loadMoreGroups,
    loadGroupServices,
    loadSimpleResourceGroups,
    handleServicePageChange,
    handleAddServiceToGroup,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleRemoveService,
  };
};

