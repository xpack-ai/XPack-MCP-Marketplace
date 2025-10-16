"use client";

import React from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Card, CardBody } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";

export const AboutContent: React.FC = () => {
  const { platformConfig } = usePlatformConfig();
  const { t } = useTranslation();

  return (
    <Card shadow="none" className="bg-transparent">
      <CardBody className="space-y-4">
        <h1 className="text-3xl font-bold mb-6">{t("About Us")}</h1>
        <div className="leading-relaxed max-w-none">
          {platformConfig.about_page ? (
            <MarkdownPreview source={platformConfig.about_page} />
          ) : (
            <MarkdownPreview
              source={`
${t("**XPack** is a lightweight, open-source marketplace framework for MCP (Model Context Protocol) servers.")}
${t("It allows you to transform any OpenAPI into a monetizable MCP server and build your own API store in just minutes.")}


${t("✨ With XPack, you can:")}
${t("- ✅ **One-click OpenAPI → MCP server config**")}
${t("- 🧾 **SEO-friendly homepage + mcp server page**")}
${t("- 💳 **Built-in billing (per-call)**")}
${t("- 👥 **User account management**")}
${t("- 🛠 **Support Stripe Payment**")}
${t("- 🔐 **Support Email & Google OAuth Sign in**")}

${t("Everything is open-source and licensed under **Apache 2.0** — ready for commercial use.")}`}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
};
