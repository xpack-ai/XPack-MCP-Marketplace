"use client";

import React, { useState, useEffect } from 'react';
import {
  Button,
  Tabs,
  Tab,
  Spinner,
} from '@nextui-org/react';
import { ChevronLeftIcon } from 'lucide-react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { AuthMethod, MCPServiceFormData } from '@/types/mcp-service';
import { useMCPServiceDetail } from "@/hooks/useMCPServiceDetail";
import { BasicInfoTab } from './BasicInfoTab';
import { PricingTab } from './PricingTab';
import { DescriptionTab } from './DescriptionTab';
import { ToolsTab } from './ToolsTab';
import { OpenAPIGeneratorModal } from './OpenAPIGeneratorModal';
import { ChargeType } from '@/shared/types/marketplace';
const _DefaultFormData: MCPServiceFormData = {
  id: '',
  name: '',
  short_description: '',
  long_description: '',
  base_url: '',
  auth_method: AuthMethod.None,
  auth_header: '',
  auth_token: '',
  charge_type: ChargeType.Free,
  price: '',
  enabled: 0,
  tags: [],
  apis: []
}

interface ServiceEditPageProps {
  serviceId?: string;
  onSave: (data: MCPServiceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ServiceEditPage: React.FC<ServiceEditPageProps> = ({
  serviceId,
  onSave,
  onCancel,
  loading = false
}) => {
  const { t } = useTranslation();
  const isEditing = !!serviceId;

  // use detail hook to get service detail
  const {
    serviceDetail: service,
    detailLoading: dataLoading,
    getServiceDetail,
    clearServiceDetail
  } = useMCPServiceDetail();

  // use services list hook for OpenAPI update
  const { parseOpenAPIDocumentForUpdate, updateLoading } = useMCPServiceDetail();

  const [formData, setFormData] = useState<MCPServiceFormData>(_DefaultFormData);
  const [newTag, setNewTag] = useState('');

  // OpenAPI modal state
  const [isOpenAPIModalOpen, setIsOpenAPIModalOpen] = useState(false);

  // get service detail
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
    if (!serviceId || !service) return
    setFormData({
      ...formData,
      ...service
    });

  }, [service, serviceId]);

  const handleInputChange = (field: keyof MCPServiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleAddTag = () => {
    if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  // OpenAPI update handlers
  const handleOpenAPIUpdate = () => {
    setIsOpenAPIModalOpen(true);
  };

  const handleCloseOpenAPIModal = () => {
    setIsOpenAPIModalOpen(false);
  };

  const handleOpenAPIGenerate = async (url?: string, file?: File): Promise<{ service_id: string }> => {
    if (!serviceId) {
      throw new Error('Service ID is required for update');
    }

    try {
      const updatedService = await parseOpenAPIDocumentForUpdate(serviceId, url, file);

      // update form data
      setFormData({
        ...formData,
        ...updatedService,
        update_type: 'openapi'
      });

      // close modal
      setIsOpenAPIModalOpen(false);

      // return service_id format to compatible with OpenAPIGeneratorModal
      return { service_id: updatedService.id };
    } catch (error) {
      console.error('OpenAPI update failed:', error);
      throw error;
    }
  };


  const isFormValid = () => {
    const hasBasicInfo = formData.name.trim() && formData.short_description?.trim();

    // if free, no need to validate price
    if (formData.charge_type === ChargeType.Free) {
      return hasBasicInfo;
    }

    // if paid, need to validate price
    return hasBasicInfo &&
      formData.price !== undefined &&
      formData.price.trim() !== '';
  };

  return (
    <div className="w-full py-8 h-full flex flex-col">
      {/* page title */}
      <div className="flex items-center justify-between mb-6 px-8">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            onPress={onCancel}
            variant='flat'
            size='sm'
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? t('Service Detail') : t('Create New Service')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* only show OpenAPI update button in edit mode */}
          {isEditing && (
            <Button
              onPress={handleOpenAPIUpdate}
              isDisabled={loading || dataLoading || updateLoading}
              isLoading={updateLoading}
              size='sm'
            >
              {t('Update from OpenAPI')}
            </Button>
          )}
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!isFormValid() || loading || dataLoading || updateLoading}
            isLoading={updateLoading}
            size='sm'
          >
            {t('Save')}
          </Button>
        </div>
      </div>

      {/* loading state */}
      {dataLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-gray-600">{t('Loading service data...')}</p>
          </div>
        </div>
      )}

      {/* form content */}
      {!dataLoading && (
        <Tabs
          aria-label="Service edit tabs"
          variant='bordered'
          color='primary'
          classNames={{
            panel: "flex-1 overflow-y-auto px-8"
          }}
          className=' px-8'
        >
          <Tab key="basic" title={t('Basic Information')}>
            <div className="pt-2 flex gap-4">
              <div className='flex-1'>
                <BasicInfoTab
                  formData={formData}
                  newTag={newTag}
                  setNewTag={setNewTag}
                  onInputChange={handleInputChange}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                />
              </div>
              <div className='w-[400px] max-w-[1/2]'>
                <PricingTab
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              </div>
            </div>
          </Tab>

          <Tab key="tools" title={t('Tools Management')}>
            <div className="pt-2">
              <ToolsTab
                formData={formData}
                onInputChange={handleInputChange}
              />
            </div>
          </Tab>

          <Tab key="description" title={t('Detailed Description')} >
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
      {
        isOpenAPIModalOpen && (
          <OpenAPIGeneratorModal
            isOpen={true}
            onClose={handleCloseOpenAPIModal}
            onGenerate={handleOpenAPIGenerate}
            mode="update"
          />
        )
      }
    </div>
  );
};