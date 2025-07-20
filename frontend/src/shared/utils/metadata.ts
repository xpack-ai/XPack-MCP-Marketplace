import { platformConfigService } from "@/services/platformConfigService";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

// use Next.js unstable_cache to cache with tags
export const getCachedPlatformConfig = unstable_cache(
  async () => {
    return await platformConfigService.getPlatformConfig();
  },
  ["platform-config"],
  {
    tags: ["platform-config"],
    revalidate: 300, // 5 minutes cache
  }
);

// get dynamic title
export const getDynamicTitle = async (pageTitle?: string) => {
  const platformConfig = await getCachedPlatformConfig();
  const websiteTitle =
    platformConfig.platform?.website_title ||
    "Connect Your AI Agent to the Real World - XPack";

  if (pageTitle) {
    return `${pageTitle} - ${websiteTitle}`;
  }

  return websiteTitle;
};

// create base metadata object
export const createBaseMetadata = (title?: string): Metadata => ({
  title,
  description:
    "unified platform simplifies API access, accelerates development, and unlocks a universe of capabilities for your AI agents, chatbots, and automated workflows. ",
  keywords: [
    "API integration platform",
    "Agent API connectivity",
    "AI agent integration",
    "Chatbot API access",
    "Automated workflow API",
    "Third-party API connector",
    "MCP connector",
    "MCP integration",
    "API management for agents",
    "Agent development platform",
    "API orchestration",
    "API gateway for agents",
    "No-code API integration",
    "Low-code API development",
    "Enterprise API connectivity",
    "Developer tools API",
    "XPack.AI",
  ],
  authors: [{ name: "XPack.AI Team" }],
  openGraph: {
    title: "XPack.AI",
    description: "Connect Your Agent to Any API/MCP",
    type: "website",
  },
});
