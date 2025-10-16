"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "../../shared/components/marketplace/HeroSection";
import { ServiceListSection } from "@/shared/components/marketplace/ServiceListSection";
import { ServiceData } from "@/shared/types/marketplace";
import { fetchServices } from "@/services/marketplaceService";
import { Spinner } from "@nextui-org/react";

interface MarketplaceMainProps {
  initialServices: ServiceData[];
  initialTotal: number;
  initialPage: number;
  initialSearch: string;
  pageSize: number;
  error: string | null;
}

export const MarketplaceMain: React.FC<MarketplaceMainProps> = ({
  initialServices,
  initialTotal,
  initialPage,
  initialSearch,
  pageSize,
  error,
}) => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [services, setServices] = useState<ServiceData[]>(initialServices);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // load services data
  const loadServices = async (page: number, search: string) => {
    try {
      setLoading(true);
      const result = await fetchServices({
        page,
        page_size: pageSize,
        keyword: search,
      });

      setServices(result.data.services);
      setTotal(result.page.total);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load servers:", error);
    } finally {
      setLoading(false);
    }
  };

  // when search query changes, scroll to the top of the page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, searchQuery]);

  // update URL parameters
  const updateURL = (page: number, search: string) => {
    const params = new URLSearchParams();

    if (page > 1) {
      params.set("page", page.toString());
    }

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;

    router.push(newURL);
  };

  // when page number changes, reload
  const handlePageChange = (page: number) => {
    updateURL(page, searchQuery);
    loadServices(page, searchQuery);
  };

  // handle search submit
  const handleSearch = () => {
    updateURL(1, searchQuery);
    loadServices(1, searchQuery);
  };

  // if there is an error, show error message
  if (error) {
    return (
      <div className="mx-auto h-[100px] flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* Server List Section */}
      {loading ? (
        <div className="mx-auto h-[200px] flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <ServiceListSection
          services={services}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};
