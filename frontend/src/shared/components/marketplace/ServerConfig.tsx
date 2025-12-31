"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, Chip, Button, Select, SelectItem } from "@nextui-org/react";
import { FlipButton } from "@/shared/components/FlipButton";
import { useAuth } from "@/shared/lib/useAuth";
import { useTranslation } from "react-i18next";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/shared/utils/clipboard";
import toast from "react-hot-toast";
import { useSharedStore } from "@/shared/store/share";
import { fetchAPI } from "@/shared/rpc/common-function";
import i18n from "@/shared/lib/i18n";

type apiKeyList = {
  name: string;
  apikey: string;
  create_time: string;
  apikey_id: number;
}
interface ServerConfigProps {
  mcpName?: string;
  url?: string;
  className?: string;
  can_invoke?: boolean;
  visitor?: boolean;
}

type McpType = "sse" | "streamable-http";

// 辅助函数：将 API Key 掩码显示，只保留前2位和后4位
const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length <= 6) {
    return apiKey; // 如果太短就直接返回
  }
  const prefix = apiKey.slice(0, 2);
  const suffix = apiKey.slice(-4);
  const maskedLength = apiKey.length - 6;
  const masked = '*'.repeat(maskedLength);
  return `${prefix}${masked}${suffix}`;
};

export const ServerConfig: React.FC<ServerConfigProps> = ({
  mcpName,
  url = process.env.NEXT_PUBLIC_MCP_URL,
  className = "md:min-w-[40%] w-[40%] max-w-100 mt-12",
  can_invoke,
  visitor,
}) => {
  const { t } = useTranslation();
  const { handleLogin } = useAuth();
  const { platformConfig } = usePlatformConfig();
  const [mcpType, setMcpType] = useState<McpType>("sse");
  // API Key List
  const [apiKeys, setApiKeys] = useState<{ key: string, label: string }[]>([]);
  // Selected API Key
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  // User Token
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userToken = useSharedStore?.getState?.().user_token
      setUserToken(userToken);
      if (userToken) {
        const data = await fetchApiKeys()
        if (data.length > 0) {
          setApiKeys(data.map((item) => ({
            key: item.apikey,
            label: item.name,
          })));
          setSelectedApiKey(data[0].apikey)
        }
      }
    }
    fetchData();
  }, []);

  const fetchApiKeys = useCallback(
    async (
    ): Promise<apiKeyList[]> => {
      try {

        const response = await fetchAPI<apiKeyList[]>('/api/apikey/list');
        if (!response.success) {
          toast.error(response.error_message || i18n.t("Failed to load api keys"));
          return []
        }
        return response.data || []
      } catch (error) {
        console.error("Error fetching api keys:", error);
        return []
      }
    },
    []
  );

  const mcpTypeOptions = [
    { key: "sse", label: "SSE (Server-Sent Events)" },
    { key: "streamable-http", label: "Streamable HTTP" },
  ];

  const getCodeContent = () => {
    const serverUrl =
      mcpType === "streamable-http"
        ? `${url}/streamable-http?authkey=${selectedApiKey ? selectedApiKey : `{Your-${platformConfig?.name}-Auth-Key}`}`
        : `${url}?authkey=${selectedApiKey ? selectedApiKey : `{Your-${platformConfig?.name}-Auth-Key}`}`;

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

  const handleCreateNewAuthorization = () => {
    sessionStorage.setItem('create_new_authorization', 'true');
    handleLogin()
  }

  return (
    <div className={`min-w-full ${className} flex-shrink-0`}>
      <div className="mb-2 mt-1">
        {
          visitor || can_invoke ? <>
            {
              !userToken ? <>
                <FlipButton
                  className="w-full rounded-md"
                  text={t("Sign up to get the auth key")}
                  onPress={handleLogin}
                />
              </> : <>
                {
                  apiKeys.length ?
                    <>
                      <Select
                        label={t("Auth Key")}
                        placeholder={t("Auth Key Name")}
                        selectedKeys={selectedApiKey ? [selectedApiKey] : []}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;
                          setSelectedApiKey(selectedKey);
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
                        {apiKeys.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </>
                    :
                    <>
                      <FlipButton
                        className="w-full rounded-md"
                        text={t("Create New Authorization")}
                        onPress={handleCreateNewAuthorization}
                      />
                    </>
                }
              </>
            }
          </> : <>
            <div className="w-full rounded-lg bg-[#F3126033] md:pr-2 h-[40px] md:h-[50px] shadow-lg flex items-center justify-center">
              <p className="text-[#C20E4D] text-center font-bold text-lg leading-none">
                {t("You don't have permission to access this MCP server.")}
              </p>
            </div>
          </>
        }

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
              <span className="text-success">{selectedApiKey ? maskApiKey(selectedApiKey) : `{Your-${platformConfig?.name}-Auth-Key}`}</span>
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
