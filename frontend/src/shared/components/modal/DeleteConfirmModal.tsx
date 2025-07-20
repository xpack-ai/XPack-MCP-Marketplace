"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Alert,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  loading?: boolean;
  requireNameConfirmation?: boolean;
  confirmationName?: string;
  confirmationPlaceholder?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
  requireNameConfirmation = false,
  confirmationName = "",
  confirmationPlaceholder,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);

  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  // Check if confirm button should be disabled
  useEffect(() => {
    if (requireNameConfirmation && confirmationName) {
      setIsConfirmDisabled(inputValue.trim() !== confirmationName.trim());
    } else {
      setIsConfirmDisabled(false);
    }
  }, [inputValue, requireNameConfirmation, confirmationName]);

  const handleConfirm = async () => {
    if (isConfirmDisabled) return;

    try {
      await onConfirm();
    } catch (error) {
      console.error("Delete confirmation error:", error);
    }
  };

  const defaultTitle = t("Confirm Delete");
  const defaultDescription = t("Are you sure you want to delete this item? This action cannot be undone.");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {title || defaultTitle}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Description */}
                <div className="text-default-600">
                  {description || defaultDescription}
                </div>

                {/* Warning message */}
                <Alert title={t("This action cannot be undone.")} color="danger" />

                {/* Name confirmation input */}
                {requireNameConfirmation && confirmationName && (
                  <div className="space-y-2">
                    <p className="text-sm text-default-600">
                      {t('Please type "{{name}}" to confirm deletion:', {
                        name: confirmationName,
                      })}
                    </p>
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={confirmationPlaceholder || confirmationName}
                      variant="bordered"
                      size="sm"
                      isDisabled={loading}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onClose}
                isDisabled={loading}
              >
                {t("Cancel")}
              </Button>
              <Button
                color="danger"
                onPress={handleConfirm}
                isLoading={loading}
                isDisabled={isConfirmDisabled}
              >
                {t("Delete")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal >
  );
};

export default DeleteConfirmModal;