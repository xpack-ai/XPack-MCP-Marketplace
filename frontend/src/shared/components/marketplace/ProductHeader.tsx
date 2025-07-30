"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { ChargeType, ServiceData } from "@/shared/types/marketplace";
import Link from "next/link";
import { Price } from "./Price";

interface ProductHeaderProps {
  product: ServiceData;
  breadcrumbs?: {
    link: string;
    name: string;
  }[];
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  product,
  breadcrumbs = [],
}) => {
  const { t } = useTranslation();

  return (
    <Card shadow="none">
      <CardBody>
        {/* Breadcrumb */}
        <nav className="text-sm text-default-500 flex items-center gap-1 mb-10">
          <Link href="/" className="hover:underline">
            {t("Home")}
          </Link>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              <Link href={item.link} className="hover:underline">
                {t(item.name)}
              </Link>
            </React.Fragment>
          ))}
          <span>/</span>
          <b className="text-default-700">{t(product.name)}</b>
        </nav>

        {/* Header with title and price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 my-3">
                {product.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    size="sm"
                    variant="flat"
                    color="primary"
                    radius="sm"
                    className="text-xs h-5"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
            <p className="text-sm mb-4">
              {product.short_description || t("No description available")}
            </p>
          </div>
        </div>

        {/* Price section */}
        {product.charge_type && (
          <div className="flex gap-2 items-center">
            <b className="text-md">{t("Price")}:</b>
            <Price
              price={product.price}
              charge_type={product.charge_type}
              input_token_price={product.input_token_price}
              output_token_price={product.output_token_price}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
};
