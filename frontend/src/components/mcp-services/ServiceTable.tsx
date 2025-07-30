"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Tooltip,
  Pagination,
  Spinner,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { EnabledEnum, MCPService } from "@/types/mcp-service";
import {
  Trash2,
  Zap,
  PencilIcon,
  CircleCheckIcon,
  BanIcon,
} from "lucide-react";
import { ChargeType } from "@/shared/types/marketplace";
import { Price } from "@/shared/components/marketplace/Price";

interface ServiceTableProps {
  services: MCPService[];
  loading?: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onEdit: (service: MCPService) => void;
  onDelete: (service: MCPService) => void;
  onToggleStatus: (service: MCPService) => void;
  onPageChange: (page: number) => void;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  loading = false,
  pagination,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
}) => {
  const { t } = useTranslation();

  const pages = Math.ceil(pagination.total / pagination.pageSize);
  const currentPage = pagination.page;

  // 直接显示服务数据（已经是当前页的数据）
  const items = services;

  const getStatusColor = (enabled: number) => {
    return enabled === EnabledEnum.Online ? "success" : "danger";
  };

  const handleEdit = React.useCallback(
    (service: MCPService) => {
      onEdit(service);
    },
    [onEdit]
  );

  const handleDelete = React.useCallback(
    (service: MCPService) => {
      onDelete(service);
    },
    [onDelete]
  );

  const handleToggleStatus = React.useCallback(
    (service: MCPService) => {
      onToggleStatus(service);
    },
    [onToggleStatus]
  );

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table
        aria-label="MCP Services table"
        classNames={{
          wrapper: "min-h-[400px]",
        }}
        removeWrapper
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                showControls
                variant="light"
                color="primary"
                page={currentPage}
                total={pages}
                onChange={onPageChange}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>{t("Service Name")}</TableColumn>
          <TableColumn>{t("API Endpoint")}</TableColumn>
          <TableColumn>{t("Status")}</TableColumn>
          <TableColumn>{t("Pricing")}</TableColumn>
          <TableColumn className="w-20">{t("Actions")}</TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          isLoading={loading}
          loadingContent={<Spinner />}
          emptyContent={t("No services found")}
        >
          {(service) => (
            <TableRow key={service.id}>
              <TableCell>
                <span className="text-sm capitalize">{service.name}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{service.base_url}</span>
              </TableCell>
              <TableCell>
                <Chip
                  className="capitalize"
                  color={getStatusColor(service.enabled)}
                  size="sm"
                  variant="flat"
                >
                  {t(service.enabled === 1 ? "Online" : "Offline")}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Price
                    price={service.price}
                    charge_type={service.charge_type}
                    input_token_price={service.input_token_price}
                    output_token_price={service.output_token_price}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip content={t("Edit")} closeDelay={0} disableAnimation>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleEdit(service)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip
                    content={
                      service.enabled === EnabledEnum.Online
                        ? t("Take Offline")
                        : t("Bring Online")
                    }
                    closeDelay={0}
                    disableAnimation
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color={
                        service.enabled === EnabledEnum.Online
                          ? "danger"
                          : "success"
                      }
                      onPress={() => handleToggleStatus(service)}
                    >
                      {service.enabled === EnabledEnum.Online ? (
                        <BanIcon className="w-4 h-4" />
                      ) : (
                        <CircleCheckIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </Tooltip>

                  <Tooltip
                    content={t("Delete Service")}
                    color="danger"
                    closeDelay={0}
                    disableAnimation
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(service)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
