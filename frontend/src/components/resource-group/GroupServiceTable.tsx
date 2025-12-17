"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Spinner,
  Divider,
  CardHeader,
  CardBody,
  Pagination,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Price } from "@/shared/components/marketplace/Price";
import { ChargeType } from "@/shared/types/marketplace";
import { fetchResourceGroupDetail, ResourceGroupDetailResponse } from "@/api/resourceGroup.api";
import { useSearchParams } from "next/navigation";

// 组内服务类型定义
export interface GroupService {
  id: string;
  name: string;
  base_url: string;
  charge_type: ChargeType;
  price: string;
  enabled: boolean;
  slug_name?: string;
  input_token_price?: string;
  output_token_price?: string;
}

interface GroupServiceTableProps {
  groupId?: string; // 可选，因为可能从 URL 获取
  services: GroupService[];
  loading?: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onAddService: () => void;
  onRemoveService: (serviceId: string) => void;
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  refreshTrigger?: number; // 用于触发刷新
}

const GroupServiceTable: React.FC<GroupServiceTableProps> = ({
  groupId: propGroupId,
  services,
  loading = false,
  pagination,
  onPageChange,
  onAddService,
  onRemoveService,
  onEditGroup,
  onDeleteGroup,
  refreshTrigger,
}) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const pages = Math.ceil(pagination.total / pagination.pageSize);
  const currentPage = pagination.page;
  const [resourceGroupDetail, setResourceGroupDetail] = useState<ResourceGroupDetailResponse | null>(null);

  // 优先使用 props 传入的 groupId，如果没有则从 URL 参数获取
  const urlGroupId = searchParams.get('groupId');
  const currentGroupId = propGroupId || urlGroupId || null;

  const getResourceGroup = async (groupId: string) => {
    const response = await fetchResourceGroupDetail(groupId);
    if (response) {
      setResourceGroupDetail(response);
    }
  }

  useEffect(() => {
    if (currentGroupId) {
      getResourceGroup(currentGroupId);
    }
  }, [currentGroupId, refreshTrigger]); // 当 refreshTrigger 变化时也会刷新

  return (
    <>
      <Card className="flex-1" radius="none" shadow="sm">
        <CardHeader className="px-6 py-4">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-semibold text-gray-900 truncate" title={resourceGroupDetail?.name}>
              {resourceGroupDetail?.name}
            </h2>
            <div className="flex gap-2 h-[32px]">
              {!['allow-all', 'deny-all'].includes(resourceGroupDetail?.id || '') && currentGroupId && <>
                <Button
                  isIconOnly
                  size="sm"
                  variant="bordered"
                  onPress={() => onEditGroup(currentGroupId)}
                >
                  <Edit2 size={18} />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="bordered"
                  color="danger"
                  onPress={() => onDeleteGroup(currentGroupId)}
                >
                  <Trash2 size={18} />
                </Button></>
              }

            </div>

          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Button
                color="primary"
                onPress={onAddService}
                startContent={<Plus size={16} />}
                size="sm"
              >
                {t("Add Server")}
              </Button>
            </div>

            <div className="flex gap-2"></div>
          </div>

          <Table
            aria-label="Group services table"
            removeWrapper
            classNames={{
              wrapper: "min-h-[400px]",
            }}
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
              items={services}
              isLoading={loading}
              loadingContent={<Spinner />}
              emptyContent={t("No services in this group")}
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
                      color={service.enabled ? "success" : "danger"}
                      size="sm"
                      variant="flat"
                    >
                      {t(service.enabled ? "Published" : "Unpublished")}
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
                    <Tooltip
                      content={t("Remove")}
                      color="danger"
                      closeDelay={0}
                      disableAnimation
                    >
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => onRemoveService(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
};

export default GroupServiceTable;

