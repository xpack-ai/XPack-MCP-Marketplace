"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useMCPServicesList } from "@/hooks/useMCPServicesList";
import { MCPService, MCPServiceFormData } from "@/shared/types/mcp-service";
import { useTranslation } from "@/shared/lib/useTranslation";

import { ServiceFiltersBar } from "@/shared/components/mcp-services/ServiceFiltersBar";
import { ServiceEditPage } from "@/components/mcp-services/ServiceEditPage";
import { DeleteConfirmModal } from "@/shared/components/modal/DeleteConfirmModal";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import { ServiceTable } from "@/shared/components/mcp-services/ServiceTable";
import { OpenAPIGeneratorModal } from "@/shared/components/mcp-services/OpenAPIGeneratorModal";
import { Input } from "@nextui-org/react";
import { Search } from "lucide-react";

type ViewMode = "list" | "edit" | "create";

export const MCPServicesManagement: React.FC = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const {
    services,
    loading,
    pagination,
    onPageChange,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    parseOpenAPIDocument,
    loadServices,
    setSearchTerm,
    setStatusFilter,
  } = useMCPServicesList();
  const [addServiceType, setAddServiceType] = useState<string | null>(null);

  // 搜索相关状态
  const [searchValue, setSearchValue] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Get initial state from URL
  const getInitialViewMode = (): ViewMode => {
    const mode = searchParams.get("mode") as ViewMode;
    if (mode && ["list", "edit", "create"].includes(mode)) {
      return mode;
    }
    return "list";
  };

  const getInitialServiceId = (): string | null => {
    return searchParams.get("serviceId");
  };

  // View states
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    getInitialServiceId
  );

  // Update URL when view mode or service ID changes
  const updateURL = useCallback(
    (mode: ViewMode, serviceId?: string | null) => {
      const params = new URLSearchParams(searchParams);

      // Always keep the tab parameter
      params.set("tab", "mcp-services");

      if (mode === "list") {
        params.delete("mode");
        params.delete("serviceId");
      } else {
        params.set("mode", mode);
        if (serviceId) {
          params.set("serviceId", serviceId);
        } else {
          params.delete("serviceId");
        }
      }

      window.history.pushState({}, "", `/admin/console?${params.toString()}`);
    },
    [searchParams]
  );

  // Sync state with URL on mount and URL changes
  useEffect(() => {
    const mode = getInitialViewMode();
    const serviceId = getInitialServiceId();

    setViewMode(mode);
    setSelectedServiceId(serviceId);
  }, [searchParams]);

  // Modal states
  const [isOpenAPIModalOpen, setIsOpenAPIModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<MCPService | null>(
    null
  );

  // Server CRUD operations
  const handleCreateService = (type: string) => {
    setAddServiceType(type);
    setIsOpenAPIModalOpen(true);
  };

  const handleEditService = useCallback(
    (service: MCPService) => {
      setSelectedServiceId(service.id);
      setViewMode("edit");
      updateURL("edit", service.id);
    },
    [updateURL]
  );

  const handleSaveService = useCallback(
    async (formData: MCPServiceFormData, isDraft?: boolean) => {
      try {
        const result = selectedServiceId
          ? await updateService(selectedServiceId, formData)
          : await createService(formData);
        if (!result) return false;
        if (isDraft) {
          return true;
        }
        setViewMode("list");
        setSelectedServiceId(null);
        updateURL("list");
        return true;
      } catch (error) {
        console.error("Failed to save server:", error);
        return false;
      }
    },
    [selectedServiceId, updateService, createService, updateURL]
  );

  const handleCancelEdit = useCallback(() => {
    setViewMode("list");
    setSelectedServiceId(null);
    updateURL("list");
  }, [updateURL]);

  const handleDeleteService = useCallback((service: MCPService) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (serviceToDelete) {
      try {
        await deleteService(serviceToDelete.id);
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
      } catch (error) {
        console.error("Failed to delete server:", error);
      }
    }
  }, [serviceToDelete, deleteService]);

  const handleToggleStatus = useCallback(
    async (serviceId: string) => {
      try {
        await toggleServiceStatus(serviceId);
      } catch (error) {
        console.error("Failed to toggle server status:", error);
      }
    },
    [toggleServiceStatus]
  );

  const handleEditGeneratedService = useCallback(
    async (serviceId: string) => {
      try {
        // set serviceId directly and switch to edit mode
        setSelectedServiceId(serviceId);
        setViewMode("edit");
        updateURL("edit", serviceId);
        setIsOpenAPIModalOpen(false);
        loadServices(1);
      } catch (error) {
        console.error("Failed to navigate to generated server:", error);
      }
    },
    [updateURL]
  );

  // Modal close handlers
  const handleCloseOpenAPIModal = useCallback(() => {
    setIsOpenAPIModalOpen(false);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setServiceToDelete(null);
  }, []);

  // 处理搜索 - 使用防抖
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    
    // 清除之前的定时器
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    // 设置新的定时器，500ms 后触发搜索
    searchTimerRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 500);
  }, [setSearchTerm]);

  // 处理状态筛选
  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
  }, [setStatusFilter]);

  // Render edit page if in edit/create mode
  if (viewMode === "edit" || viewMode === "create") {
    return (
      <ServiceEditPage
        serviceId={selectedServiceId || undefined}
        onSave={handleSaveService}
        onCancel={handleCancelEdit}
        loading={loading}
        onUnpublish={handleToggleStatus}
        onRefreshList={() => {
          loadServices(1);
        }}
      />
    );
  }

  return (
    <DashboardDemoContent
      title={t("MCP")}
      description={t(
        "Manage your MCP servers, configure APIs, and monitor server status"
      )}
    >
      <div className="space-y-6 w-full">
        {/* Filters and Actions */}
        <div className="flex justify-between items-center gap-4">
          <ServiceFiltersBar onAddService={handleCreateService} />
          
          {/* 搜索框 - 右侧 */}
          <Input
            isClearable
            className="w-full sm:max-w-[400px]"
            placeholder={t('Search by service name')}
            startContent={<Search className="w-4 h-4" />}
            value={searchValue}
            onClear={() => {
              setSearchValue('');
              if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
              }
              setSearchTerm('');
            }}
            onValueChange={handleSearchChange}
          />
        </div>

        {/* Servers Table */}
        <ServiceTable
          services={services}
          loading={loading}
          pagination={pagination}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
          onToggleStatus={handleToggleStatus}
          onPageChange={onPageChange}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {/* Modals */}
        {isOpenAPIModalOpen && (
          <OpenAPIGeneratorModal
            isOpen={true}
            onClose={handleCloseOpenAPIModal}
            onGenerate={parseOpenAPIDocument}
            onEditGenerated={handleEditGeneratedService}
            serverType={addServiceType || "openapi"}
          />
        )}

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title={t("Confirm Delete")}
          description={t(
            'Are you sure you want to delete this "{{name}}" server?',
            {
              name: serviceToDelete?.name || "",
            }
          )}
        />
      </div>
    </DashboardDemoContent>
  );
};
