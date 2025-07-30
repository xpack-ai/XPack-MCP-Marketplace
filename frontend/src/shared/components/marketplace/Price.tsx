"use client";

import { useTranslation } from "@/shared/lib/useTranslation";
import { ChargeType } from "@/shared/types/marketplace";
import { Chip } from "@nextui-org/react";
import { Zap } from "lucide-react";
import React from "react";

interface PriceProps {
  price?: string;
  charge_type?: ChargeType;
  input_token_price?: string;
  output_token_price?: string;
}

export const Price: React.FC<PriceProps> = ({
  price,
  charge_type,
  input_token_price,
  output_token_price,
}) => {
  const { t } = useTranslation();
  if (!charge_type) {
    return null;
  }

  if (charge_type === ChargeType.Free) {
    return (
      <Chip size="sm" variant="flat" color="default">
        {t("Free")}
      </Chip>
    );
  }

  const priceText = parseFloat(price || "0");

  if (charge_type === ChargeType.PerCall) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-green-600">
          ${priceText.toFixed(2)}
        </span>
        <span className="text-xs text-gray-500">/{t("Per Call")}</span>
      </div>
    );
  } else {
    const inputPrice = parseFloat(input_token_price || "0");
    const outputPrice = parseFloat(output_token_price || "0");
    return (
      <div className="flex flex-col gap-1 text-xs ">
        <div className="flex items-center gap-1">
          <span className="text-gray-600">{t("Input")}:</span>
          <span className="font-medium text-green-600">
            ${inputPrice.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">/{t("1M tokens")}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-600">{t("Output")}:</span>
          <span className="font-medium text-blue-600">
            ${outputPrice.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">/{t("1M tokens")}</span>
        </div>
      </div>
    );
  }
};
