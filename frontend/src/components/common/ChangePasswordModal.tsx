"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useGlobalStore } from "@/shared/store/global";
import { useSharedStore } from "@/shared/store/share";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { changePassword } = useGlobalStore();
  const { setUserToken } = useSharedStore();

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleSubmit = async () => {
    // 验证表单
    if (!newPassword.trim()) {
      toast.error(t("Please enter new password"));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("Password must be at least 8 characters long"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("New passwords do not match"));
      return;
    }

    const result = await changePassword(newPassword);

    if (result.success) {
      toast.success(t("Password changed successfully"));
      setUserToken(result.data.user_token || "");
      handleClose();
      return;
    }
    toast.error(result.error_message || t("Failed to change password"));
  };

  const isFormValid =
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    newPassword === confirmPassword &&
    newPassword.length >= 8;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t("Change Password")}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* New Password */}
            <Input
              label={t("New Password")}
              placeholder={t("Enter new password")}
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              description={t("Password must be at least 8 characters long")}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="focus:outline-none"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
              isRequired
            />

            {/* Confirm New Password */}
            <Input
              label={t("Confirm New Password")}
              placeholder={t("Confirm new password")}
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              color={
                confirmPassword && newPassword !== confirmPassword
                  ? "danger"
                  : "default"
              }
              errorMessage={
                confirmPassword && newPassword !== confirmPassword
                  ? t("Passwords do not match")
                  : undefined
              }
              endContent={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
              isRequired
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={handleClose}>
            {t("Cancel")}
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!isFormValid}
          >
            {t("Confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
