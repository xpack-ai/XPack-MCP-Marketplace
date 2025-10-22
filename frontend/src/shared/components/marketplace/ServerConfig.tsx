"use client";

import React, { useState } from "react";
import { Card, Chip, Button, Select, SelectItem } from "@nextui-org/react";
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
  className?: string;
}

type McpType = "sse" | "streamable-http";

export const ServerConfig: React.FC<ServerConfigProps> = ({
  mcpName,
  url = process.env.NEXT_PUBLIC_MCP_URL,
  className = "md:min-w-[40%] w-[40%] max-w-100 mt-12",
}) => {
  const { t } = useTranslation();
  const { handleLogin } = useAuth();
  const { platformConfig } = usePlatformConfig();
  const [mcpType, setMcpType] = useState<McpType>("sse");

  const mcpTypeOptions = [
    { key: "sse", label: "SSE (Server-Sent Events)" },
    { key: "streamable-http", label: "Streamable HTTP" },
  ];

  const getCodeContent = () => {
    const serverUrl =
      mcpType === "streamable-http"
        ? `${url}/streamable-http?authkey={Your-${platformConfig?.name}-Auth-Key}`
        : `${url}?authkey={Your-${platformConfig?.name}-Auth-Key}`;

    return `{
  "mcpServers": {
    "${mcpName || "xpack-mcp-market"}": {
      "type": "${mcpType}",
      "autoApprove":"all",
      "url": "${serverUrl}"
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
    <div className={`min-w-full ${className} flex-shrink-0`}>
      <div className="mb-2 mt-1">
        <FlipButton
          className="w-full rounded-md"
          text={t("Sign up to get the auth key")}
          onPress={handleLogin}
        />
      </div>

      {/* MCP Type Selection */}
      <div className="mb-2">
        <Select
          label={t("Transport Type")}
          placeholder={t("Select MCP transport type")}
          selectedKeys={[mcpType]}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as McpType;
            setMcpType(selectedKey);
          }}
          className="w-full"
          size="sm"
          classNames={{
            trigger: " bg-black text-white data-[hover=true]:bg-dark-200",
            label: "!text-default-200",
            value: "!text-white",
            popoverContent: "bg-black text-white",
          }}
        >
          {mcpTypeOptions.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

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
      "type": "${mcpType}",
      "autoApprove":"all",
      "url": "`}
              {mcpType === "streamable-http"
                ? `${url}/streamable-http?authkey=`
                : `${url}?authkey=`}
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
  );
};
