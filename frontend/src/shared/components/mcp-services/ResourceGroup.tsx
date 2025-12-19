"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Spinner,
  Pagination,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Calendar, Plus, Trash2, HelpCircle, Eye } from "lucide-react";
import { MCPServiceFormData } from "@/shared/types/mcp-service";
import toast from "react-hot-toast";

import { GetMCPResourceGroupsParams } from "@/services/mcpService";
import DeleteServerModal from "@/components/resource-group/DeleteServerModal";
import { McpAddGroupModal } from "../modal/McpAddGroup";
import ResourceGroupDetailModal from "../modal/ResourceGroupDetailModal";

// 组内服务类型定义
export interface ResourceGroup {
  id: string;
  name: string;
  join_at: string;
}

interface ResourceGroupProps {
  deleteResourceGroup: (serviceById: string, resourceGroupId: string[]) => Promise<boolean>;
  fetchMCPResourceGroups: (id: string, page: number, page_size: number, keyword: string) => Promise<GetMCPResourceGroupsParams>;
  addServiceToGroup: (groupId: string, serverIds: string[]) => Promise<boolean>;
  formData: MCPServiceFormData;
}

const ResourceGroup: React.FC<ResourceGroupProps> = ({
  deleteResourceGroup,
  fetchMCPResourceGroups,
  addServiceToGroup,
  formData
}) => {
  const { t } = useTranslation();
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const resourceGroupsParams = useRef({
    page: 1,
    pageSize: 10,
    keyword: "",
  });
  const [isDeleteResourceGroupModalOpen, setIsDeleteResourceGroupModalOpen] = useState(false);
  const [resourceGroupToDelete, setResourceGroupToDelete] = useState<ResourceGroup | null>(null);

  // 资源组详情模态框
  const [isResourceGroupDetailModalOpen, setIsResourceGroupDetailModalOpen] = useState(false);
  const [resourceGroupDetailId, setResourceGroupDetailId] = useState<string | null>(null);
  // 添加 MCP 服务模态框
  const [isAddMcpGroupModalOpen, setIsAddMcpGroupModalOpen] = useState(false);

  /**
   * 加载资源组列表
   */
  const loadResourceGroups = useCallback(async (
    page: number = 1,
    pageSize: number = 10,
    keyword: string = ""
  ) => {
    setLoading(true);
    try {
      const response = await fetchMCPResourceGroups(formData?.id || "", page, pageSize, keyword);
      setResourceGroups(response.data);
      setPagination({
        page: response.page,
        pageSize: response.page_size,
        total: response.total,
      });
      // 保存当前的 pageSize 和 keyword 到 ref
      resourceGroupsParams.current = {
        page: response.page,
        pageSize: response.page_size,
        keyword
      };
    } catch (error) {
      console.error(t("Failed to load group services"), error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onAddService = () => {
    setIsAddMcpGroupModalOpen(true);
  }

  const formatDate = (dateString: string) => {
    return (
      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3 text-gray-500" />
        <span className="text-sm text-gray-600">
          {new Date(dateString).toLocaleString()}
        </span>
      </div>
    );
  };

  // 保存 MCP 服务
  const handleSaveMcpServer = async (serverIds: string[]) => {
    if (!formData?.id) return;

    const success = await addServiceToGroup(formData?.id, serverIds);
    if (success) {
      setIsAddMcpGroupModalOpen(false);
      await loadResourceGroups(1, resourceGroupsParams.current.pageSize, resourceGroupsParams.current.keyword);
    }
  };
  /**
   * 确认删除资源组
   */
  const handleConfirmDeleteResourceGroup = async () => {
    const result = await deleteResourceGroup(formData?.id || "", [resourceGroupToDelete?.id || ""]);
    if (result) {
      loadResourceGroups(1, 10, "");
      setIsDeleteResourceGroupModalOpen(false);
      setResourceGroupToDelete(null);
      toast.success(t("Resource group deleted successfully"));
    } else {
      setIsDeleteResourceGroupModalOpen(false);
      setResourceGroupToDelete(null);
    }
  }

  /**
   * 删除资源组
   * @param groupId 删除资源组
   */
  const onRemoveResourceGroup = async (groupId: string) => {
    const group = resourceGroups.find((group) => group.id === groupId);
    if (group) {
      setResourceGroupToDelete(group);
      setIsDeleteResourceGroupModalOpen(true);
    }
  }
  const onPageChange = (page: number) => {
    const { pageSize, keyword } = resourceGroupsParams.current;
    loadResourceGroups(page, pageSize, keyword);
  }

  const openResourceGroupPage = (group: ResourceGroup) => {
    setResourceGroupDetailId(group.id);
    setIsResourceGroupDetailModalOpen(true);
  }

  useEffect(() => {
    loadResourceGroups(1, 10, "");
  }, [loadResourceGroups]);

  const pages = Math.ceil(pagination.total / pagination.pageSize);
  const currentPage = Number(pagination.page);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Button
              color="primary"
              onPress={onAddService}
              startContent={<Plus size={16} />}
              size="sm"
            >
              {t("Add to Groups")}
            </Button>
          </div>

          <div className="flex gap-2"></div>
        </div>

        <Table
          aria-label="Group services table"
          removeWrapper
          classNames={{
            wrapper: "min-h-[400px]",
          }}
          bottomContent={
            pages > 1 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  showControls
                  variant="light"
                  color="primary"
                  page={currentPage}
                  total={pages}
                  onChange={onPageChange}
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn>{t("Group Name")}</TableColumn>
            <TableColumn>
              <div className="flex items-center gap-1">
                <span>{t("Added Time")}</span>
                <Tooltip
                  content={t("Current display time is UTC time")}
                  color="default"
                  closeDelay={0}
                  disableAnimation
                >
                  <HelpCircle className="w-4 h-4" />
                </Tooltip>
              </div>
            </TableColumn>
            <TableColumn className="w-20">{t("Actions")}</TableColumn>
          </TableHeader>
          <TableBody
            items={resourceGroups}
            isLoading={loading}
            loadingContent={<Spinner />}
            emptyContent={t("No services in this group")}
          >
            {(group) => (
              <TableRow key={group.id}>
                <TableCell>
                  <span className="text-sm">{group.name}</span>
                </TableCell>
                <TableCell>
                  {formatDate(group.join_at)}
                </TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-2">
                    <Tooltip
                      content={t("View Resource Group Detail")}
                      color="primary"
                      closeDelay={0}
                      disableAnimation
                    >
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => openResourceGroupPage(group)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      content={t("Remove")}
                      color="danger"
                      closeDelay={0}
                      disableAnimation
                    >
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => onRemoveResourceGroup(group.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* 删除服务模态框 */}
      <DeleteServerModal
        isOpen={isDeleteResourceGroupModalOpen}
        onClose={() => {
          setIsDeleteResourceGroupModalOpen(false);
          setResourceGroupToDelete(null);
        }}
        onConfirm={handleConfirmDeleteResourceGroup}
        title={t("Confirm Remove")}
        description={t(
          'Are you sure you want to remove this "{{name}}" mcp server from "{{groupName}}" resource group?',
          {
            name: resourceGroupToDelete?.name || "",
            groupName: formData?.name || "",
          }
        )}
        alertDescription={t("Users associated with this resource group will not be able to call the removed MCP server")}
      />
      <McpAddGroupModal
        id={formData.id || ""}
        isOpen={isAddMcpGroupModalOpen}
        onClose={() => {
          setIsAddMcpGroupModalOpen(false);
        }}
        onSaveMcpServer={handleSaveMcpServer}
      />
      <ResourceGroupDetailModal
        groupId={resourceGroupDetailId || ""}
        isOpen={isResourceGroupDetailModalOpen}
        onClose={() => {
          setIsResourceGroupDetailModalOpen(false);
        }}
      />
    </>
  );
};

export default ResourceGroup

