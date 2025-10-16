"use client";

import React from "react";
import { Avatar, Card, CardBody, CardFooter, Chip } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Price } from "./Price";

interface ServiceCardProps {
  service: ServiceData;
  showSupplier?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  showSupplier = false,
}) => {
  // generate different icon background color for different servers
  const { t } = useTranslation();

  return (
    <Link
      href={`/server/${service.service_id}`}
      className="w-full md:w-[calc(50%-16px)] lg:w-[calc(33%-16px)] xl:w-[calc(25%-16px)]"
    >
      <Card
        className="group w-full h-[200px] hover:border-primary-500 transition-all duration-300 border-1"
        shadow="none"
        radius="sm"
      >
        <CardBody>
          {/* Header with icon and title */}
          <div className="flex gap-2 mb-3">
            {showSupplier && (
              <Avatar
                src={service.supplier_info?.logo}
                size="md"
                name={service.name.slice(0, 1)}
                radius="sm"
                classNames={{
                  img: "object-contain",
                }}
                className={
                  service.supplier_info?.logo
                    ? "bg-transparent"
                    : "text-lg font-bold"
                }
              />
            )}
            <div className="flex-1 flex flex-col overflow-hidden justify-between">
              <h3 className="font-semibold text-gray-900 text-md truncate group-hover:text-primary">
                {service.name}
              </h3>
              {showSupplier && service.supplier_info?.name && (
                <p className="text-xs text-gray-600">
                  @{service.supplier_info?.name}
                </p>
              )}
            </div>
          </div>

          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {service.tags.slice(0, 3).map((tag, index) => (
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
          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {service.short_description || t("No description available")}
          </p>
        </CardBody>
        {/* Footer with tools count */}
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                className="text-[10px] h-5"
              >
                {t("Remote")}
              </Chip>
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                className="text-[10px] h-5"
              >
                {t("{{count}} Tools", { count: service.tools.length })}
              </Chip>
            </div>
            <div className="flex flex-col gap-1">
              <Price
                price={service.price}
                charge_type={service.charge_type}
                input_token_price={service.input_token_price}
                output_token_price={service.output_token_price}
              />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
