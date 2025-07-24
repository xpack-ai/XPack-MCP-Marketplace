"use client";

import React, { useState } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Tabs, Tab, Chip, Card, CardBody } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
import { ProductHeader } from "@/shared/components/marketplace/ProductHeader";
import { ProductOverview } from "@/shared/components/marketplace/ProductOverview";
import { ProductTools } from "@/shared/components/marketplace/ProductTools";
import { ProductNotFound } from "@/shared/components/marketplace/ProductNotFound";
import { Monitor, Code, Settings } from "lucide-react";
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

  // navigation items
  navItems?: NavigationItem[];
}

export const Detail: React.FC<DetailProps> = ({
  product,
  breadcrumbs,
  url,
  navItems = [],
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { platformConfig } = usePlatformConfig();
  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col justify-between">
      <Navigation items={navItems} />
      <div>
        {/* Clean Background */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative z-10">
          {/* Modern Product Header */}
          <div className="pt-20">
            <div className="mx-auto pt-6 px-6 max-w-7xl">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <ProductHeader product={product} breadcrumbs={breadcrumbs} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mx-auto pb-6 px-6 max-w-7xl">
            <div className="flex gap-6 mt-6">
              {/* Left side - Main content */}
              <div className="flex-1">
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-2xl">
                  <CardBody className="p-0">
                    <Tabs
                      selectedKey={activeTab}
                      onSelectionChange={(key) => setActiveTab(key as string)}
                      variant="underlined"
                      color="primary"
                      className="px-6 pt-6"
                      classNames={{
                        tabList:
                          "gap-6 w-full relative rounded-none p-0 border-b border-gray-200",
                        cursor: "w-full bg-blue-600",
                        tab: "max-w-fit px-0 h-12",
                        tabContent:
                          "group-data-[selected=true]:text-blue-600 font-semibold text-gray-600",
                      }}
                    >
                      <Tab
                        key="overview"
                        title={
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
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
                            <Code className="w-4 h-4" />
                            <span>{t("Tools")}</span>
                            <Chip
                              size="sm"
                              className="h-4 text-xs bg-blue-600 text-white"
                            >
                              {product.tools.length}
                            </Chip>
                          </div>
                        }
                      >
                        <div className="p-6 pt-4">
                          <ProductTools product={product} />
                        </div>
                      </Tab>
                    </Tabs>
                  </CardBody>
                </Card>
              </div>

              {/* Right side - Server Config */}
              <div className="min-w-[400px] w-[40%] max-w-100 flex-shrink-0">
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-2xl">
                  <CardBody>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {t("Configuration")}
                      </h3>
                    </div>
                    {/* Code Snippet */}
                    <Card className="w-full max-w-2xl bg-black text-white p-2 sm:p-4 rounded-lg relative z-10">
                      <div className="text-left font-mono">
                        <Chip
                          className="mb-2 text-white"
                          size="sm"
                          variant="flat"
                        >
                          {platformConfig?.name} MCP
                        </Chip>
                        <pre className="p-2 sm:p-4 rounded-md text-xs overflow-x-auto">
                          <code className="text-gray-300 whitespace-pre-wrap">
                            {`{
  "mcpServers": {
    "xpack-mcp-market": {
      "type": "sse",
      "autoApprove"":"all",
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
