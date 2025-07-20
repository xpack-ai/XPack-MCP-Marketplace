"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Button, Avatar, Chip, Card, CardBody } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";

interface ProductToolsProps {
  product: ServiceData;
}

export const ProductTools: React.FC<ProductToolsProps> = ({ product }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 px-3">
      {product.tools.length > 0 ? (
        product.tools.map((tool, index) => (
          <Card radius="sm" key={`${product.service_id}-tool-${index}`} shadow="none" className="border-1">
            <CardBody>
              <h4 className="font-semibold text-sm mb-2 text-primary">{tool.name}</h4>
              <p className="text-sm mb-3">
                {tool.description || t("No description available")}
              </p>
            </CardBody>
          </Card>
        ))
      ) : (
        <Card>
          <CardBody>
            <p className="text-center">
              {t("No tools available in this service.")}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
