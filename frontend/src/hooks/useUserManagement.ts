import { useState, useEffect, useCallback } from "react";
import { User } from "@/types/user";
import { getUserList, deleteUser } from "@/services/userService";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getUserList({
        page: pagination.page,
        page_size: pagination.pageSize,
        search: searchQuery,
      });

      if (response.success && response.data) {
        setUsers(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.page.total || 0,
          page: response.page.page || prev.page,
          pageSize: response.page.page_size || prev.pageSize,
        }));
      } else {
        setError(response.error_message || "get user list failed");
        setUsers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "get user list failed");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchQuery]);

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      try {
        const result = await deleteUser(userId);

        if (result) {
          // after delete, fetch users again
          await fetchUsers();
          return true;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete user failed");
        return false;
      }
    },
    [fetchUsers]
  );

  const setSearch = useCallback((search: string) => {
    setSearchQuery(search);
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
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    searchQuery,
    pagination,
    fetchUsers,
    handleDeleteUser,
    setSearch,
    setPage,
    setPageSize,
  };
};
