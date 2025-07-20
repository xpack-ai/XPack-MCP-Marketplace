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
  }, [pagination.page, pagination.pageSize, searchQuery, statusFilter]);

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
    pagination,
    fetchRevenues,
    setSearch,
    setStatus,
    setPage,
    setPageSize,
  };
};
