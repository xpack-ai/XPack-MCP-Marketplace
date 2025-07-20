"use client";

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Tabs,
  Tab,
  Progress
} from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { OpenAPIParseResponse } from '@/types/mcp-service';
import { Upload, Link, Loader2 } from 'lucide-react';

interface OpenAPIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (url?: string, file?: File) => Promise<OpenAPIParseResponse>;
  onEditGenerated?: (serviceId: string) => void;
  mode?: 'create' | 'update';
}

export const OpenAPIGeneratorModal: React.FC<OpenAPIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  onEditGenerated,
  mode = 'create'
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'url') {
        if (!url.trim()) {
          setError(t('Please enter a valid URL'));
          return;
        }
        const data = await onGenerate(url);
        // if generate success and has service_id, directly jump to edit page
        if (data.service_id) {
          onEditGenerated?.(data.service_id);
          handleClose();
          return;
        }
      } else {
        if (!file) {
          setError(t('Please select a file'));
          return;
        }
        const data = await onGenerate(undefined, file);
        // if generate success and has service_id, directly jump to edit page
        if (data.service_id) {
          onEditGenerated?.(data.service_id);
          handleClose();
          return;
        }
      }
    } catch (err) {
      setError(t('Failed to parse OpenAPI document'));
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    setUrl('');
    setFile(null);
    setError('');
    setLoading(false);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
    >
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {mode === 'update' ? t('Sync from OpenAPI') : t('Add Service')}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div>
            <p className="text-gray-600 mb-4">
              {mode === 'update'
                ? t('Sync service configuration from OpenAPI/Swagger documentation')
                : t('Generate MCP service configuration from OpenAPI/Swagger documentation')
              }
            </p>

            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              className="w-full"
            >
              <Tab
                key="url"
                title={
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    {t('From URL')}
                  </div>
                }
              >
                <Input
                  label={t('OpenAPI URL')}
                  placeholder={t("Enter the URL to your OpenAPI/Swagger specification")}
                  value={url}
                  onValueChange={setUrl}
                />
              </Tab>

              <Tab
                key="file"
                title={
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {t('Upload File')}
                  </div>
                }
              >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    {file ? file.name : t('Upload OpenAPI File')}
                  </p>
                  <input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onChange={handleFileChange}
                    className="hidden"
                    id="openapi-file"
                  />
                  <label
                    htmlFor="openapi-file"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    {t('Choose File')}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    {t("Supports JSON and YAML formats")}
                  </p>
                </div>
              </Tab>
            </Tabs>
            {loading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t('Parsing OpenAPI document...')}</span>
                </div>
                <Progress
                  size="sm"
                  isIndeterminate
                  color="primary"
                  className="w-full"
                />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            {t('Cancel')}
          </Button>
          <Button
            color="primary"
            onPress={handleGenerate}
            isLoading={loading}
            isDisabled={
              (activeTab === 'url' && !url.trim()) ||
              (activeTab === 'file' && !file)
            }
          >
            {mode === 'update' ? t('Sync Service') : t('Generate Service')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};