"use client";

import React, { useEffect, useState } from "react";
import { ServiceData } from "@/shared/types/marketplace";
import { Card, Chip } from "@nextui-org/react";
import { FlipButton } from "@/shared/components/FlipButton";
import { useAuth } from "@/shared/lib/useAuth";
import { useTranslation } from "react-i18next";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";

interface ServerConfigProps {
  product: ServiceData;
}

export const ServerConfig: React.FC<ServerConfigProps> = ({ product }) => {
  const { t } = useTranslation();
  const { handleLogin } = useAuth();
  const { platformConfig } = usePlatformConfig();
  const [url, setUrl] = useState<string>(process.env.NEXT_PUBLIC_MCP_URL || "");
  useEffect(() => {
    if (url || !product.slug_name) return;
    setUrl(`${window.location.origin}/mcp/${product.slug_name}`);
  }, [product.slug_name]);

  return (
    <div className="min-w-[400px] w-[40%] max-w-100 flex-shrink-0 mt-12">
      <div className="mb-4 mt-1">
        <FlipButton
          className="w-full rounded-md"
          text={t("Try for free")}
          onPress={handleLogin}
        />
      </div>

      {/* Code Snippet */}
      <Card className="w-full max-w-2xl bg-black text-white p-2 sm:p-4 rounded-lg relative z-10">
        <div className="text-left font-mono">
          <Chip className="mb-2 text-white" size="sm" variant="flat">
            {platformConfig?.name} MCP
          </Chip>
          <pre className="p-2 sm:p-4 rounded-md text-xs overflow-x-auto">
            <code className="text-gray-300 whitespace-pre-wrap">
              {`{
  "mcpServers": {
    "xpack-mcp-market": {
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
    </div>
  );
};
