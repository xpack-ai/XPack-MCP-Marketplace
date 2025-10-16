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
import { StripeConfig } from "@/types/payment";
import { useTranslation } from "@/shared/lib/useTranslation";

interface StripeConfigFormProps {
  config: StripeConfig;
  onSave: (config: StripeConfig) => void;
  onEnable: (channelId: string) => Promise<boolean>;
  onDisable: (channelId: string) => Promise<boolean>;
  isLoading?: boolean;
  labelPlacement?: "outside" | "inside";
}

export const StripeConfigForm: React.FC<StripeConfigFormProps> = ({
  config,
  onSave,
  onEnable,
  onDisable,
  isLoading = false,
  labelPlacement = "inside",
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<StripeConfig>(config);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (
    field: keyof StripeConfig,
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
      result = await onEnable("stripe");
    } else {
      result = await onDisable("stripe");
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
    formData.secret.trim() !== "" && formData.webhook_secret.trim() !== "";

  const panelContent = () => {
    return (
      <>
        <div
          className={`flex flex-col gap-4 ${formData.is_enabled ? "" : "hidden"}`}
        >
          {/* Secret Key */}
          <Input
            label={t("Secret Key")}
            placeholder={t("Enter Secret Key")}
            description={t("Stripe secret key for server-side API calls")}
            value={formData.secret}
            onChange={(e) => handleInputChange("secret", e.target.value)}
            type={showSecretKey ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="focus:outline-none"
              >
                {showSecretKey ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            isRequired
            autoComplete="off"
            isDisabled={!formData.is_enabled}
            labelPlacement="outside"
          />

          {/* Webhook Secret (Optional) */}
          <Input
            label={t("Webhook Secret")}
            placeholder={t("Enter Webhook Secret")}
            description={t(
              "Webhook signing secret for verifying Stripe events"
            )}
            value={formData.webhook_secret || ""}
            onChange={(e) =>
              handleInputChange("webhook_secret", e.target.value)
            }
            type={showWebhookSecret ? "text" : "password"}
            isRequired
            endContent={
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="focus:outline-none"
              >
                {showWebhookSecret ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            autoComplete="off"
            isDisabled={!formData.is_enabled}
            labelPlacement="outside"
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
      </>
    );
  };

  if (labelPlacement === "outside") {
    return (
      <div className="flex flex-col gap-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("Enable Stripe Payment")}
            </span>
            <span className="text-xs text-gray-500">
              {t("Toggle to enable or disable Stripe payment interface")}
            </span>
          </div>
          <Switch
            isSelected={formData.is_enabled || false}
            onValueChange={handleEnableDisable}
            color="primary"
            size="sm"
          />
        </div>
        {panelContent()}
      </div>
    );
  }

  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        base: "shadow-none border-1",
      }}
      defaultExpandedKeys={["stripe-config"]}
      className="px-0"
    >
      <AccordionItem
        key="stripe-config"
        title={
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-semibold">
                  {t("Stripe Configuration")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("Configure Stripe payment interface")}
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
        {panelContent()}
      </AccordionItem>
    </Accordion>
  );
};
