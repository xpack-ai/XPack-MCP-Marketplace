"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MCPService,
  MCPServiceFormData,
  OpenAPIParseResponse,
  ServiceFilters,
  ServiceStats,
} from "@/shared/types/mcp-service";
import {
  getMCPServiceList,
  saveMCPService,
  deleteMCPService,
  toggleMCPServiceStatus,
  parseOpenAPIDocument as parseOpenAPIDocumentAPI,
} from "@/services/mcpService";

export const useMCPServicesList = () => {
  const [services, setServices] = useState<MCPService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // filter status
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // load servers list
  const loadServices = useCallback(
    async (page?: number, search?: string, status?: string) => {
      setLoading(true);
      setError(null);

      const currentPage = page || pagination.page;
      const currentSearch = search !== undefined ? search : searchTerm;
      const currentStatus = status !== undefined ? status : statusFilter;

      try {
        const response = await getMCPServiceList({
          page: currentPage,
          page_size: pagination.pageSize,
          search: currentSearch || undefined,
          status: currentStatus === "all" ? undefined : currentStatus,
        });

        if (response.success && response.data) {
          setServices(response.data);

          // update pagination
          setPagination((prev) => ({
            ...prev,
            page: currentPage,
            total: response.page?.total || 0,
          }));
        } else {
          setError(response.error_message || "Failed to load servers");
          setServices([]);
          setPagination((prev) => ({ ...prev, total: 0 }));
        }
      } catch (err) {
        setError("Failed to load servers");
        setServices([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
        console.error("Load servers error:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize] // only depend on pageSize, avoid circular dependency
  );

  // load servers list when component mount
  useEffect(() => {
    loadServices(1);
  }, []); // only execute once when component mount

  // pagination
  const handlePageChange = useCallback(
    (page: number) => {
      loadServices(page);
    },
    [loadServices]
  );

  // search
  const handleSearchChange = useCallback(
    (search: string) => {
      setSearchTerm(search);
      // reset to first page and reload
      loadServices(1, search, statusFilter);
    },
    [loadServices, statusFilter]
  );

  // status filter
  const handleStatusFilterChange = useCallback(
    (status: string) => {
      setStatusFilter(status);
      // reset to first page and reload
      loadServices(1, searchTerm, status);
    },
    [loadServices, searchTerm]
  );

  // get server stats
  const getServiceStats = useCallback((): ServiceStats => {
    const total = services.length;
    const online = services.filter((s) => s.enabled === 1).length;
    const offline = total - online;
    return { total, online, offline };
  }, [services]);

  // filter servers
  const filterServices = useCallback(
    (filters: ServiceFilters): MCPService[] => {
      return services.filter((service) => {
        const matchesSearch =
          !filters.search ||
          service.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          service.short_description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          service.apis.some(
            (api) =>
              api.name.toLowerCase().includes(filters.search.toLowerCase()) ||
              api.description
                ?.toLowerCase()
                .includes(filters.search.toLowerCase())
          );

        const matchesStatus =
          !filters.status ||
          filters.status === "all" ||
          (filters.status === "enabled" && service.enabled === 1) ||
          (filters.status === "disabled" && service.enabled === 0);

        return matchesSearch && matchesStatus;
      });
    },
    [services]
  );

  // create server
  const createService = useCallback(
    async (data: MCPServiceFormData): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await saveMCPService(data);

        if (result) await loadServices(1);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create server";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadServices]
  );

  // update server
  const updateService = useCallback(
    async (serviceId: string, data: MCPServiceFormData): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const formDataWithId = { ...data, id: serviceId };
        const result = await saveMCPService(formDataWithId);

        if (result) await loadServices(pagination.page);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update server";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadServices, pagination.page]
  );

  // delete server
  const deleteService = useCallback(
    async (serviceId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result = await deleteMCPService(serviceId);

        if (result) {
          // reload servers list
          await loadServices();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete server";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadServices]
  );

  // toggle server status
  const toggleServiceStatus = useCallback(
    async (serviceId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const service = services.find((s) => s.id === serviceId);
        if (!service) {
          throw new Error("Server not found");
        }
        const newEnabled = service.enabled === 1 ? 0 : 1;
        const result = await toggleMCPServiceStatus(serviceId, newEnabled);

        if (result) {
          // reload servers list
          setServices((prev) =>
            prev.map((s) =>
              s.id === serviceId ? { ...s, enabled: newEnabled } : s
            )
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to toggle server status";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [services, loadServices]
  );

  // parse OpenAPI document
  const parseOpenAPIDocument = useCallback(
    async (
      url?: string,
      file?: File,
      apiPath?: string
    ): Promise<OpenAPIParseResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await parseOpenAPIDocumentAPI(
          {
            file,
            url,
          },
          apiPath
        );

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(
            response.error_message || "Failed to parse OpenAPI document"
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to parse OpenAPI document";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    services,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    onPageChange: handlePageChange,
    getServiceStats,
    filterServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    parseOpenAPIDocument,
    loadServices, // expose reload function
  };
};
