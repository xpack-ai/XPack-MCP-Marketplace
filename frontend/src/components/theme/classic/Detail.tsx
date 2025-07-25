"use client";

import React, { useState } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Tabs, Tab, Chip, Card, CardBody } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
import { ProductOverview } from "@/shared/components/marketplace/ProductOverview";
import { ProductNotFound } from "@/shared/components/marketplace/ProductNotFound";
import { FileText, Wrench, Cog } from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import Link from "next/link";
import { Price } from "@/shared/components/marketplace/Price";
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
}

export const Detail: React.FC<DetailProps> = ({
  product,
  breadcrumbs,
  url,
  mcpName,
  navItems = [],
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { platformConfig } = usePlatformConfig();

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 top-0 left-0 right-0 bottom-0 flex flex-col justify-between">
      <Navigation items={navItems} />
      <div>
        {/* Classic Product Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm pt-28 pb-6">
          <div className="mx-auto p-6 max-w-7xl">
            <div className="bg-gray-50 rounded-sm p-6 border border-gray-200">
              <Card shadow="none" className="bg-gray-50">
                <CardBody>
                  {/* Breadcrumb */}
                  <nav className="text-sm text-default-500 flex items-center gap-1 mb-10">
                    <Link href="/" className="hover:underline">
                      {t("Home")}
                    </Link>
                    <span>/</span>
                    <b className="text-default-700">{t(product.name)}</b>
                  </nav>

                  {/* Header with title and price */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">
                        {product.name}
                      </h1>

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 my-3">
                          {product.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              size="sm"
                              variant="flat"
                              color="primary"
                              radius="sm"
                              className="text-xs h-5"
                            >
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      )}
                      <p className="text-sm mb-4">
                        {product.short_description ||
                          t("No description available")}
                      </p>
                    </div>
                  </div>

                  {/* Price section */}
                  {product.charge_type && (
                    <div className="flex gap-2 items-center">
                      <b className="text-md">{t("Price")}:</b>
                      <Price
                        price={product.price}
                        charge_type={product.charge_type}
                      />
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto p-6 max-w-7xl">
          <div className="flex gap-6 mt-6">
            {/* Left side - Main content */}
            <div className="flex-1">
              <Card className="bg-white border border-gray-200 shadow-sm rounded-sm">
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
                      cursor: "w-full bg-red-600",
                      tab: "max-w-fit px-0 h-12",
                      tabContent:
                        "group-data-[selected=true]:text-red-600 font-semibold text-gray-700",
                    }}
                  >
                    <Tab
                      key="overview"
                      title={
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
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
                          <Wrench className="w-4 h-4" />
                          <span>{t("Tools")}</span>
                          <Chip
                            size="sm"
                            className="h-4 text-xs bg-red-600 text-white rounded-sm"
                          >
                            {product.tools.length}
                          </Chip>
                        </div>
                      }
                    >
                      <div className="p-6 pt-4">
                        <div className="space-y-4 px-3">
                          {product.tools.length > 0 ? (
                            product.tools.map((tool, index) => (
                              <Card
                                radius="sm"
                                key={`${product.service_id}-tool-${index}`}
                                shadow="none"
                                className="border-1"
                              >
                                <CardBody>
                                  <h4 className="font-semibold text-sm mb-2 text-red-600">
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
                      </div>
                    </Tab>
                  </Tabs>
                </CardBody>
              </Card>
            </div>

            {/* Right side - Server Config */}
            <div className="min-w-[400px] w-[40%] max-w-100 flex-shrink-0">
              <Card className="bg-white border border-gray-200 shadow-sm rounded-sm">
                <CardBody>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center">
                      <Cog className="w-5 h-5 text-white" />
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
    "${mcpName || "xpack-mcp-market"}": {
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
      <div>
        <Footer />
      </div>
    </div>
  );
};
