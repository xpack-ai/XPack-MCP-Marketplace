"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import { Eye, EyeOff } from "lucide-react";
import { EmailConfig } from "@/types/system";

interface EmailConfigFormProps {
  config: EmailConfig;
  onSave: (config: EmailConfig) => void;
  isLoading?: boolean;
}

export const EmailConfigForm: React.FC<EmailConfigFormProps> = ({
  config,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EmailConfig>(config);
  const [showPassword, setShowPassword] = useState(false);
  const [isCustomPort, setIsCustomPort] = useState(false);

  // common SMTP ports
  const commonPorts = [
    { key: "25", label: "25 (SMTP)" },
    { key: "465", label: "465 (SMTPS)" },
    { key: "587", label: "587 (SMTP with STARTTLS)" },
    { key: "2525", label: "2525 (Alternative SMTP)" },
    { key: "custom", label: t("Custom") },
  ];

  useEffect(() => {
    setFormData(config);
    // check if the port is predefined
    const predefinedPorts = ["25", "465", "587", "2525"];
    setIsCustomPort(!predefinedPorts.includes(config.smtp_port));
  }, [config]);

  const handleInputChange = (field: keyof EmailConfig, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isFormValid =
    formData.smtp_host.trim() !== "" &&
    formData.smtp_port.trim() !== "" &&
    formData.smtp_user.trim() !== "" &&
    formData.smtp_password.trim() !== "" &&
    formData.smtp_sender.trim() !== "";

  // validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPort = (port: string) => {
    const portNum = parseInt(port);
    return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
  };

  return (
    <>
      <div className="space-y-4">
        {/* SMTP server address */}
        <Input
          label={t("SMTP Host")}
          placeholder={t("Enter SMTP server address")}
          description={t("SMTP server hostname or IP address")}
          value={formData.smtp_host}
          onChange={(e) => handleInputChange("smtp_host", e.target.value)}
          isRequired
        />

        {/* SMTP port */}
        <div className={`flex gap-3 ${isCustomPort ? "flex-col" : ""}`}>
          <div className="flex-1">
            <Select
              label={t("SMTP Port")}
              placeholder={t("Select or enter port")}
              description={t("SMTP server port number")}
              selectedKeys={
                isCustomPort
                  ? ["custom"]
                  : formData.smtp_port
                    ? [formData.smtp_port]
                    : []
              }
              onSelectionChange={(keys) => {
                const selectedPort = Array.from(keys)[0] as string;
                if (selectedPort === "custom") {
                  setIsCustomPort(true);
                  // 如果当前端口不是预定义端口，保持当前值，否则清空
                  const predefinedPorts = ["25", "465", "587", "2525"];
                  if (predefinedPorts.includes(formData.smtp_port)) {
                    handleInputChange("smtp_port", "");
                  }
                } else if (selectedPort) {
                  setIsCustomPort(false);
                  handleInputChange("smtp_port", selectedPort);
                }
              }}
              isRequired
            >
              {commonPorts.map((port) => (
                <SelectItem
                  key={port.key}
                  value={port.key}
                  textValue={port.label}
                >
                  {port.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          {isCustomPort && (
            <div className="flex-1">
              <Input
                label={t("Custom Port")}
                placeholder={t("Enter custom port")}
                value={formData.smtp_port}
                onChange={(e) => handleInputChange("smtp_port", e.target.value)}
                type="number"
                min="1"
                max="65535"
                color={
                  formData.smtp_port && !isValidPort(formData.smtp_port)
                    ? "danger"
                    : "default"
                }
                errorMessage={
                  formData.smtp_port && !isValidPort(formData.smtp_port)
                    ? t("Invalid port number")
                    : ""
                }
                isRequired
              />
            </div>
          )}
        </div>

        {/* SMTP username */}
        <Input
          label={t("SMTP Username")}
          placeholder={t("Enter SMTP username")}
          description={t("Username for SMTP authentication")}
          value={formData.smtp_user}
          onChange={(e) => handleInputChange("smtp_user", e.target.value)}
          isRequired
        />

        {/* SMTP password */}
        <Input
          label={t("SMTP Password")}
          placeholder={t("Enter SMTP password")}
          description={t("Password for SMTP authentication")}
          value={formData.smtp_password}
          onChange={(e) => handleInputChange("smtp_password", e.target.value)}
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
        />

        {/* sender email */}
        <Input
          label={t("Sender Email")}
          placeholder={t("Enter sender email address")}
          description={t("Email address used as sender")}
          value={formData.smtp_sender}
          onChange={(e) => handleInputChange("smtp_sender", e.target.value)}
          type="email"
          isRequired
          color={
            formData.smtp_sender && !isValidEmail(formData.smtp_sender)
              ? "danger"
              : "default"
          }
          errorMessage={
            formData.smtp_sender && !isValidEmail(formData.smtp_sender)
              ? t("Invalid email format")
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
    </>
  );
};
