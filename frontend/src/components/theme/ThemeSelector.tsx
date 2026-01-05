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
import { fetchServices, fetchTagsList } from "@/services/marketplaceService";
import { Navigation } from "@/shared/components/Navigation";
import { MarketplaceMain } from "../marketplace/Main";
import { Footer } from "@/shared/components/Footer";
import { NavigationItems } from "./Theme.const";
import { Faq } from "../marketplace/Faq";
import { useNavigationItems } from "@/shared/providers/ConfigProvider";

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
  const configNavigation = useNavigationItems() || NavigationItems;
  const navigationItems = [
    ...configNavigation,
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
  const isTagBarDisplay = platformConfig.tag_bar_display || false;
  // 可用的标签列表（这里可以从API获取或配置）
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState("ALL");
  // search suggestion
  const searchSuggestions = ["Search MCP servers"];

  useEffect(() => {
    const loadTagsList = async () => {
      const tags = await fetchTagsList();
      setAvailableTags(tags);
    };
    loadTagsList();
  }, []);

  // handle tag change
  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
    loadServices(1, searchQuery, tag);
  };
  // loading service data
  const loadServices = async (page: number, search: string, tag: string = "ALL") => {
    try {
      setLoading(true);
      const result = await fetchServices({
        page,
        page_size: pageSize,
        keyword: search,
        tag: tag !== "ALL" ? tag : undefined,
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
    loadServices(page, searchQuery, selectedTag);
  };

  // search submit handler
  const handleSearch = () => {
    updateURL(1, searchQuery);
    loadServices(1, searchQuery, selectedTag);
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
          currentTheme={currentTheme}
          selectedTag={selectedTag}
          handleTagChange={handleTagChange}
          isTagBarDisplay={isTagBarDisplay}
          availableTags={availableTags}
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
          currentTheme={currentTheme}
          selectedTag={selectedTag}
          handleTagChange={handleTagChange}
          isTagBarDisplay={isTagBarDisplay}
          availableTags={availableTags}
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
          currentTheme={currentTheme}
          selectedTag={selectedTag}
          handleTagChange={handleTagChange}
          isTagBarDisplay={isTagBarDisplay}
          availableTags={availableTags}
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
          currentTheme={currentTheme}
          selectedTag={selectedTag}
          handleTagChange={handleTagChange}
          isTagBarDisplay={isTagBarDisplay}
          availableTags={availableTags}
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
              currentTheme={currentTheme}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              isTagBarDisplay={isTagBarDisplay}
              availableTags={availableTags}
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
