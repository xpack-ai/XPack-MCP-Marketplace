import { useState, useEffect, useCallback } from "react";
import { RevenueRecord } from "@/types/revenue";
import { getRevenueList } from "@/services/revenueService";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

export const useRevenueManagement = () => {
  const [records, setRecords] = useState<RevenueRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all"); // 付款方式筛选
  const [sortBy, setSortBy] = useState<string | undefined>(undefined); // 排序字段
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined); // 排序顺序
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchRevenues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRevenueList({
        page: pagination.page,
        page_size: pagination.pageSize,
        search: searchQuery,
        status: statusFilter === "all" ? undefined : statusFilter,
        payment_type: paymentTypeFilter === "all" ? undefined : paymentTypeFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (response.success && response.data) {
        setRecords(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.page.total || 0,
          page: response.page.page || prev.page,
          pageSize: response.page.page_size || prev.pageSize,
        }));
      } else {
        setError(response.error_message || "Get revenue record failed");
        setRecords([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Get revenue record failed"
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchQuery, statusFilter, paymentTypeFilter, sortBy, sortOrder]);

  const setSearch = useCallback((search: string) => {
    setSearchQuery(search);
    setPagination((prev) => ({ ...prev, page: 1 })); // reset to first page
  }, []);

  const setStatus = useCallback((status: string) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 })); // reset to first page
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setPaymentType = useCallback((paymentType: string) => {
    setPaymentTypeFilter(paymentType);
    setPagination((prev) => ({ ...prev, page: 1 })); // reset to first page
  }, []);

  const setSort = useCallback((field: string | undefined, order: 'asc' | 'desc' | undefined) => {
    setSortBy(field);
    setSortOrder(order);
    setPagination((prev) => ({ ...prev, page: 1 })); // reset to first page
  }, []);

  // initial load and pagination change
  useEffect(() => {
    fetchRevenues();
  }, [fetchRevenues]);

  return {
    records,
    loading,
    error,
    searchQuery,
    statusFilter,
    paymentTypeFilter,
    sortBy,
    sortOrder,
    pagination,
    fetchRevenues,
    setSearch,
    setStatus,
    setPaymentType,
    setSort,
    setPage,
    setPageSize,
  };
};
