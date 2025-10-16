"use client";

import React, { useState } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Tabs, Tab, Chip, Card, CardBody, Button } from "@nextui-org/react";
import { ServiceData } from "@/shared/types/marketplace";
import { ProductHeader } from "@/shared/components/marketplace/ProductHeader";
import { ProductOverview } from "@/shared/components/marketplace/ProductOverview";
import { ProductNotFound } from "@/shared/components/marketplace/ProductNotFound";
import { FileText, Wrench, Cog, Copy } from "lucide-react";
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
  innerHeaderNode?: React.ReactNode;
}

export const Detail: React.FC<DetailProps> = ({
  product,
  breadcrumbs,
  url,
  mcpName,
  navItems = [],
  onCopy,
  innerHeaderNode,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { platformConfig } = usePlatformConfig();
  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navigation items={navItems} />
      <div>
        {/* Temu Style Product Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm pt-20">
          <div className="mx-auto p-6 max-w-7xl relative">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-4">
                <ol className="flex items-center space-x-2 text-sm text-gray-600">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <span className="mx-2 text-gray-400">/</span>
                      )}
                      <a
                        href={crumb.link}
                        className="hover:text-orange-500 transition-colors"
                      >
                        {crumb.name}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <ProductHeader product={product} breadcrumbs={breadcrumbs} />
            {innerHeaderNode}
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto p-6 max-w-7xl mt-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-0">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                variant="underlined"
                color="warning"
                className="px-6 pt-6"
                classNames={{
                  tabList:
                    "gap-6 w-full relative rounded-none p-0 border-b border-gray-200",
                  cursor: "w-full bg-orange-500",
                  tab: "max-w-fit px-0 h-12",
                  tabContent:
                    "group-data-[selected=true]:text-orange-600 font-medium text-gray-700",
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
                  <div className="p-6">
                    <ProductOverview product={product} />
                  </div>
                </Tab>
                <Tab
                  key="tools"
                  title={
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      <span>{t("Tools")}</span>
                    </div>
                  }
                >
                  <div className="p-2">
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
                              <h4 className="font-semibold text-sm mb-2 text-orange-600">
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
                              {t("No tools available in this server.")}
                            </p>
                          </CardBody>
                        </Card>
                      )}
                    </div>
                  </div>
                </Tab>
                <Tab
                  key="config"
                  title={
                    <div className="flex items-center gap-2">
                      <Cog className="w-4 h-4" />
                      <span>{t("Configuration")}</span>
                    </div>
                  }
                >
                  <div className="p-6">
                    {/* Code Snippet */}
                    <Card className="w-full bg-black text-white p-2 sm:p-4 rounded-lg relative z-10">
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
      "url": "${url}?authkey=`}
                            <span className="text-success">{`{Your-${platformConfig?.name}-Auth-Key}`}</span>
                            {`"
    }
  }
}`}
                          </code>
                        </pre>
                      </div>
                    </Card>
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};
