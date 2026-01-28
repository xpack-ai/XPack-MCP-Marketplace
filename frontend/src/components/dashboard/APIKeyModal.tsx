"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { APIKey } from "@/shared/types/api";
import { useTranslation } from "@/shared/lib/useTranslation";
import { fetchAPI } from "@/shared/rpc/common-function";
import { copyToClipboard } from "@/shared/utils/clipboard";

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (keyData: APIKey) => void;
  initialName?: string;
  generatedKey?: string;
  mode: "create" | "edit";
  id?: string;
}

export const APIKeyModal = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialName = "",
  generatedKey,
  mode,
  id,
}: APIKeyModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const keyName = name.trim();
    if (!keyName) return;

    setIsLoading(true);
    try {
      if (mode === "create") {
        const response = await fetchAPI<APIKey>("/api/apikey/info", {
          method: "POST",
          body: { name: keyName } as unknown as BodyInit,
        });

        if (!response.success) {
          console.error("Error creating auth key:", response.error_message);
          toast.error(t("Failed to create auth key"));
          return;
        }

        if (onSubmitSuccess && response.data) {
          onSubmitSuccess(response.data);
        }
      } else if (mode === "edit" && id) {
        const response = await fetchAPI<APIKey>("/api/apikey/info", {
          method: "PUT",
          body: { apikey_id: id, name: keyName } as unknown as BodyInit,
        });

        if (!response.success) {
          console.error("Error updating auth key:", response.error_message);
          toast.error(t("Failed to update auth key"));
          return;
        }

        if (onSubmitSuccess && response.data) {
          onSubmitSuccess(response.data);
        }

        toast.success(t("Auth key updated successfully"));
        onClose();
      }
      setName('')
    } catch (error) {
      console.error("Error creating/updating auth key:", error);
      toast.error(t("Failed to create/update auth key"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (generatedKey) {
      const result = await copyToClipboard(generatedKey);
      if (result.success) {
        toast.success(t("Copied to clipboard"));
      } else {
        toast.error(t("Copy failed, please copy manually"));
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isDismissable={false} size="2xl">
      <ModalContent>
        <ModalHeader>
          {generatedKey
            ? t("Authorization Created")
            : mode === "create"
              ? t("Create New Authorization")
              : t("Edit Authorization")}
        </ModalHeader>
        <ModalBody>
          {!generatedKey ? (
            <Input
              label={t("Authorization Name")}
              placeholder={t("Edit authorization name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {t("Your Auth Key:")}
              </p>
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded relative justify-between">
                <span >{generatedKey}</span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleCopyKey}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            {generatedKey ? t("Done") : t("Close")}
          </Button>
          {!generatedKey && (
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isLoading}
              isDisabled={!name.trim() || isLoading}
            >
              {t("Save")}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};