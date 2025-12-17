"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";

interface DeleteServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  alertDescription?: string;
  customAlertContent?: React.ReactNode;
}

export const DeleteServerModal: React.FC<DeleteServerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  alertDescription,
  customAlertContent,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTitle = t("Confirm Delete");
  const defaultDescription = t("Are you sure you want to delete this item? This action cannot be undone.");
  const defaultAlertDescription= t("This action cannot be undone.");
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
                <Alert title={alertDescription || defaultAlertDescription} color="danger" classNames={{mainWrapper: "w-[calc(100%-60px)]"}}>
                    {customAlertContent && customAlertContent}
                </Alert>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onClose}
                isDisabled={isLoading}
              >
                {t("Cancel")}
              </Button>
              <Button
                color="danger"
                onPress={handleConfirm}
                isLoading={isLoading}
              >
                {t("Remove")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal >
  );
};

export default DeleteServerModal;