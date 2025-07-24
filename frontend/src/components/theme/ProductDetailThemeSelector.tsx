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
  useEffect(() => {
    if (url || !product.slug_name) return;
    setUrl(`${window.location.origin}/mcp/${product.slug_name}`);
  }, [product.slug_name]);

  //Render the About page based on the current theme
  switch (currentTheme) {
    case Theme.MODERN:
      return (
        <ModernDetail
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={NavigationItems}
        />
      );
    case Theme.CLASSIC:
      return (
        <ClassicDetail
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={NavigationItems}
        />
      );
    case Theme.CREATIVE:
      return (
        <CreativeDetail
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={NavigationItems}
        />
      );
    case Theme.TEMU:
      return (
        <TemuDetail
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={NavigationItems}
        />
      );
    case Theme.DEFAULT:
    default:
      return (
        <div className="min-h-screen bg-background flex flex-col justify-between">
          <Navigation items={NavigationItems} />
          <main className="flex-1">
            <ProductDetailClient product={product} />
          </main>
          <div>
            <Footer />
          </div>
        </div>
      );
  }
};
