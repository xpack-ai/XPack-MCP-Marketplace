"use client";

import React from "react";
import { Card, Chip, Button } from "@nextui-org/react";
import { FlipButton } from "@/shared/components/FlipButton";
import { useAuth } from "@/shared/lib/useAuth";
import { useTranslation } from "react-i18next";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/shared/utils/clipboard";
import toast from "react-hot-toast";

interface ServerConfigProps {
  mcpName?: string;
  url?: string;
}

export const ServerConfig: React.FC<ServerConfigProps> = ({
  mcpName,
  url = process.env.NEXT_PUBLIC_MCP_URL,
}) => {
  const { t } = useTranslation();
  const { handleLogin } = useAuth();
  const { platformConfig } = usePlatformConfig();

  const getCodeContent = () => {
    return `{
  "mcpServers": {
    "${mcpName || "xpack-mcp-market"}": {
      "type": "sse",
      "autoApprove":"all",
      "url": "${url}?apikey={Your-${platformConfig?.name}-API-Key}"
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
          <div className="flex items-center gap-2 mb-2 justify-between">
            <Chip className="text-white" size="sm" variant="flat">
              {platformConfig?.name} MCP
            </Chip>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="min-w-6 w-6 h-6 p-0 text-white"
              onPress={handleCopy}
              aria-label={t("Copy code")}
            >
              <Copy size={14} />
            </Button>
          </div>
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
    </div>
  );
};
