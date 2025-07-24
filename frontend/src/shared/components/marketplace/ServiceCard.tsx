"use client";

import React from "react";
import { Card, CardBody, CardFooter, Chip } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ChargeType } from "@/shared/types/marketplace";
import { Price } from "./Price";

interface ServiceCardProps {
  service: ServiceData;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // generate different icon background color for different services
  const { t } = useTranslation();

  return (
    <Link href={`/marketplace/${service.service_id}`}>
      <Card
        className="group w-full h-[180px] hover:border-primary-500 transition-all duration-300 border-1"
        shadow="none"
        radius="sm"
      >
        <CardBody>
          {/* Header with icon and title */}
          <div className="flex items-start gap-3 mb-3">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate group-hover:text-primary">
              {service.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {service.short_description || t("No description available")}
          </p>
        </CardBody>
        {/* Footer with tools count */}
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <Chip
              size="sm"
              variant="flat"
              color="primary"
              className="text-[10px] h-5"
            >
              {t("{{count}} Tools", { count: service.tools.length })}
            </Chip>
            <div className="flex flex-col gap-1">
              <Price price={service.price} charge_type={service.charge_type} />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
