"use client";

import React, { useEffect, useState } from "react";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Theme } from "@/shared/types/system";
import { Detail as ModernDetail } from "./modern/Detail";
import { Detail as ClassicDetail } from "./classic/Detail";
import { Detail as CreativeDetail } from "./creative/Detail";
import { Detail as TemuDetail } from "./temu/Detail";
import { ServiceData } from "@/shared/types/marketplace";
import { ProductDetailClient } from "@/shared/components/marketplace/ProductDetail";
import { Navigation } from "@/shared/components/Navigation";
import { Footer } from "@/shared/components/Footer";
import { NavigationItems } from "./Theme.const";

interface ProductDetailThemeSelectorProps {
  product: ServiceData;
  breadcrumbs?: {
    link: string;
    name: string;
  }[];
}

export const ProductDetailThemeSelector: React.FC<
  ProductDetailThemeSelectorProps
> = ({ product, breadcrumbs }) => {
  const { platformConfig } = usePlatformConfig();
  const currentTheme = platformConfig.theme || Theme.DEFAULT;
  const [url, setUrl] = useState<string>(process.env.NEXT_PUBLIC_MCP_URL || "");
  const [mcpName, setMcpName] = useState<string>("");
  useEffect(() => {
    if (url || !product.slug_name) return;
    setUrl(`${window.location.origin}/mcp/${product.slug_name}`);
  }, [product.slug_name]);
  function sanitizeMCPServerName(rawName: string | undefined): string {
    if (!rawName) return "xpack-mcp-service";

    // Lower-case & replace invalid chars with hyphen
    let name = rawName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-");

    // Collapse multiple hyphens
    name = name.replace(/-+/g, "-");

    // Trim leading/trailing hyphens
    name = name.replace(/^-+/, "").replace(/-+$/, "");


    return name || "mcp-service";
  }
  useEffect(() => {
    setMcpName(sanitizeMCPServerName(platformConfig.name));
  }, [platformConfig.name]);


  //Render the About page based on the current theme
  switch (currentTheme) {
    case Theme.MODERN:
      return (
        <ModernDetail
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={NavigationItems}
          mcpName={mcpName}
        />
      );
    case Theme.CLASSIC:
      return (
        <ClassicDetail
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={NavigationItems}
          mcpName={mcpName}
        />
      );
    case Theme.CREATIVE:
      return (
        <CreativeDetail
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={NavigationItems}
          mcpName={mcpName}
        />
      );
    case Theme.TEMU:
      return (
        <TemuDetail
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={NavigationItems}
          mcpName={mcpName}
        />
      );
    case Theme.DEFAULT:
    default:
      return (
        <div className="min-h-screen bg-background flex flex-col justify-between">
          <Navigation items={NavigationItems} />
          <main className="flex-1">
            <ProductDetailClient product={product} mcpName={mcpName} />
          </main>
          <div>
            <Footer />
          </div>
        </div>
      );
  }
};
