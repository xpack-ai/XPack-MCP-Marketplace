"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Card, CardBody } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface ProductOverviewProps {
  product: ServiceData;
}

export const ProductOverview: React.FC<ProductOverviewProps> = ({
  product,
}) => {
  const { t } = useTranslation();

  return (
    <Card shadow="none" className="bg-transparent overflow-visible">
      <CardBody className="space-y-4 overflow-visible">
        <div className="leading-relaxed  max-w-none">
          {product.long_description ? (
            <MarkdownPreview source={product.long_description} />
          ) : (
            <p>{t("No description available")}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
