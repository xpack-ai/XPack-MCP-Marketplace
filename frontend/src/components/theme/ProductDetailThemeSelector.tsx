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
import { copyToClipboard } from "@/shared/utils/clipboard";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { sanitizeMCPServerName } from "@/shared/utils/mcp";
import { useNavigationItems } from "@/shared/providers/ConfigProvider";
import { withComponentInjection } from "@/shared/hooks/useComponentInjection";

interface ProductDetailThemeSelectorProps {
  product: ServiceData;
  breadcrumbs?: {
    link: string;
    name: string;
  }[];
}

const BasicProductDetailThemeSelector: React.FC<
  ProductDetailThemeSelectorProps
> = ({ product, breadcrumbs }) => {
  const { platformConfig, topNavigation } = usePlatformConfig();
  const currentTheme = platformConfig.theme || Theme.DEFAULT;
  const mcpServerPrefix =
    platformConfig.mcp_server_prefix || process.env.NEXT_PUBLIC_MCP_URL || "";
  const [url, setUrl] = useState<string>("");
  const [mcpName, setMcpName] = useState<string>("");
  const [can_invoke, setCanInvoke] = useState<boolean>(false);
  const { t } = useTranslation();
  const configNavigation = useNavigationItems() || NavigationItems;

  const navigationItems = [
    ...configNavigation,
    ...topNavigation.map((item) => ({
      label: item.title,
      href: item.link,
      target: item.target,
    })),
  ];
  useEffect(() => {
    if (url || !product.slug_name) return;
    setUrl(
      `${mcpServerPrefix || window.location.origin}/mcp/${product.slug_name}`
    );
  }, [product.slug_name]);
  useEffect(() => {
    setMcpName(sanitizeMCPServerName(product.name));
  }, [product.name]);
  useEffect(() => {
    setCanInvoke(product.can_invoke || false);
  }, [product.can_invoke]);
  const getCodeContent = () => {
    return `{
  "mcpServers": {
    "${mcpName || "xpack-mcp-market"}": {
      "type": "sse",
      "autoApprove":"all",
      "url": "${url}?authkey={Your-${platformConfig?.name}-Auth-Key}"
    }
  }
}`;
  };

  const handleCopy = async () => {
    const result = await copyToClipboard(getCodeContent());
    if (result.success) {
      toast.success(t("Copied to clipboard"));
    } else {
      toast.error(t("Copy failed, please copy manually"));
    }
  };

  //Render the About page based on the current theme
  switch (currentTheme) {
    case Theme.MODERN:
      return (
        <ModernDetail
          can_invoke={can_invoke}
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={navigationItems}
          mcpName={mcpName}
          onCopy={handleCopy}
        />
      );
    case Theme.CLASSIC:
      return (
        <ClassicDetail
          can_invoke={can_invoke}
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={navigationItems}
          mcpName={mcpName}
          onCopy={handleCopy}
        />
      );
    case Theme.CREATIVE:
      return (
        <CreativeDetail
          can_invoke={can_invoke}
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={navigationItems}
          mcpName={mcpName}
          onCopy={handleCopy}
        />
      );
    case Theme.TEMU:
      return (
        <TemuDetail
          can_invoke={can_invoke}
          product={product}
          breadcrumbs={breadcrumbs}
          url={url}
          navItems={navigationItems}
          mcpName={mcpName}
          onCopy={handleCopy}
        />
      );
    case Theme.DEFAULT:
    default:
      return (
        <div className="min-h-screen bg-background flex flex-col justify-between">
          <Navigation items={navigationItems} />
          <main className="flex-1">
            <ProductDetailClient
              product={product}
              can_invoke={can_invoke}
              mcpName={mcpName}
              url={url}
            />
          </main>
          <div>
            <Footer />
          </div>
        </div>
      );
  }
};
export const ProductDetailThemeSelector = withComponentInjection(
  "components/theme/ProductDetailThemeSelector",
  BasicProductDetailThemeSelector
);
