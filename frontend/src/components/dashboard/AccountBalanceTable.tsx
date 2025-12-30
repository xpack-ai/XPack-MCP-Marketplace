"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  Tooltip,
  Spinner,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Calendar, HelpCircle, Filter } from "lucide-react";
import { fetchAPI } from "@/shared/rpc/common-function";
import i18n from "@/shared/lib/i18n";
import { toast } from "react-hot-toast";

export interface OrderItem {
  id: string;
  amount: string;
  balance: string;
  order_id: string;
  // 支付类型，stripe默认值
  payment_type: string;
  // 支付状态，0=未支付，1=已支付，2=支付失败
  payment_state: number;
  description: string;
  // 充值时间
  create_at: string;
  // 交易时间，确认订单时间，只有充值完成后才有
  confirm_at: string;
  // 订单类型，充值（recharge），消费（purchase），退款（refund），冲正（reversal）
  order_type: string;
}

interface AccountBalanceTableProps {
  userId?: string;
}

const AccountBalanceTable: React.FC<AccountBalanceTableProps> = ({ userId }) => {
  const { t } = useTranslation();

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const resourceGroupsParams = useRef({
    page: 1,
    pageSize: 10,
    keyword: "",
    orderType: "",
    status: "",
  });

  const pages = Math.ceil(pagination.total / pagination.pageSize);
  const currentPage = Number(pagination.page);

  const fetchOrders = useCallback(
    async (
      page: number,
      page_size: number,
      order_type?: string,
      status?: string
    ): Promise<{ data: OrderItem[]; total: number; page: number; page_size: number }> => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: page_size.toString(),
        });
        if (order_type) params.append("order_type", order_type);
        if (status) params.append("status", status);
        if (userId) params.append("user_id", userId);

        // 根据是否有 userId 来决定使用哪个 API
        const apiUrl = userId
          ? `/api/order/list/by_user?${params.toString()}`
          : `/api/user/order/list?${params.toString()}`;

        const response = await fetchAPI<OrderItem[]>(apiUrl);
        if (!response.success) {
          toast.error(response.error_message || i18n.t("Failed to load orders"));
          return {
            data: [],
            total: 0,
            page,
            page_size,
          };
        }
        return {
          data: response.data || [],
          total: response.page?.total || 0,
          page: response.page?.page || page,
          page_size: response.page?.page_size || page_size,
        };
      } catch (error) {
        console.error("Error fetching orders:", error);
        return {
          data: [],
          total: 0,
          page,
          page_size,
        };
      }
    },
    [userId]
  );

  const loadOrders = useCallback(
    async (
      page: number = 1,
      pageSize: number = 10,
      keyword: string = "",
      orderType: string = "",
      status: string = ""
    ) => {
      setLoading(true);
      try {
        const response = await fetchOrders(
          page,
          pageSize,
          orderType || undefined,
          status || undefined
        );
        setItems(response.data);
        setPagination({
          page: response.page,
          pageSize: response.page_size,
          total: response.total,
        });
        resourceGroupsParams.current = {
          page: response.page,
          pageSize: response.page_size,
          keyword,
          orderType,
          status,
        };
      } catch (error) {
        console.error(t("Failed to load orders"), error);
      } finally {
        setLoading(false);
      }
    },
    [fetchOrders]
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

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "success";
      case 2:
        return "danger";
      default:
        return "warning";
    }
  };

  const onPageChange = (page: number) => {
    const { pageSize, orderType, status } = resourceGroupsParams.current;
    loadOrders(page, pageSize, "", orderType, status);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    const orderType = value === "all" ? "" : value;
    const { status } = resourceGroupsParams.current;
    loadOrders(1, pagination.pageSize, "", orderType, status);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    const status = value === "all" ? "" : value;
    const { orderType } = resourceGroupsParams.current;
    loadOrders(1, pagination.pageSize, "", orderType, status);
  };

  useEffect(() => {
    loadOrders(1, 10, "");
  }, [loadOrders]);

  return (
    <div className="space-y-4">
      <Table
        aria-label="Orders table"
        classNames={{
          wrapper: "min-h-[400px]",
        }}
        removeWrapper
      >
        <TableHeader>
          <TableColumn>
            <div className="flex items-center gap-1">
              <span>{t("Transaction Time")}</span>
            </div>
          </TableColumn>
          <TableColumn>
            <div className="flex items-center gap-2">
              <span>{t("Type")}</span>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Filter by type"
                  >
                    <Filter
                      className={`w-4 h-4 ${
                        selectedType !== "all" ? "text-primary" : ""
                      }`}
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Type filter"
                  selectionMode="single"
                  selectedKeys={[selectedType]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleTypeChange(selected);
                  }}
                >
                  <DropdownItem key="all">{t("All")}</DropdownItem>
                  <DropdownItem key="recharge">{t("Recharge")}</DropdownItem>
                  <DropdownItem key="purchase">{t("Purchase")}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </TableColumn>
          <TableColumn>{t("Description")}</TableColumn>
          <TableColumn>{t("Amount")}</TableColumn>
          <TableColumn>{t("Balance")}</TableColumn>
          <TableColumn>
            <div className="flex items-center gap-2">
              <span>{t("Status")}</span>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Filter by status"
                  >
                    <Filter
                      className={`w-4 h-4 ${
                        selectedStatus !== "all" ? "text-primary" : ""
                      }`}
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Status filter"
                  selectionMode="single"
                  selectedKeys={[selectedStatus]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleStatusChange(selected);
                  }}
                >
                  <DropdownItem key="all">{t("All")}</DropdownItem>
                  <DropdownItem key="0">{t("Pending")}</DropdownItem>
                  <DropdownItem key="1">{t("Completed")}</DropdownItem>
                  <DropdownItem key="2">{t("Failed")}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          isLoading={loading}
          loadingContent={<Spinner />}
          emptyContent={t("No orders found")}
        >
          {(order) => (
            <TableRow key={order.id}>
              <TableCell>{formatDate(order.confirm_at)}</TableCell>
              <TableCell>
                <span
                  className={
                    order.order_type === "recharge"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                {
                    order.order_type === "recharge" ? t("Recharge") : t("Purchase")
                  }
                </span>
              </TableCell>
              <TableCell>{order.description}</TableCell>
              <TableCell>
                <span
                  className={
                    order.order_type === "recharge"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  <span>
                    {order.order_type === "recharge" ? "+" : ""}
                  </span>
                  <span>{order.amount}</span>
                </span>
              </TableCell>
              <TableCell>{order.balance}</TableCell>
              <TableCell>
                <Chip
                  className="capitalize"
                  color={getStatusColor(order.payment_state)}
                  size="sm"
                  variant="flat"
                >
                  {t(
                    order.payment_state === 1
                      ? "Completed"
                      : order.payment_state === 2
                      ? "Failed"
                      : "Pending"
                  )}
                </Chip>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pages > 1 && (
        <div className="flex w-full justify-center">
          <Pagination
            showControls
            color="primary"
            variant="light"
            page={currentPage}
            total={pages}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AccountBalanceTable;
