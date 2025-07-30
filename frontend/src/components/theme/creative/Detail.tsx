"use client";

import React, { useState } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Tabs, Tab, Chip, Card, CardBody, Button } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
import { ProductHeader } from "@/shared/components/marketplace/ProductHeader";
import { ProductOverview } from "@/shared/components/marketplace/ProductOverview";
import { ProductNotFound } from "@/shared/components/marketplace/ProductNotFound";
import { Sparkles, Zap, Settings2, Copy } from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { NavigationItem } from "@/shared/components/Navigation";

interface DetailProps {
  product: ServiceData;
  breadcrumbs?: {
    link: string;
    name: string;
  }[];
  url?: string;
  mcpName?: string;
  // navigation items
  navItems?: NavigationItem[];
  onCopy: () => void;
}

export const Detail: React.FC<DetailProps> = ({
  product,
  breadcrumbs,
  url,
  mcpName,
  navItems = [],
  onCopy,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { platformConfig } = usePlatformConfig();

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 relative overflow-hidden flex flex-col justify-between">
      <Navigation items={navItems} />
      {/* Creative Background */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          {/* Artistic decorative elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-2xl" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-orange-200/40 to-yellow-200/40 rounded-2xl rotate-45 blur-xl" />
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-yellow-200/25 to-pink-200/25 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-pink-200/35 to-red-200/35 rounded-2xl rotate-12 blur-xl" />

          {/* Additional artistic elements */}
          <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-orange-300/20 to-yellow-300/20 rounded-full blur-xl" />
          <div className="absolute top-2/3 right-1/3 w-16 h-16 bg-gradient-to-br from-pink-300/25 to-orange-300/25 rounded-lg rotate-45 blur-lg" />
        </div>

        <div className="relative z-10">
          {/* Creative Product Header */}
          <div className="pt-24">
            <div className="mx-auto p-6 max-w-7xl">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200/50">
                <ProductHeader product={product} breadcrumbs={breadcrumbs} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mx-auto p-6 max-w-7xl">
            <div className="flex gap-6 mt-6">
              {/* Left side - Main content */}
              <div className="flex-1">
                <Card className="bg-white/95 backdrop-blur-sm border border-pink-200/50 shadow-lg overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-orange-500/5" />
                  <CardBody className="p-0 relative">
                    <Tabs
                      selectedKey={activeTab}
                      onSelectionChange={(key) => setActiveTab(key as string)}
                      variant="underlined"
                      color="secondary"
                      className="px-6 pt-6"
                      classNames={{
                        tabList:
                          "gap-6 w-full relative rounded-none p-0 border-b border-pink-200/50",
                        cursor:
                          "w-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500",
                        tab: "max-w-fit px-0 h-12",
                        tabContent:
                          "group-data-[selected=true]:text-pink-600 font-semibold",
                      }}
                    >
                      <Tab
                        key="overview"
                        title={
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>{t("Overview")}</span>
                          </div>
                        }
                      >
                        <div className="p-6 pt-4">
                          <ProductOverview product={product} />
                        </div>
                      </Tab>
                      <Tab
                        key="tools"
                        title={
                          <div className="flex gap-2 items-center">
                            <Zap className="w-4 h-4" />
                            <span>{t("Tools")}</span>
                            <Chip
                              size="sm"
                              className="h-4 text-xs bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white shadow-lg"
                            >
                              {product.tools.length}
                            </Chip>
                          </div>
                        }
                      >
                        <div className="p-6 pt-4">
                          {product.tools.length > 0 ? (
                            product.tools.map((tool, index) => (
                              <Card
                                radius="sm"
                                key={`${product.service_id}-tool-${index}`}
                                shadow="none"
                                className="border-1"
                              >
                                <CardBody>
                                  <h4 className="font-semibold text-sm mb-2 text-pink-600">
                                    {tool.name}
                                  </h4>
                                  <p className="text-sm mb-3">
                                    {tool.description ||
                                      t("No description available")}
                                  </p>
                                </CardBody>
                              </Card>
                            ))
                          ) : (
                            <Card>
                              <CardBody>
                                <p className="text-center">
                                  {t("No tools available in this service.")}
                                </p>
                              </CardBody>
                            </Card>
                          )}
                        </div>
                      </Tab>
                    </Tabs>
                  </CardBody>
                </Card>
              </div>

              {/* Right side - Server Config */}
              <div className="min-w-[400px] w-[40%] max-w-100 flex-shrink-0">
                <Card className="bg-white/95 backdrop-blur-sm border border-pink-200/50 shadow-lg overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5" />
                  <CardBody className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 rounded-lg">
                        <Settings2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                        {t("Configuration")}
                      </h3>
                    </div>
                    {/* Code Snippet */}
                    <Card className="w-full max-w-2xl bg-black text-white p-2 sm:p-4 rounded-lg relative z-10">
                      <div className="text-left font-mono">
                        <div className="flex items-center gap-2 mb-2 justify-between">
                          <Chip className="text-white" size="sm" variant="flat">
                            {platformConfig?.name} MCP
                          </Chip>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="min-w-6 w-6 h-6 p-0 text-white"
                            onPress={onCopy}
                            aria-label={t("Copy code")}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                        <pre className="p-2 sm:p-4 rounded-md text-xs overflow-x-auto">
                          <code className="text-gray-300 whitespace-pre-wrap">
                            {`{
  "mcpServers": {
    "${mcpName}": {
      "type": "sse",
      "autoApprove":"all",
      "url": "${url}?apikey=`}
                            <span className="text-success">{`{Your-${platformConfig?.name}-API-Key}`}</span>
                            {`"
    }
  }
}`}
                          </code>
                        </pre>
                      </div>
                    </Card>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* SEO-friendly: Simple text content for search engines */}
            <div className="hidden" aria-hidden="true">
              <h2>Tools ({product.tools.length})</h2>
              {product.tools.length > 0 &&
                product.tools.map((tool, index) => (
                  <div key={`seo-${product.service_id}-tool-${index}`}>
                    <h4>{tool.name}</h4>
                    <p>{tool.description || ""}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};
