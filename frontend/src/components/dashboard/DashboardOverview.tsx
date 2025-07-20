import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Spinner,
} from "@nextui-org/react";
import { Plus, InboxIcon } from "lucide-react";
import toast from "react-hot-toast";
import { APIKey } from "@/shared/types/api";
import { fetchAPI } from "@/shared/rpc/common-function";
import AuthKeysList from "./AuthKeysList";
import AuthKeyDetails from "./AuthKeyDetails";
import { APIKeyModal } from "./APIKeyModal";
import { DeleteConfirmModal } from "@/shared/components/modal/DeleteConfirmModal";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import { useTranslation } from "@/shared/lib/useTranslation";

const OverviewPage: React.FC = () => {
  const { t } = useTranslation();

  // Auth Keys related states
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<APIKey | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKey[] | null>(null);
  const [editingApiKey, setEditingApiKey] = useState<APIKey | null>(null);

  // fetch auth keys
  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAPI("/api/apikey/list");
      if (!response.success) {
        return;
      }
      setApiKeys(response.data || []);

      // if there are auth keys, select the first one as default
      if (response.data && response.data.length > 0) {
        setSelectedApiKey(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching auth keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  // create new auth key
  const handleNewKey = () => {
    openEditModal();
  };

  // edit auth key
  const handleEditKey = (key: APIKey) => {
    openEditModal(key);
  };

  // delete auth key
  const handleDeleteKey = async () => {
    if (!selectedApiKey) {
      return;
    }
    const apikey_id = selectedApiKey.apikey_id;
    const response = await fetchAPI("/api/apikey/info", {
      method: "DELETE",
      body: {
        apikey_id,
      } as unknown as BodyInit,
    });
    if (!response.success) {
      console.error("Error deleting key:", response.error_message);
      toast.error(t("Failed to delete"));
      return;
    }
    toast.success(t("Deleted successfully"));
    setIsDeleteModalOpen(false);

    const updatedKeys =
      apiKeys?.filter((key) => key.apikey_id !== apikey_id) || [];
    setApiKeys(updatedKeys);

    if (updatedKeys.length > 0) {
      setSelectedApiKey(updatedKeys[0]);
    } else {
      setSelectedApiKey(null);
    }
  };

  // select auth key
  const handleSelectKey = (key: APIKey) => {
    setSelectedApiKey(key);
  };

  // open edit auth key modal
  const openEditModal = (keyData?: APIKey) => {
    setEditingApiKey(keyData || null);
    setGeneratedKey(undefined);
    setIsKeyModalOpen(true);
  };

  // open delete auth key modal
  const openDeleteModal = (keyData: APIKey) => {
    setSelectedApiKey(keyData);
    setIsDeleteModalOpen(true);
  };

  // create auth key success callback
  const handleCreateKeySuccess = (keyData: APIKey) => {
    const newKeys = [...(apiKeys || []), keyData];
    setApiKeys(newKeys);
    setGeneratedKey(keyData.apikey);
    setSelectedApiKey(keyData);
  };

  // edit key success callback
  const handleEditKeySuccess = ({ name }: APIKey) => {
    if (!editingApiKey) return;
    const id = editingApiKey.apikey_id;
    const updatedKeys =
      apiKeys?.map((key) =>
        key.apikey_id === id
          ? {
            ...key,
            name,
          }
          : key
      ) || [];

    setApiKeys(updatedKeys);
    setSelectedApiKey({ ...editingApiKey, name });
    setEditingApiKey(null);
  };

  return (
    <DashboardDemoContent title="My Dashboard" description="Manage your integration and auth key">

      {/* Main Content */}
      {isLoading ? (
        <>
          <div className="flex items-center justify-center py-12 mt-20">
            <Spinner size="lg" color="default" />
          </div>
        </>
      ) : !apiKeys || apiKeys.length === 0 ? (
        <>
          <div className="w-full bg-default-100/50 h-full border-1 rounded-lg">
            <Card
              shadow="none"
              radius="none"
              className="bg-transparent flex flex-col h-full"
            >
              <CardHeader className="flex justify-between items-center px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("Auth Key")}
                </h2>
                <Button
                  size="sm"
                  color="primary"
                  startContent={<Plus size={16} />}
                  onPress={handleNewKey}
                >
                  {t("New")}
                </Button>
              </CardHeader>
              <Divider />
              <CardBody className="flex items-center justify-center">
                <InboxIcon size={96} className="text-gray-200" />
              </CardBody>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex border-1 border-gray-200 rounded-lg items-stretch overflow-hidden h-full">
          <AuthKeysList
            apiKeys={apiKeys}
            selectedApiKey={selectedApiKey}
            onNewKey={handleNewKey}
            onSelectKey={handleSelectKey}
          />
          <Divider orientation="vertical" className="h-auto" />
          <AuthKeyDetails
            selectedApiKey={selectedApiKey}
            onEditKey={handleEditKey}
            onDeleteKey={openDeleteModal}
          />
        </div>
      )}

      {/* modal */}
      <APIKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => {
          setIsKeyModalOpen(false);
          if (!apiKeys?.length) {
            setSelectedApiKey(null);
          }
          setGeneratedKey(undefined);
          setEditingApiKey(null);
        }}
        onSubmitSuccess={
          editingApiKey &&
            apiKeys?.some((k) => k.apikey_id === editingApiKey.apikey_id)
            ? handleEditKeySuccess
            : handleCreateKeySuccess
        }
        initialName={editingApiKey?.name}
        generatedKey={generatedKey}
        mode={
          editingApiKey &&
            apiKeys?.some((k) => k.apikey_id === editingApiKey.apikey_id)
            ? "edit"
            : "create"
        }
        id={editingApiKey?.apikey_id}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        onConfirm={handleDeleteKey}
        title={t("Delete Auth Key")}
        description={t('Are you sure you want to delete the "{{keyName}}" Auth key?', {
          keyName: selectedApiKey?.name || "",
        })}
      />
    </DashboardDemoContent>
  );
};

export default OverviewPage;
