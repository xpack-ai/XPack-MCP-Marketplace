"use client";

import React from "react";
import { Spinner } from "@nextui-org/react";
import { Search, Star, Grid, ArrowRight } from "lucide-react";
import {
  Input,
  Button,
  Pagination,
  Card,
  CardBody,
  CardFooter,
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

interface HomeProps {
  // 状态
  searchQuery: string;
  services: ServiceData[];
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
  currentPage,
  total,
  pageSize,
  loading,
  onSearchChange,
  onSearch,
  onPageChange,
  searchSuggestions = [],
  navItems = [],
}) => {
  const { platformConfig } = usePlatformConfig();
  const { t } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 top-0 left-0 right-0 bottom-0 flex flex-col justify-between">
      <Navigation items={navItems} />
      <div>
        {/* Classic Hero Section */}
        <div className="bg-white border-b border-gray-200 pt-20">
          <div className="mx-auto px-6 py-16 max-w-6xl">
            <div className="text-center mb-12">
              {/* Classic Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-sm flex items-center justify-center">
                  <Grid className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Classic Title */}
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-800">
                {t(
                  platformConfig.headline ||
                    platformConfig.name ||
                    _DefaultPlatformConfig.headline ||
                    ""
                )}
              </h1>

              {/* Classic Subtitle */}
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t(
                  platformConfig.subheadline ||
                    _DefaultPlatformConfig.subheadline ||
                    ""
                )}
              </p>
            </div>

            {/* Classic Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white border border-gray-300 rounded-sm shadow-md overflow-hidden">
                <div className="flex">
                  <div className="flex-1">
                    <Input
                      size="lg"
                      placeholder={
                        searchSuggestions.length > 0
                          ? t(searchSuggestions[0])
                          : t("Search MCP servers")
                      }
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onSearch()}
                      startContent={
                        <Search className="w-5 h-5 text-gray-400" />
                      }
                      className="w-full"
                      classNames={{
                        input:
                          "text-lg text-gray-900 placeholder:text-gray-500",
                        inputWrapper: "h-14 shadow-none px-4 bg-white border-0",
                      }}
                      variant="flat"
                      radius="none"
                    />
                  </div>
                  <Button
                    onPress={onSearch}
                    className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 h-14 px-8 rounded-sm font-medium"
                    size="lg"
                  >
                    {t("Search")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Server List Section */}
        {loading ? (
          <div className="mx-auto h-[200px] flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Spinner size="lg" color="primary" />
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 py-16">
            <div className="mx-auto px-6 max-w-7xl">
              {/* Server Grid */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {services.map((service) => (
                  <Link
                    key={service.service_id}
                    href={`/server/${service.service_id}`}
                    className="block group w-full md:w-[calc(50%-16px)] lg:w-[calc(33%-16px)] xl:w-[calc(25%-16px)]"
                  >
                    <Card className="group h-[200px] w-full hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 bg-white rounded-sm shadow-sm">
                      <CardBody className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 w-full overflow-hidden">
                            <div className="w-8 h-8 bg-slate-600 rounded-sm flex items-center justify-center">
                              <Star className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-base mb-1 truncate group-hover:text-slate-700 transition-colors truncate">
                                {service.name}
                              </h3>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-slate-600 transition-colors" />
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                          {service.short_description ||
                            t("No description available")}
                        </p>
                      </CardBody>

                      {/* Footer */}
                      <CardFooter className="pt-0 px-4 pb-4">
                        <div className="flex items-center justify-between w-full">
                          {/* Tools count */}
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">
                              {t("{{count}} Tools", {
                                count: service.tools.length,
                              })}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex flex-col items-end">
                            <Price
                              price={service.price}
                              charge_type={service.charge_type}
                              input_token_price={service.input_token_price}
                              output_token_price={service.output_token_price}
                            />
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Classic Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={onPageChange}
                    showControls
                    classNames={{
                      wrapper:
                        "gap-0 overflow-visible h-8 border border-gray-300 bg-white shadow-sm rounded-none overflow-hidden",
                      item: "w-8 h-8 text-small rounded-none bg-transparent text-gray-700 hover:bg-gray-50 rounded-none",
                      cursor:
                        "bg-red-600 border-red-600 text-white font-medium rounded-none",
                      next: "rounded-none",
                      prev: "rounded-none",
                    }}
                    size="sm"
                    variant="light"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <Faq />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};
