"use client";

import React from "react";
import { Pagination } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
import { ServiceCard } from "./ServiceCard";
import { useTranslation } from "@/shared/lib/useTranslation";

interface ServiceListSectionProps {
  services: ServiceData[];
  currentPage: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showSupplier?: boolean;
}

export const ServiceListSection: React.FC<ServiceListSectionProps> = ({
  services,
  currentPage,
  total,
  pageSize,
  onPageChange,
  showSupplier = false,
}) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);
  if (services.length === 0) {
    return (
      <div className="mx-auto px-6 py-12 max-w-7xl">
        <p className="text-center text-gray-500">{t("No servers found")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 py-12 max-w-7xl">
      {/* Server Grid */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {services.map((service) => (
          <ServiceCard
            key={service.service_id}
            service={service}
            showSupplier={showSupplier}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={onPageChange}
            showControls
            color="primary"
            variant="light"
          />
        </div>
      )}
    </div>
  );
};
