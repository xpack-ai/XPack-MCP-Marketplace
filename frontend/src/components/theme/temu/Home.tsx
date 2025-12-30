"use client";

import React from "react";
import { CardFooter, Spinner } from "@nextui-org/react";
import { Search, ShoppingBag, Tag, TrendingUp } from "lucide-react";
import {
  Input,
  Button,
  Pagination,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ServiceData } from "@/shared/types/marketplace";
import { Price } from "@/shared/components/marketplace/Price";
import {
  _DefaultPlatformConfig,
  usePlatformConfig,
} from "@/shared/contexts/PlatformConfigContext";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";
import { NavigationItem } from "@/shared/components/Navigation";
import { Faq } from "@/components/marketplace/Faq";
import { TagFilter } from "@/shared/components/marketplace/TagFilter";
import { ThemeType } from "@/shared/types/system";

interface HomeProps {
  // 状态
  searchQuery: string;
  services: ServiceData[];
  isTagBarDisplay: boolean;
  availableTags: string[];
  selectedTag: string;
  handleTagChange: (tag: string) => void;
  currentTheme: ThemeType;
  currentPage: number;
  total: number;
  pageSize: number;
  loading: boolean;
  error: string | null;

  // 事件处理函数
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;

  // 可选配置
  searchSuggestions?: string[];

  // navigation items
  navItems?: NavigationItem[];
}

export const Home: React.FC<HomeProps> = ({
  searchQuery,
  services,
  isTagBarDisplay,
  availableTags,
  selectedTag,
  handleTagChange,
  currentTheme,
  currentPage,
  total,
  pageSize,
  loading,
  error,
  onSearchChange,
  onSearch,
  onPageChange,
  navItems = [],
}) => {
  const { platformConfig } = usePlatformConfig();
  const { t } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto h-[100px] flex items-center justify-center">
          <div className="text-red-600 bg-white px-6 py-4 rounded-lg shadow-md border border-red-200">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen absolute top-0 left-0 right-0 bottom-0">
      <Navigation items={navItems} />

      {/* Temu Style Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 pt-20">
        <div className="mx-auto px-6 py-16 max-w-7xl">
          <div className="text-center mb-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
              {t(
                platformConfig.headline ||
                platformConfig.name ||
                _DefaultPlatformConfig.headline ||
                ""
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t(
                platformConfig.subheadline ||
                _DefaultPlatformConfig.subheadline ||
                ""
              )}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-3">
                <Input
                  placeholder={t("Search MCP servers")}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                  startContent={<Search className="w-5 h-5 text-gray-400" />}
                  className="flex-1"
                  classNames={{
                    input: "text-lg",
                    inputWrapper: "h-14 bg-white shadow-lg border-0",
                  }}
                  radius="lg"
                />
                <Button
                  onPress={onSearch}
                  className="bg-white text-orange-500 hover:bg-gray-50 font-semibold px-8 h-14 shadow-lg"
                  radius="lg"
                >
                  {t("Search")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* filter section */}
      {
        isTagBarDisplay && (
          <div className="pt-12">
            <TagFilter
              theme={currentTheme}
              tags={availableTags}
              selectedTag={selectedTag}
              onTagChange={handleTagChange}
              maxWidthPercent={80}
            />
          </div>
        )
      }

      {/* Products Section */}
      <div className="mx-auto px-6 py-12 max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? t("Search Results") : t("Featured Products")}
            </h2>
            {searchQuery && (
              <Chip color="warning" variant="flat">
                {total} {t("results")}
              </Chip>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="warning" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {services.map((service) => (
                <Link
                  key={service.service_id}
                  href={`/server/${service.service_id}`}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 hover:border-orange-200 h-[200px]">
                    <CardBody className="p-0">
                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {service.short_description ||
                            service.long_description ||
                            "No description available"}
                        </p>
                      </div>
                    </CardBody>
                    <CardFooter>
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <Price
                          price={service.price}
                          charge_type={service.charge_type}
                          input_token_price={service.input_token_price}
                          output_token_price={service.output_token_price}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={onPageChange}
                  color="warning"
                  size="lg"
                  showControls
                  className="gap-2"
                />
              </div>
            )}
          </>
        )}
        <Faq />
      </div>

      <Footer />
    </div>
  );
};
