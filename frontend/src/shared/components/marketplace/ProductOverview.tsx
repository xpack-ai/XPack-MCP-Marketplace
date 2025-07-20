"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Card, CardBody } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";

interface ProductOverviewProps {
  product: ServiceData;
}

export const ProductOverview: React.FC<ProductOverviewProps> = ({
  product,
}) => {
  const { t } = useTranslation();

  return (
    <Card shadow="none">
      <CardBody className="space-y-4">
        <div className="leading-relaxed prose prose-sm max-w-none">
          {product.long_description ? (
            <ReactMarkdown>{product.long_description}</ReactMarkdown>
          ) : (
            <p>{t("No description available")}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};