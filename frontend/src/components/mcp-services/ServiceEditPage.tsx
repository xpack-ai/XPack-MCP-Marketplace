"use client";

import React, { useState, useEffect } from "react";
import { Button, Tabs, Tab, Spinner } from "@nextui-org/react";
import { ChevronLeftIcon } from "lucide-react";
import { useTranslation } from "@/shared/lib/useTranslation";
import {
  AuthMethod,
  EnabledEnum,
  MCPServiceFormData,
} from "@/shared/types/mcp-service";
import { useMCPServiceDetail } from "@/hooks/useMCPServiceDetail";
import { BasicInfoTab } from "@/shared/components/mcp-services/BasicInfoTab";
import { PricingTab } from "@/shared/components/mcp-services/PricingTab";
import { DescriptionTab } from "@/shared/components/mcp-services/DescriptionTab";
import { ToolsTab } from "@/shared/components/mcp-services/ToolsTab";
import { OpenAPIGeneratorModal } from "@/shared/components/mcp-services/OpenAPIGeneratorModal";
import { ChargeType } from "@/shared/types/marketplace";
import { withComponentInjection } from "@/shared/hooks/useComponentInjection";

const _DefaultFormData: MCPServiceFormData = {
  id: "",
  name: "",
  short_description: "",
  long_description: "",
  base_url: "",
  auth_method: AuthMethod.None,
  auth_header: "",
  auth_token: "",
  charge_type: ChargeType.Free,
  price: "",
  enabled: 0,
  tags: [],
  apis: [],
};

interface ServiceEditPageProps {
  serviceId?: string;
  onSave: (data: MCPServiceFormData, isDraft?: boolean) => void;
  onCancel: () => void;
  loading?: boolean;
  onUnpublish?: (serviceId: string) => void;
  onRefreshList?: () => void;
}

