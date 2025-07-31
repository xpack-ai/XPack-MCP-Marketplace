"use client";

import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  AccordionItem,
  Accordion,
  Switch,
} from "@nextui-org/react";
import { Eye, EyeOff } from "lucide-react";
import { AlipayConfig } from "@/types/payment";
import { useTranslation } from "@/shared/lib/useTranslation";

interface AlipayConfigFormProps {
  config: AlipayConfig;
  onSave: (config: AlipayConfig) => void;
  onEnable: (channelId: string) => Promise<boolean>;
  onDisable: (channelId: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const AlipayConfigForm: React.FC<AlipayConfigFormProps> = ({
  config,
  onSave,
  onEnable,
  onDisable,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<AlipayConfig>(config);
  const [showAppPrivateKey, setShowAppPrivateKey] = useState(false);
  const [showAlipayPublicKey, setShowAlipayPublicKey] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (
    field: keyof AlipayConfig,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleEnableDisable = async (value: boolean) => {
    let result: boolean | null = null;
    if (value) {
      result = await onEnable("alipay");
    } else {
      result = await onDisable("alipay");
    }
    if (result) {
      setFormData((prev) => ({
        ...prev,
        is_enabled: value,
      }));
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isFormValid =
    formData.app_id.trim() !== "" &&
    formData.app_private_key.trim() !== "" &&
    formData.alipay_public_key.trim() !== "";

  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        base: "shadow-none border-1",
      }}
      defaultExpandedKeys={["alipay-config"]}
      className="px-0"
    >
      <AccordionItem
        key="alipay-config"
        title={
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-semibold">
                  {t("Alipay Configuration")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("Configure Alipay payment interface")}
                </p>
              </div>
              <Switch
                isSelected={formData.is_enabled || false}
                onValueChange={handleEnableDisable}
                size="sm"
              />
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* App ID */}
          <Input
            label={t("App ID")}
            placeholder={t("Alipay App ID")}
            value={formData.app_id}
            onChange={(e) => handleInputChange("app_id", e.target.value)}
            isRequired
            autoComplete="off"
            isDisabled={!formData.is_enabled}
          />

          {/* App Private Key */}
          <Input
            label={t("App Private Key")}
            placeholder={t("Alipay App Private Key")}
            value={formData.app_private_key}
            onChange={(e) =>
              handleInputChange("app_private_key", e.target.value)
            }
            type={showAppPrivateKey ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowAppPrivateKey(!showAppPrivateKey)}
                className="focus:outline-none"
              >
                {showAppPrivateKey ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            isRequired
            autoComplete="off"
            isDisabled={!formData.is_enabled}
          />

          {/* Alipay Public Key */}
          <Input
            label={t("Alipay Public Key")}
            placeholder={t("Alipay public key for verification")}
            value={formData.alipay_public_key || ""}
            onChange={(e) =>
              handleInputChange("alipay_public_key", e.target.value)
            }
            type={showAlipayPublicKey ? "text" : "password"}
            isRequired
            endContent={
              <button
                type="button"
                onClick={() => setShowAlipayPublicKey(!showAlipayPublicKey)}
                className="focus:outline-none"
              >
                {showAlipayPublicKey ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            autoComplete="off"
            isDisabled={!formData.is_enabled}
          />
        </div>

        {/* Action Buttons */}
        {formData.is_enabled && (
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
        )}
      </AccordionItem>
    </Accordion>
  );
};
