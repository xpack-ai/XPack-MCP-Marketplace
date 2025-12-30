"use client";

import React from "react";
import { Spinner } from "@nextui-org/react";
import { Sparkles, Palette, SearchIcon } from "lucide-react";
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <Navigation items={navItems} />

      {/* Creative Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
        {/* main decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/15 to-orange-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl"></div>

        {/* small decorative circles */}
        <div className="absolute top-10 right-20 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-red-500/20 rounded-full transform rotate-12"></div>
        <div className="absolute top-32 left-16 w-12 h-12 bg-gradient-to-br from-orange-400/25 to-yellow-400/25 rounded-full transform -rotate-12"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-br from-yellow-400/15 to-pink-400/15 rounded-full transform rotate-6"></div>
        <div className="absolute bottom-32 right-16 w-14 h-14 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full transform -rotate-6"></div>

        {/* small decorative points */}
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-pink-400/30 rounded-full"></div>
        <div className="absolute top-2/3 left-1/5 w-3 h-3 bg-orange-400/40 rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/5 w-5 h-5 bg-yellow-400/25 rounded-full"></div>
      </div>

      {/* Creative Hero Section */}
      <div className="relative z-10 pt-32">
        <div className="mx-auto px-6 py-12 max-w-6xl">
          <div className="text-center mb-12">
            {/* Creative Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 p-4 rounded-2xl shadow-lg transform rotate-12">
                <Palette className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Creative Title */}
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-red-500 to-orange-600">
                {t(
                  platformConfig.headline ||
                  platformConfig.name ||
                  _DefaultPlatformConfig.headline ||
                  ""
                )}
              </span>
            </h1>

            {/* Creative Subtitle */}
            <p className="text-lg font-medium max-w-3xl mx-auto leading-relaxed text-gray-700">
              {t(
                platformConfig.subheadline ||
                _DefaultPlatformConfig.subheadline ||
                ""
              )}
            </p>
          </div>

          {/* Creative Search Bar */}
          <div className="max-w-3xl mx-auto relative">
            <div className="relative">
              {/* Search container */}
              <div className="relative bg-white/70 backdrop-blur-sm p-2 rounded-2xl border border-pink-200/50 shadow-lg">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      size="lg"
                      placeholder={
                        searchSuggestions.length > 0
                          ? t(searchSuggestions[0])
                          : t("✨ Discover amazing servers...")
                      }
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onSearch()}
                      startContent={
                        <div className="flex items-center gap-2 ml-2">
                          <Sparkles className="w-5 h-5 text-pink-500" />
                        </div>
                      }
                      className="w-full"
                      classNames={{
                        input:
                          "text-lg text-gray-800 placeholder:text-gray-500 font-medium",
                        inputWrapper:
                          "h-16 shadow-none px-4 bg-transparent border-0",
                      }}
                      variant="flat"
                    />
                  </div>
                  <Button
                    onPress={onSearch}
                    className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-16 w-16 rounded-2xl"
                    size="lg"
                    isIconOnly
                  >
                    <SearchIcon size={32} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* filter section */}
      {
        isTagBarDisplay && (
          <>
            <TagFilter
              theme={currentTheme}
              tags={availableTags}
              selectedTag={selectedTag}
              onTagChange={handleTagChange}
              maxWidthPercent={80}
            />
          </>
        )
      }

      {/* Creative Server List Section */}
      {loading ? (
        <div className="relative z-10 mx-auto h-[200px] flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-pink-200/50">
            <div className="flex items-center gap-4">
              <Spinner size="lg" color="secondary" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className={`relative mx-auto px-6 ${isTagBarDisplay ? 'py-12' : 'py-16'} max-w-8xl`}>
            {/* Creative Server Grid */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {services.map((service, index) => {
                const gradientBorders = [
                  "border-pink-200/50",
                  "border-orange-200/50",
                  "border-yellow-200/50",
                  "border-red-200/50",
                  "border-purple-200/50",
                  "border-blue-200/50",
                ];
                const iconGradients = [
                  "bg-gradient-to-r from-pink-500 via-red-500 to-orange-500",
                  "bg-gradient-to-r from-orange-400 to-yellow-400",
                  "bg-gradient-to-r from-yellow-400 to-pink-400",
                  "bg-gradient-to-r from-red-400 to-pink-500",
                  "bg-gradient-to-r from-purple-400 to-pink-400",
                  "bg-gradient-to-r from-blue-400 to-purple-400",
                ];
                const iconRotations = [
                  "transform rotate-12",
                  "transform -rotate-12",
                  "transform rotate-6",
                  "transform -rotate-6",
                  "transform rotate-12",
                  "transform -rotate-12",
                ];

                return (
                  <Link
                    key={service.service_id}
                    href={`/server/${service.service_id}`}
                    className="block group w-full md:w-[calc(50%-16px)] lg:w-[calc(33%-16px)] xl:w-[calc(25%-16px)]"
                  >
                    <Card
                      className={`
                      bg-white/80 backdrop-blur-sm shadow-lg 
                      border ${gradientBorders[index % 6]} 
                      hover:scale-105 hover:shadow-xl 
                      transition-all duration-300 ease-out
                      group-hover:bg-white/90 relative
                      h-[200px] w-full
                    `}
                    >
                      <CardBody className="p-6">
                        {/* creative icon */}
                        <div
                          className={` absolute -top-2 -left-2
                          w-8 h-8 ${iconGradients[index % 6]} 
                          rounded-2xl mb-4 ${iconRotations[index % 6]}
                          group-hover:scale-110 transition-transform duration-300
                        `}
                        ></div>

                        {/* service title */}
                        <div className="text-lg font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                          {service.name}
                        </div>

                        {/* service description */}
                        <div className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-2">
                          {service.short_description ||
                            t("No description available")}
                        </div>

                        {/* decorative elements */}
                        <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-pink-400/30 to-orange-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                );
              })}
            </div>

            {/* Creative Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-pink-200/50">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={onPageChange}
                    showControls
                    color="secondary"
                    variant="light"
                    size="lg"
                    classNames={{
                      wrapper: "gap-2",
                      item: "w-10 h-10 text-sm font-bold text-gray-700 hover:bg-pink-100/50 transition-all duration-300",
                      cursor:
                        "bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 shadow-lg text-white font-bold",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <style jsx>{`
            @keyframes fade-in-up {
              from {
                opacity: 0;
                transform: translateY(50px) scale(0.9);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            .animate-fade-in-up {
              animation: fade-in-up 0.8s ease-out;
            }
          `}</style>
        </div>
      )}
      <Faq />
      <Footer />
    </div>
  );
};
