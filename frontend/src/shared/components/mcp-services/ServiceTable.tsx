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
import { EnabledEnum, MCPService } from "@/shared/types/mcp-service";
import { Trash2, PencilIcon, Calendar } from "lucide-react";
import { Price } from "@/shared/components/marketplace/Price";
import { MdOutlineUnpublished, MdOutlineCheckCircle } from "react-icons/md";
import { withComponentInjection } from "@/shared/hooks/useComponentInjection";

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
  onToggleStatus: (serviceId: string) => void;
  onPageChange: (page: number) => void;
  columns?: string[];
}

const BaseServiceTable: React.FC<ServiceTableProps> = ({
  services,
  loading = false,
  pagination,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
  columns = ["name", "endpoints", "status", "pricing", "actions"],
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
    (serviceId: string) => {
      onToggleStatus(serviceId);
    },
    [onToggleStatus]
  );
  const formatDate = (dateString: string) => {
    return (
      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3 text-gray-500" />
        <span className="text-sm text-gray-600">
          {new Date(dateString).toLocaleString()}
        </span>
      </div>
    );
  };
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
        aria-label="MCP Servers table"
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
          <TableColumn hidden={!columns.includes("pricing")}>
            {t("Pricing")}
          </TableColumn>
          <TableColumn>{t("Created_at")}</TableColumn>
          <TableColumn className="w-20">{t("Actions")}</TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          isLoading={loading}
          loadingContent={<Spinner />}
          emptyContent={t("No servers found")}
        >
          {(service) => (
            <TableRow key={service.id}>
              <TableCell>
                <span className="text-sm">{service.name}</span>
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
                  {t(service.enabled === 1 ? "Published" : "Unpublished")}
                </Chip>
              </TableCell>
              <TableCell hidden={!columns.includes("pricing")}>
                <div className="flex flex-col gap-1">
                  <Price
                    price={service.price}
                    charge_type={service.charge_type}
                    input_token_price={service.input_token_price}
                    output_token_price={service.output_token_price}
                  />
                </div>
              </TableCell>
              <TableCell>{formatDate(service.created_at)}</TableCell>
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
                        ? t("Unpublish")
                        : t("Publish")
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
                      onPress={() => handleToggleStatus(service.id)}
                    >
                      {service.enabled === EnabledEnum.Online ? (
                        <MdOutlineUnpublished size={18} />
                      ) : (
                        <MdOutlineCheckCircle size={18} />
                      )}
                    </Button>
                  </Tooltip>

                  <Tooltip
                    content={t("Delete")}
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

export const ServiceTable = withComponentInjection(
  "shared/components/mcp-services/ServiceTable",
  BaseServiceTable
);
