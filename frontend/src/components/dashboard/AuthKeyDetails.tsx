import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Spinner,
} from "@nextui-org/react";
import { Edit2, Trash2, Copy, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import toast from "react-hot-toast";
import { fetchAPI } from "@/shared/rpc/common-function";
import { APIKey } from "@/shared/types/api";
import { copyToClipboard } from "@/shared/utils/clipboard";

interface AuthKeyDetailsProps {
  selectedApiKey: APIKey | null;
  onEditKey: (key: APIKey) => void;
  onDeleteKey: (key: APIKey) => void;
}

interface ApiAnalyticsData {
  stats_day: string;
  call_tool_count: number;
}

// Custom cursor to highlight the hovered bar with a lighter and narrower overlay
const CustomCursor: React.FC<{
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}> = ({ x = 0, y = 0, height = 0, width = 0 }) => {
  const barVisualWidth = 20;
  // Use the bar's visual width directly so the highlight precisely matches the bar
  const overlayWidth = barVisualWidth;

  // Center the overlay within the default cursor width
  const offsetX = x + (width - overlayWidth) / 2;

  return (
    <rect
      x={offsetX}
      y={y}
      width={overlayWidth}
      height={height}
      fill="rgba(0, 0, 0, 0.1)" // lighter mask color
    />
  );
};

const AuthKeyDetails: React.FC<AuthKeyDetailsProps> = ({
  selectedApiKey,
  onEditKey,
  onDeleteKey,
}) => {
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState<
    { name: string; value: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAnalyticsData = useCallback(async () => {
    if (!selectedApiKey) return;

    try {
      setIsLoading(true);
      const response = await fetchAPI(
        `/api/stats/key_call_tool_count?apikey_id=${selectedApiKey.apikey_id}`,
        {
          method: "GET",
        }
      );

      if (response.success && response.data?.days) {
        const formattedData = response.data.days.map(
          (day: ApiAnalyticsData) => ({
            name: new Date(day.stats_day).toISOString().split("T")[0],
            value: day.call_tool_count,
          })
        );
        setAnalyticsData(formattedData);
      } else {
        console.error("Analytics data fetch error:", response.error_message);
      }
    } catch (error) {
      console.error("Analytics data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedApiKey, t]);

  useEffect(() => {
    if (!selectedApiKey?.apikey_id) return
    fetchAnalyticsData();
  }, [selectedApiKey?.apikey_id]);

  const handleCopy = async (text: string) => {
    const result = await copyToClipboard(text);
    if (result.success) {
      toast.success(t("Copied to clipboard"));
    } else {
      toast.error(t("Copy failed, please copy manually"));
    }
  };

  const getEncryptedKey = (key: string) => {
    return key.slice(0, 2) + "*".repeat(key.length - 7) + key.slice(-5);
  };

  if (!selectedApiKey) {
    return <></>;
  }

  return (
    <div className="flex-1 overflow-hidden">
      {/* Selected Key Details */}
      <Card shadow="none" className="h-full">
        <CardHeader className="px-6 py-4">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedApiKey.name}
            </h2>
            <div className="flex gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="bordered"
                onPress={() => onEditKey(selectedApiKey)}
              >
                <Edit2 size={18} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="bordered"
                color="danger"
                onPress={() => onDeleteKey(selectedApiKey)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6">
          {/* MCP Config Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center w-full mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("Auth Key")}
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded relative justify-between">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">{getEncryptedKey(selectedApiKey.apikey)}</span>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => handleCopy(selectedApiKey.apikey)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Analytics Section */}
          <Card
            shadow="none"
            className="overflow-visible justify-between h-full"
          >
            <CardHeader className="px-0 py-4">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("Analytics")}
                </h2>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => fetchAnalyticsData()}
                >
                  <RefreshCw size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="px-0" style={{ height: "280px" }}>
              {analyticsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      cursor={<CustomCursor />}
                      formatter={(value: number) => [value, t("Times")]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                        lineHeight: "1.5",
                        padding: "5px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  {isLoading ? (
                    <Spinner size="lg" color="default" />
                  ) : (
                    <p className="text-gray-500">
                      {t("No analytics data available")}
                    </p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </CardBody>
      </Card>
    </div>
  );
};

export default AuthKeyDetails;
