"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Avatar, Card, CardBody, Chip } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
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
          <Link href="/" className="hover:underline" prefetch>
            {t("Home")}
          </Link>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              <Link href={item.link} className="hover:underline" prefetch>
                {t(item.name)}
              </Link>
            </React.Fragment>
          ))}
          <span>/</span>
          <b className="text-default-700">{t(product.name)}</b>
        </nav>

        {/* Header with title and price */}
        <div className="flex justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {product.supplier_info?.name && (
                <Avatar
                  src={product.supplier_info?.logo}
                  size="lg"
                  name={product.supplier_info?.name.slice(0, 1)}
                  radius="sm"
                  classNames={{
                    img: "object-contain",
                  }}
                  className={
                    product.supplier_info?.logo ? "bg-transparent" : ""
                  }
                />
              )}
              <div className="flex flex-col justify-between">
                <h1 className="text-2xl font-bold">{product.name}</h1>
                {product.supplier_info?.name && (
                  <p className="text-xs text-default-500">
                    @{product.supplier_info.name}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 my-3">
                {product.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    size="sm"
                    variant="flat"
                    color="secondary"
                    radius="sm"
                    className="text-[10px] h-5"
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
