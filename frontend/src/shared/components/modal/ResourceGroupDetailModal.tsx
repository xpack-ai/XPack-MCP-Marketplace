"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  ModalContent,
  Modal,
  ModalHeader,
  ModalBody,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Price } from "@/shared/components/marketplace/Price";
import { ChargeType } from "@/shared/types/marketplace";
import { fetchGroupServices, fetchResourceGroupDetail, ResourceGroupDetailResponse } from "@/api/resourceGroup.api";
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

interface ResourceGroupDetailModalProps {
  groupId?: string; // 可选，因为可能从 URL 获取
  isOpen: boolean;
  onClose: () => void;
}

const ResourceGroupDetailModal: React.FC<ResourceGroupDetailModalProps> = ({
  groupId,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  const [services, setServices] = useState<GroupService[]>([]);
  const [serviceTablePagination, setServiceTablePagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const serviceTableParams = useRef({
    pageSize: 10,
    keyword: ""
  });
  const [pages, setPages] = useState(0);
  const [servicesLoading, setServicesLoading] = useState(false);

  useEffect(() => {
    setPages(Math.ceil(serviceTablePagination.total / serviceTablePagination.pageSize));
  }, [serviceTablePagination.total, serviceTablePagination.pageSize]);

  // 加载指定组的服务列表（支持分页）
  const loadGroupServices = useCallback(async (
    groupId: string,
    page: number = 1,
    pageSize: number = 10,
    keyword: string = ""
  ) => {
    setServicesLoading(true);
    try {
      const response = await fetchGroupServices(groupId, page, pageSize, keyword);
      setServices(response.data);
      setServiceTablePagination({
        page: response.page,
        pageSize: response.page_size,
        total: response.total,
      });
      // 保存当前的 pageSize 和 keyword 到 ref
      serviceTableParams.current = {
        pageSize: response.page_size,
        keyword
      };
    } catch (error) {
      console.error(t("Failed to load group services"), error);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // 服务列表翻页
  const handleServicePageChange = async (page: number) => {
      await loadGroupServices(
        groupId || "",
        page,
        serviceTableParams.current.pageSize,
        serviceTableParams.current.keyword
      );
    }

  useEffect(() => {
    if (isOpen && groupId) {
      loadGroupServices(groupId, 1, 10, "");
    }
  }, [isOpen, groupId, loadGroupServices]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("Resource Group Detail")}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
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
                          page={serviceTablePagination.page}
                          total={pages}
                          onChange={(page) => handleServicePageChange(page)}
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
                  </TableHeader>
                  <TableBody
                    items={services}
                    isLoading={servicesLoading}
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
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal >

  );
};

export default ResourceGroupDetailModal;

