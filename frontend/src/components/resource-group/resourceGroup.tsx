"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import GroupList, { ResourceGroup } from "./GroupList";
import GroupServiceTable, { GroupService } from "./GroupServiceTable";
import { AddServerModal } from "./AddServerModal";
import { DeleteServerModal } from "./DeleteServerModal";
import { Divider, Select, SelectItem } from "@nextui-org/react";
import { useResourceGroups } from "@/hooks/useResourceGroups";
import { AddMcpServerModal } from "./AddMcpServerModal";
import toast from "react-hot-toast";

const ResourceGroupManagement: React.FC = () => {
  const { t } = useTranslation();

  // 使用自定义 Hook 管理资源组
  const {
    groups,
    simpleResourceGroups,
    loadSimpleResourceGroups,
    groupServices,
    serviceTablePagination,
    serviceTableParams,
    loading,
    servicesLoading,
    hasMore,
    shouldScrollToTop,
    setShouldScrollToTop,
    loadGroupServices,
    loadMoreGroups,
    handleServicePageChange,
    handleAddServiceToGroup,
    handleCreateGroup: createGroup,
    handleUpdateGroup: updateGroup,
    handleDeleteGroup: deleteGroup,
    handleRemoveService: removeService,
  } = useResourceGroups();

  // 当前选中的资源组
  const [selectedGroup, setSelectedGroup] = useState<ResourceGroup | null>(null);

  // 删除组确认模态框
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ResourceGroup | null>(null);
  const [transferToGroupId, setTransferToGroupId] = useState<string | null>(null);
  const [simpleResourceGroupsLoading, setSimpleResourceGroupsLoading] = useState(false);

  // 删除服务确认模态框
  const [isDeleteServiceModalOpen, setIsDeleteServiceModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<GroupService | null>(null);

  // 创建/编辑组模态框
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ResourceGroup | null>(null);

  // 添加 MCP 服务模态框
  const [isAddMcpServerModalOpen, setIsAddMcpServerModalOpen] = useState(false);

  // 刷新触发器，用于触发 GroupServiceTable 刷新
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [newGroupId, setNewGroupId] = useState<string | null>(null);

  /**
   * 保存 MCP 服务
   * @param serverIds 服务ID列表
   * @returns 是否保存成功
   */
  const handleSaveMcpServer = async (serverIds: string[]) => {
    if (!selectedGroup) return;
    
    const success = await handleAddServiceToGroup(selectedGroup.id, serverIds);
    if (success) {
      setIsAddMcpServerModalOpen(false);
      await loadGroupServices(selectedGroup.id, 1, serviceTableParams.current.pageSize, serviceTableParams.current.keyword);
    }
  };

  // 初始化选中第一个组，或在滚动到顶部时选中第一个
  useEffect(() => {
    if (groups.length > 0 && (shouldScrollToTop || !selectedGroup)) {
      const index = shouldScrollToTop && newGroupId ? groups.findIndex((group) => group.id === newGroupId) : 0;
      setSelectedGroup(groups[index]);
      loadGroupServices(groups[index].id);
    }
  }, [groups, selectedGroup, loadGroupServices, shouldScrollToTop]);

  // 选择组
  const handleSelectGroup = (group: ResourceGroup) => {
    setSelectedGroup(group);
    loadGroupServices(group.id);
  };

  // 创建新组
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  };

  // 保存组(创建或编辑)
  const handleSaveGroup = async (name: string, isDefault: boolean) => {
    // 去除首尾空格
    const trimmedName = name.trim();

    // 验证保留名称（不区分大小写）
    const reservedNames = ['allow all', 'deny all'];
    if (reservedNames.some(reserved => reserved.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error(t('Resource group name "{{name}}" is reserved and cannot be used', { name: trimmedName }));
      return;
    }

    // 验证名称是否重复
    const isDuplicate = groups.some(group => {
      // 编辑时排除当前组
      if (editingGroup && group.id === editingGroup.id) {
        return false;
      }
      return group.name.toLowerCase() === trimmedName.toLowerCase();
    });

    if (isDuplicate) {
      toast.error(t('Resource group name "{{name}}" already exists', { name: trimmedName }));
      return;
    }

    let success = false;

    if (editingGroup) {
      // 编辑现有组
      success = await updateGroup(editingGroup.id, trimmedName, isDefault);
      if (success && selectedGroup?.id === editingGroup.id) {
        setSelectedGroup({ ...selectedGroup, name: trimmedName, isDefault });
        // 触发 GroupServiceTable 刷新
        setRefreshTrigger(prev => prev + 1);
      }
    } else {
      // 创建新组
      const newGroupId = await createGroup(trimmedName, isDefault);
      success = !!newGroupId;
      if (newGroupId) {
        setNewGroupId(newGroupId);
      }
    }

    if (success) {
      setIsGroupModalOpen(false);
      setEditingGroup(null);
    }
  };

  // 编辑组
  const handleEditGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setEditingGroup(group);
      setIsGroupModalOpen(true);
    }
  };

  // 删除组
  const handleDeleteGroup = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setSimpleResourceGroupsLoading(true);
      const simpleResourceGroups = await loadSimpleResourceGroups();
      setTransferToGroupId(simpleResourceGroups.filter((group) => group.id !== groupId)[0].id);
      setSimpleResourceGroupsLoading(false);
      setGroupToDelete(group);
      setIsDeleteGroupModalOpen(true);
    }
  };

  // 确认删除组
  const handleConfirmDeleteGroup = async () => {
    if (groupToDelete && transferToGroupId) {
      // 在删除前找到要选中的目标组
      let targetGroup: ResourceGroup | null = null;
      if (selectedGroup?.id === groupToDelete.id) {
        const currentIndex = groups.findIndex((g) => g.id === groupToDelete.id);
        if (currentIndex !== -1) {
          // 优先选择上一个，如果没有上一个则选择下一个
          if (currentIndex > 0) {
            targetGroup = groups[currentIndex - 1];
          } else if (currentIndex < groups.length - 1) {
            targetGroup = groups[currentIndex + 1];
          }
          // 如果既没有上一个也没有下一个（只有一个元素），targetGroup 保持为 null
        }
      }

      const success = await deleteGroup(groupToDelete.id, transferToGroupId);

      if (success) {
        // 等待列表刷新后选中目标组
        setTimeout(() => {
          if (groups.length === 0) {
            // 删除后没有任何资源组了
          setSelectedGroup(null);
          } else if (targetGroup) {
            // 在新列表中找到目标组（因为列表已经刷新了）
            const newTarget = groups.find((g) => g.id === targetGroup.id);
            if (newTarget) {
              setSelectedGroup(newTarget);
              loadGroupServices(newTarget.id);
            } else {
              // 如果目标组不存在了，选择第一个
              setSelectedGroup(groups[0]);
              loadGroupServices(groups[0].id);
            }
          } else if (selectedGroup?.id === groupToDelete.id) {
            // 如果删除的是当前选中的组，且没有找到目标组（理论上不应该发生）
            setSelectedGroup(groups[0]);
            loadGroupServices(groups[0].id);
          }
          // 如果删除的不是当前选中的组，保持原有选中状态
        }, 200);

        setIsDeleteGroupModalOpen(false);
        setGroupToDelete(null);
        setTransferToGroupId(null);
      }
    }
  };

  // 添加服务到组
  const handleAddService = () => {
    setIsAddMcpServerModalOpen(true);
  };

  // 从组中移除服务
  const handleRemoveService = (serviceId: string) => {
    const service = groupServices.find((s) => s.id === serviceId);
    if (service) {
      setServiceToDelete(service);
      setIsDeleteServiceModalOpen(true);
    }
  };

  // 确认删除服务
  const handleConfirmDeleteService = async () => {
    if (serviceToDelete && selectedGroup) {
      const success = await removeService(selectedGroup.id, serviceToDelete.id);

      if (success) {
        setIsDeleteServiceModalOpen(false);
        setServiceToDelete(null);
        await loadGroupServices(selectedGroup.id, 1, serviceTableParams.current.pageSize, serviceTableParams.current.keyword);
      }
    }
  };

  return (
    <DashboardDemoContent
      title={t("Resource Group")}
      description={t("Manage your resource group. Each user has a resource group and can only access resources within their resource group")}
    >
      <div className="flex border-1 border-gray-200 rounded-lg items-stretch overflow-hidden h-full">
        {/* 左侧组列表 */}
        <GroupList
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={handleCreateGroup}
          onLoadMore={loadMoreGroups}
          hasMore={hasMore}
          loading={loading}
          shouldScrollToTop={shouldScrollToTop}
          onScrolledToTop={() => setShouldScrollToTop(false)}
        />
        <Divider orientation="vertical" className="h-auto" />
        {/* 右侧服务列表 */}
        {selectedGroup ? (
          <GroupServiceTable
            groupId={selectedGroup.id}
            services={groupServices}
            loading={servicesLoading}
            pagination={serviceTablePagination}
            onPageChange={(page) => handleServicePageChange(selectedGroup.id, page)}
            onAddService={handleAddService}
            onRemoveService={handleRemoveService}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-default-400">
            {t("Please select a group to view services")}
          </div>
        )}
      </div>

      {/* 删除资源组模态框 */}
      <DeleteServerModal
        isOpen={isDeleteGroupModalOpen}
        onClose={() => {
          setIsDeleteGroupModalOpen(false);
          setGroupToDelete(null);
          setTransferToGroupId(null);
        }}
        onConfirm={handleConfirmDeleteGroup}
        title={t("Confirm Remove")}
        description={t(
          'Are you sure you want to remove this "{{name}}" Resource Group?',
          {
            name: groupToDelete?.name || "",
          }
        )}
        alertDescription={t("The bound users have been transferred to the following resource group")}
        customAlertContent={<div className="w-full mt-[10px]">
          <Select
            placeholder={t("Select resource group")}
            isLoading={simpleResourceGroupsLoading}
            selectedKeys={transferToGroupId ? [transferToGroupId] : simpleResourceGroups.length > 0 ? [simpleResourceGroups.filter((group) => group.id !== groupToDelete?.id)[0].id] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              if (selectedKey) {
                setTransferToGroupId(selectedKey);
              }
            }}
            labelPlacement="outside"
          >
            {simpleResourceGroups.filter((group) => group.id !== groupToDelete?.id).map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </Select>
        </div>}
      />

      {/* 删除服务模态框 */}
      <DeleteServerModal
        isOpen={isDeleteServiceModalOpen}
        onClose={() => {
          setIsDeleteServiceModalOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleConfirmDeleteService}
        title={t("Confirm Remove")}
        description={t(
          'Are you sure you want to remove this "{{name}}" mcp server from "{{groupName}}" resource group?',
          {
            name: serviceToDelete?.name || "",
            groupName: selectedGroup?.name || "",
          }
        )}
        alertDescription={t("Users associated with this resource group will not be able to call the removed MCP server")}
      />
      {/* 创建/编辑组模态框 */}
      <AddServerModal
        isOpen={isGroupModalOpen}
        onClose={() => {
          setIsGroupModalOpen(false);
          setEditingGroup(null);
        }}
        name={editingGroup?.name || ""}
        id={editingGroup?.id || ""}
        isDefault={editingGroup?.isDefault || false}
        onSaveServer={handleSaveGroup}
        type={editingGroup ? "edit" : "add"}
      />
      <AddMcpServerModal
        id={selectedGroup?.id || ""}
        isOpen={isAddMcpServerModalOpen}
        onClose={() => {
          setIsAddMcpServerModalOpen(false);
        }}
        onSaveMcpServer={handleSaveMcpServer}
      />
    </DashboardDemoContent>
  );
};

export default ResourceGroupManagement;