"use client";

import React from "react";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { MCPServiceFormData } from "@/shared/types/mcp-service";
import { getCurrencySymbol } from "@/shared/utils/currency";
import { ChargeType } from "@/shared/types/marketplace";

interface PricingTabProps {
  formData: MCPServiceFormData;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
}

export const PricingTab: React.FC<PricingTabProps> = ({
  formData,
  onInputChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <Select
        label={t("Pricing")}
        selectedKeys={formData.charge_type ? [formData.charge_type] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;
          onInputChange("charge_type", selectedKey);
        }}
        renderValue={() => {
          const selectedKey = formData.charge_type || ChargeType.PerCall;
          if (selectedKey === ChargeType.Free) return t("Free");
          return t(
            selectedKey === ChargeType.PerCall
              ? "Per Call"
              : "Per Million Tokens"
          );
        }}
        labelPlacement="outside"
      >
        <SelectItem key="free" value={ChargeType.Free}>
          <div className="flex flex-col">
            <span>{t("Free")}</span>
            <span className="text-xs text-gray-500">
              {t("No charge for API calls")}
            </span>
          </div>
        </SelectItem>
        <SelectItem key="per_call" value={ChargeType.PerCall}>
          <div className="flex flex-col">
            <span>{t("Per Call")}</span>
            <span className="text-xs text-gray-500">
              {t("Fixed price per API call")}
            </span>
          </div>
        </SelectItem>

        <SelectItem key="per_token" value={ChargeType.PerToken}>
          <div className="flex flex-col">
            <span>{t("Per Million Tokens")}</span>
            <span className="text-xs text-gray-500">
              {t("Price per million tokens consumed")}
            </span>
          </div>
        </SelectItem>
      </Select>

      {formData.charge_type !== ChargeType.Free && (
        <>
          {formData.charge_type === ChargeType.PerToken ? (
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                description={t("Input Token Price")}
                value={formData.input_token_price || ""}
                onChange={(e) =>
                  onInputChange("input_token_price", e.target.value)
                }
                placeholder={t("Price per million input tokens")}
                startContent={
                  <span className="text-gray-500 leading-[20px]">
                    {getCurrencySymbol()}
                  </span>
                }
                labelPlacement="outside"
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                description={t("Output Token Price")}
                value={formData.output_token_price || ""}
                onChange={(e) =>
                  onInputChange("output_token_price", e.target.value)
                }
                placeholder={t("Price per million output tokens")}
                startContent={
                  <span className="text-gray-500 leading-[20px]">
                    {getCurrencySymbol()}
                  </span>
                }
                labelPlacement="outside"
              />
            </div>
          ) : (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ""}
              onChange={(e) => onInputChange("price", e.target.value)}
              description={t("Price per API call")}
              startContent={
                <span className="text-gray-500 leading-[20px]">
                  {getCurrencySymbol()}
                </span>
              }
              labelPlacement="outside"
            />
          )}
        </>
      )}
    </div>
  );
};
