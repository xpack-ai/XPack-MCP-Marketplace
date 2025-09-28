"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Theme } from "@/shared/types/system";
import { Home as ModernHome } from "./modern/Home";
import { Home as ClassicHome } from "./classic/Home";
import { Home as CreativeHome } from "./creative/Home";
import { Home as TemuHome } from "./temu/Home";
import { ServiceData } from "@/shared/types/marketplace";
import { fetchServices } from "@/services/marketplaceService";
import { Navigation } from "@/shared/components/Navigation";
import { MarketplaceMain } from "../marketplace/Main";
import { Footer } from "@/shared/components/Footer";
import { NavigationItems } from "./Theme.const";
import { Faq } from "../marketplace/Faq";

interface ThemeSelectorProps {
  initialServices: ServiceData[];
  initialTotal: number;
  initialPage: number;
  initialSearch: string;
  pageSize: number;
  error: string | null;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  initialServices,
  initialTotal,
  initialPage,
  initialSearch,
  pageSize,
  error,
}) => {
  const router = useRouter();
  const { platformConfig, topNavigation } = usePlatformConfig();
  const currentTheme = platformConfig.theme || Theme.DEFAULT;
  const navigationItems = [
    ...NavigationItems,
    ...(platformConfig.about_page
      ? [
          {
            label: "About",
            href: "/about",
          },
        ]
      : []),
    ...topNavigation.map((item) => ({
      label: item.title,
      href: item.link,
      target: item.target,
    })),
  ];

  // state management for services, search query, pagination, and loading state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [services, setServices] = useState<ServiceData[]>(initialServices);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // search suggestion
  const searchSuggestions = ["Search services..."];

  // loading service data
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
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  };

  // when search and page change,scrolling to the page top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, searchQuery]);

  // update url param
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

  // page change handler
  const handlePageChange = (page: number) => {
    updateURL(page, searchQuery);
    loadServices(page, searchQuery);
  };

  // search submit handler
  const handleSearch = () => {
    updateURL(1, searchQuery);
    loadServices(1, searchQuery);
  };

  // search input change handler
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // render the theme page based on the current theme
  switch (currentTheme) {
    case Theme.MODERN:
      return (
        <ModernHome
          searchQuery={searchQuery}
          services={services}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          loading={loading}
          error={error}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          searchSuggestions={searchSuggestions}
          navItems={navigationItems}
        />
      );
    case Theme.CLASSIC:
      return (
        <ClassicHome
          searchQuery={searchQuery}
          services={services}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          loading={loading}
          error={error}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          searchSuggestions={searchSuggestions}
          navItems={navigationItems}
        />
      );
    case Theme.CREATIVE:
      return (
        <CreativeHome
          searchQuery={searchQuery}
          services={services}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          loading={loading}
          error={error}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          searchSuggestions={searchSuggestions}
          navItems={navigationItems}
        />
      );
    case Theme.TEMU:
      return (
        <TemuHome
          searchQuery={searchQuery}
          services={services}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          loading={loading}
          error={error}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          searchSuggestions={searchSuggestions}
          navItems={navigationItems}
        />
      );
    case Theme.DEFAULT:
    default:
      return (
        <div className="min-h-screen bg-background flex flex-col justify-between">
          <Navigation items={navigationItems} />
          <main className="flex-1">
            <MarketplaceMain
              initialServices={services}
              initialTotal={total}
              initialPage={currentPage}
              initialSearch={searchQuery}
              pageSize={pageSize}
              error={error}
            />
            <Faq />
          </main>
          <div>
            <Footer />
          </div>
        </div>
      );
  }
};
