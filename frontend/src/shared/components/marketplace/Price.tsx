"use client";

import { useTranslation } from "@/shared/lib/useTranslation";
import { ChargeType } from "@/shared/types/marketplace";
import { Chip } from "@nextui-org/react";
import { Zap } from "lucide-react";
import React from "react";

interface PriceProps {
  price?: string;
  charge_type?: ChargeType;
}

export const Price: React.FC<PriceProps> = ({ price, charge_type }) => {
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
    return (
      <div className="flex items-center gap-1">
        <Zap className="w-3 h-3 text-blue-600" />
        <span className="text-sm font-medium text-blue-600">
          ${priceText.toFixed(2)}
        </span>
        <span className="text-xs text-gray-500">/{t("token")}</span>
      </div>
    );
  }
};
