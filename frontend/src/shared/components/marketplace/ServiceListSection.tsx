"use client";

import React from "react";
import { Pagination } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
import { ServiceCard } from "./ServiceCard";

interface ServiceListSectionProps {
  services: ServiceData[];
  currentPage: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const ServiceListSection: React.FC<ServiceListSectionProps> = ({
  services,
  currentPage,
  total,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto px-6 py-12 max-w-7xl">
      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
        {services.map((service) => (
          <ServiceCard key={service.service_id} service={service} />
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