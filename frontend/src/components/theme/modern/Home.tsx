"use client";

import React from "react";
import { Spinner } from "@nextui-org/react";
import { Search, Sparkles, Zap } from "lucide-react";
import {
  Input,
  Button,
  Pagination,
  Card,
  CardBody,
  CardFooter,
  Chip,
} from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ServiceData } from "@/shared/types/marketplace";
import { Price } from "@/shared/components/marketplace/Price";
import { ArrowRight } from "lucide-react";
import {
  _DefaultPlatformConfig,
  usePlatformConfig,
} from "@/shared/contexts/PlatformConfigContext";

import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 left-10 w-12 h-12 bg-gradient-to-tr from-indigo-400/20 to-blue-500/20 rounded-full animate-bounce"></div>
      <div className="absolute bottom-40 right-20 w-8 h-8 bg-gradient-to-bl from-blue-300/30 to-indigo-400/30 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 left-1/4 w-6 h-6 bg-gradient-to-tl from-indigo-300/30 to-blue-400/30 rounded-full animate-bounce"></div>

      {/* Modern Navigation */}
      <Navigation items={navItems} />
      {/* Modern Hero Section */}
      <div className="pt-32">
        <div className="mx-auto px-6 py-20 max-w-6xl">
          <div className="text-center mb-16">
            {/* Modern Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Modern Title */}
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              {t(
                platformConfig.headline ||
                  platformConfig.name ||
                  _DefaultPlatformConfig.headline ||
                  ""
              )}
            </h1>

            {/* Modern Subtitle */}
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t(
                platformConfig.subheadline ||
                  _DefaultPlatformConfig.subheadline ||
                  ""
              )}
            </p>
          </div>

          {/* Modern Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
              <div className="flex gap-1">
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
                    startContent={<Search className="w-5 h-5 text-gray-400" />}
                    className="w-full"
                    classNames={{
                      input:
                        "text-base text-gray-900 placeholder:text-gray-500",
                      inputWrapper: "h-12 shadow-none px-4 bg-white border-0",
                    }}
                    variant="flat"
                  />
                </div>
                <Button
                  onPress={onSearch}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white h-12 px-6 rounded-lg shadow-sm"
                  size="lg"
                >
                  {t("Search")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        {/* Server List Section */}
        {loading ? (
          <div className="mx-auto h-[200px] flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Spinner size="lg" color="primary" />
            </div>
          </div>
        ) : (
          <div className="py-16">
            <div className="mx-auto px-6 max-w-7xl">
              {/* Server Grid */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {services.map((service) => (
                  <Link
                    key={service.service_id}
                    href={`/server/${service.service_id}`}
                    className="w-full md:w-[calc(50%-16px)] lg:w-[calc(33%-16px)] xl:w-[calc(25%-16px)]"
                  >
                    <Card className="group h-[200px] w-full hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-100 rounded-xl shadow-sm">
                      <CardBody className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-base mb-1 truncate group-hover:text-blue-600 transition-colors">
                                {service.name}
                              </h3>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
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
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={onPageChange}
                    showControls
                    color="primary"
                    variant="light"
                    size="lg"
                    classNames={{
                      wrapper: "gap-2",
                      item: "w-10 h-10 text-sm font-medium",
                      cursor:
                        "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </section>
      <Faq />

      <Footer />
    </div>
  );
};
