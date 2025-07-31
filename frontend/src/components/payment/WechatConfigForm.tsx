"use client";

import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  AccordionItem,
  Accordion,
  Switch,
} from "@nextui-org/react";
import { WechatConfig } from "@/types/payment";
import { useTranslation } from "@/shared/lib/useTranslation";

interface WechatConfigFormProps {
  config: WechatConfig;
  onSave: (config: WechatConfig) => void;
  onEnable: (channelId: string) => Promise<boolean>;
  onDisable: (channelId: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const WechatConfigForm: React.FC<WechatConfigFormProps> = ({
  config,
  onSave,
  onEnable,
  onDisable,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<WechatConfig>(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (
    field: keyof WechatConfig,
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
      result = await onEnable("wechat");
    } else {
      result = await onDisable("wechat");
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
    formData.app_id.trim() !== "" && formData.mch_id.trim() !== "";

  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        base: "shadow-none border-1",
      }}
      defaultExpandedKeys={["wechat-config"]}
      className="px-0"
    >
      <AccordionItem
        key="wechat-config"
        title={
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-semibold">
                  {t("WeChat Configuration")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("Configure WeChat payment interface")}
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
            placeholder={t("WeChat App ID")}
            value={formData.app_id}
            onChange={(e) => handleInputChange("app_id", e.target.value)}
            isRequired
            autoComplete="off"
            isDisabled={!formData.is_enabled}
          />

          {/* Merchant ID */}
          <Input
            label={t("Merchant ID")}
            placeholder={t("WeChat Merchant ID")}
            value={formData.mch_id}
            onChange={(e) => handleInputChange("mch_id", e.target.value)}
            isRequired
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
