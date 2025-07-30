"use client";

import React, { useEffect, useState } from "react";
import { Input, Button, AccordionItem, Accordion } from "@nextui-org/react";
import { Eye, EyeOff } from "lucide-react";
import { AdminConfig } from "@/types/system";
import { useTranslation } from "@/shared/lib/useTranslation";

interface AdminConfigFormProps {
  config: AdminConfig;
  onSave: (config: AdminConfig) => void;
  isLoading?: boolean;
}

export const AdminConfigForm: React.FC<AdminConfigFormProps> = ({
  config,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<AdminConfig>(config);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    setFormData({
      ...config,
      password: "",
    });
    setConfirmPassword("");
  }, [config]);

  const handleInputChange = (field: keyof AdminConfig, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isFormValid =
    formData.username.trim() !== "" &&
    formData.password?.trim() !== "" &&
    formData.password === confirmPassword &&
    formData.password?.length >= 8;

  const passwordsMatch = formData.password === confirmPassword;

  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        base: "shadow-none border-1",
      }}
      defaultExpandedKeys={["admin-config"]}
      className="px-0"
    >
      <AccordionItem
        key="admin-config"
        title={
          <div className="flex flex-col justify-between">
            <h3 className="text-lg font-semibold">
              {t("Administrator Account")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("Configure administrator login credentials")}
            </p>
          </div>
        }
      >
        <div className="space-y-4">
          {/* admin username */}
          <Input
            label={t("Administrator Username")}
            placeholder={t("Enter administrator username")}
            description={t("Username for administrator login")}
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            isRequired
          />

          {/* admin password */}
          <Input
            label={t("Administrator Password")}
            placeholder={t("Enter administrator password")}
            description={t("Password must be at least 8 characters long")}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            type={showPassword ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            isRequired
            autoComplete="new-password"
            color={
              formData.password?.length > 0 && formData.password?.length < 8
                ? "danger"
                : "default"
            }
            errorMessage={
              formData.password?.length > 0 && formData.password?.length < 8
                ? t("Password must be at least 8 characters")
                : ""
            }
          />

          {/* confirm password */}
          <Input
            label={t("Confirm Password")}
            placeholder={t("Confirm administrator password")}
            description={t("Re-enter the password to confirm")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showConfirmPassword ? "text" : "password"}
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
            autoComplete="new-password"
            isRequired
            color={
              confirmPassword?.length > 0 && !passwordsMatch
                ? "danger"
                : "default"
            }
            errorMessage={
              confirmPassword?.length > 0 && !passwordsMatch
                ? t("Passwords do not match")
                : ""
            }
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 py-4">
          <Button
            color="primary"
            variant="solid"
            onPress={handleSave}
            isLoading={isLoading}
            isDisabled={!isFormValid}
            size="sm"
          >
            {t("Save")}
          </Button>
        </div>
      </AccordionItem>
    </Accordion>
  );
};
