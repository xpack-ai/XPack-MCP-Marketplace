"use client";

import React, { useState } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Tabs, Tab, Chip } from "@nextui-org/react";
import { ProductHeader } from "./ProductHeader";
import { ProductOverview } from "./ProductOverview";
import { ProductTools } from "./ProductTools";
import { ProductNotFound } from "./ProductNotFound";
import { ServerConfig } from "./ServerConfig";
import { ServiceData } from "@/shared/types/marketplace";

interface ProductDetailClientProps {
  product: ServiceData;
  breadcrumbs?: {
    link: string;
    name: string;
  }[];
  mcpName?: string;
  url?: string;
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  breadcrumbs,
  mcpName,
  url,
}) => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col mx-auto p-6 max-w-7xl">
      {product ? (
        <>
          <ProductHeader product={product} breadcrumbs={breadcrumbs} />

          <div className="flex gap-6 mt-6">
            {/* Left side - Main content */}
            <div className="flex-1">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                variant="underlined"
                color="primary"
              >
                <Tab key="overview" title={t("Overview")}>
                  <ProductOverview product={product} />
                </Tab>
                <Tab
                  key="tools"
                  title={
                    <div className="flex gap-2 items-center">
                      <span>{t("Tools")}</span>
                      <Chip size="sm" className="h-4 text-xs">
                        {" "}
                        {product.tools.length}
                      </Chip>
                    </div>
                  }
                >
                  <ProductTools product={product} />
                </Tab>
              </Tabs>
            </div>

            {/* Right side - Server Config */}
            <ServerConfig mcpName={mcpName} url={url} />
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
        </>
      ) : (
        <ProductNotFound />
      )}
    </div>
  );
};