const BaseServiceEditPage: React.FC<ServiceEditPageProps> = ({
  serviceId,
  onSave,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();
  const isEditing = !!serviceId;

  // use detail hook to get service detail
  const {
    serviceDetail: service,
    detailLoading: dataLoading,
    getServiceDetail,
    clearServiceDetail,
    parseOpenAPIDocumentForUpdate,
    updateLoading,
  } = useMCPServiceDetail();
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const [formData, setFormData] =
    useState<MCPServiceFormData>(_DefaultFormData);
  const [newTag, setNewTag] = useState("");

  // OpenAPI modal state
  const [isOpenAPIModalOpen, setIsOpenAPIModalOpen] = useState(false);

  // get server detail
  useEffect(() => {
    if (serviceId) {
      getServiceDetail(serviceId);
    }

    // when component unmount, clear detail
    return () => {
      clearServiceDetail();
    };
  }, [serviceId, getServiceDetail, clearServiceDetail]);

  // when service data loaded, fill form
  useEffect(() => {
    if (!serviceId || !service) return;
    setFormData({
      ...formData,
      ...service,
    });
  }, [service, serviceId]);

  const handleInputChange = (field: keyof MCPServiceFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (enabled?: EnabledEnum) => {
    // Check if slug_name has been modified
    const isSlugNameChanged =
      isEditing &&
      service?.slug_name &&
      formData.slug_name !== service.slug_name;

    if (isSlugNameChanged) {
      const confirmed = window.confirm(
        t(
          "You have modified the Server ID. This will affect the MCP access URL and may break existing integrations. Are you sure you want to continue?"
        )
      );
      if (!confirmed) {
        return;
      }
    }

    // Proceed with save
    setIsSaving(true);
    const isDraft =
      service?.enabled === EnabledEnum.Offline && enabled === undefined;
    setIsDraft(isDraft);
    await onSave(
      {
        ...formData,
        headers: formData.headers?.filter((header) => header.name !== ""),
        ...(enabled !== undefined ? { enabled } : {}),
      },
      isDraft
    );
    setIsSaving(false);
    setIsDraft(false);
  };

  // OpenAPI update handlers
  const handleOpenAPIUpdate = () => {
    setIsOpenAPIModalOpen(true);
  };

  const handleCloseOpenAPIModal = () => {
    setIsOpenAPIModalOpen(false);
  };

  const handleOpenAPIGenerate = async (
    url?: string,
    file?: File
  ): Promise<{ service_id: string }> => {
    if (!serviceId) {
      throw new Error("Server ID is required for update");
    }

    try {
      const updatedService = await parseOpenAPIDocumentForUpdate(
        serviceId,
        url,
        file
      );

      // update form data
      setFormData({
        ...formData,
        ...updatedService,
        update_type: "openapi",
      });

      // close modal
      setIsOpenAPIModalOpen(false);

      // return service_id format to compatible with OpenAPIGeneratorModal
      return { service_id: updatedService.id };
    } catch (error) {
      console.error("OpenAPI update failed:", error);
      throw error;
    }
  };

  const isFormValid = () => {
    const hasBasicInfo =
      formData.name.trim() &&
      formData.short_description?.trim() &&
      formData.slug_name?.trim();

    // if free, no need to validate price
    if (formData.charge_type === ChargeType.Free) {
      return hasBasicInfo;
    }

    // if paid, need to validate price
    return (
      hasBasicInfo &&
      formData.price !== undefined &&
      formData.price.trim() !== ""
    );
  };

  return (
    <div className="w-full py-8 h-full flex flex-col">
      {/* page title */}
      <div className="flex items-center justify-between mb-6 px-8">
        <div className="flex items-center gap-3">
          <Button isIconOnly onPress={onCancel} variant="flat" size="sm">
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? t("Server Detail") : t("Create New Server")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* only show OpenAPI update button in edit mode */}
          {isEditing && (
            <Button
              onPress={handleOpenAPIUpdate}
              isDisabled={loading || dataLoading || updateLoading}
              isLoading={updateLoading}
              size="sm"
            >
              {t("Update from OpenAPI")}
            </Button>
          )}
          <Button
            color="primary"
            onPress={() => handleSubmit()}
            isDisabled={
              !isFormValid() || loading || dataLoading || updateLoading
            }
            isLoading={
              isSaving && (isDraft || service?.enabled !== EnabledEnum.Offline)
            }
            size="sm"
          >
            {service?.enabled === EnabledEnum.Offline
              ? t("Save Draft")
              : t("Save")}
          </Button>
          {service?.enabled === EnabledEnum.Offline && (
            <Button
              color="success"
              onPress={() => handleSubmit(EnabledEnum.Online)}
              isDisabled={
                !isFormValid() || loading || dataLoading || updateLoading
              }
              isLoading={isSaving && !isDraft}
              size="sm"
            >
              {t("Publish")}
            </Button>
          )}
        </div>
      </div>

      {/* loading state */}
      {dataLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-gray-600">{t("Loading server data...")}</p>
          </div>
        </div>
      )}

      {/* form content */}
      {!dataLoading && (
        <Tabs
          aria-label="Server edit tabs"
          variant="bordered"
          color="primary"
          classNames={{
            panel: "flex-1 overflow-y-auto px-8",
          }}
          className=" px-8"
        >
          <Tab key="basic" title={t("Basic Information")}>
            <div className="pt-2 flex gap-4">
              <div className="flex-1">
                <BasicInfoTab
                  formData={formData}
                  newTag={newTag}
                  setNewTag={setNewTag}
                  onInputChange={handleInputChange}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                />
              </div>
              <div className="w-[400px] max-w-[1/2]">
                <PricingTab
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              </div>
            </div>
          </Tab>

          <Tab key="tools" title={t("Tools Management")}>
            <div className="pt-2">
              <ToolsTab formData={formData} onInputChange={handleInputChange} />
            </div>
          </Tab>

          <Tab key="description" title={t("Detailed Description")}>
            <div className="pt-2 h-full">
              <DescriptionTab
                formData={formData}
                onInputChange={handleInputChange}
              />
            </div>
          </Tab>
        </Tabs>
      )}

      {/* OpenAPI Generator Modal */}
      {isOpenAPIModalOpen && (
        <OpenAPIGeneratorModal
          isOpen={true}
          onClose={handleCloseOpenAPIModal}
          onGenerate={handleOpenAPIGenerate}
          mode="update"
        />
      )}
    </div>
  );
};
export const ServiceEditPage = withComponentInjection(
  "components/mcp-services/ServiceEditPage",
  BaseServiceEditPage
);
