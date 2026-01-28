"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Listbox,
  ListboxItem,
  Skeleton,
  DateRangePicker
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { useTranslation } from "@/shared/lib/useTranslation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getAdminAnalytics,
  AdminAnalyticsData,
  TopServiceItem,
} from "@/api/adminAnalytics.api";
import toast from "react-hot-toast";

// Chart data interface to match existing chart component
interface ChartDataItem {
  date: string;
  users: number;
  revenue: number;
  calls: number;
}

// Transform API data to chart format
const transformToChartData = (
  analytics: AdminAnalyticsData
): ChartDataItem[] => {
  // Get the maximum length of days arrays to handle potential mismatches
  const maxLength = Math.max(
    analytics.user_register.days.length,
    analytics.user_pay.days.length,
    analytics.mcp_call.days.length
  );

  const chartData: ChartDataItem[] = [];

  for (let i = 0; i < maxLength; i++) {
    // Format date for display (converting from YYYY-MM-DD to MMM DD)
    const userRegDay = analytics.user_register.days[i];
    const payDay = analytics.user_pay.days[i];
    const callDay = analytics.mcp_call.days[i];

    // Use the first available date, format it nicely
    const rawDate =
      userRegDay?.stats_day || payDay?.stats_day || callDay?.stats_day;
    const formattedDate = rawDate
      ? new Date(rawDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      : `Day ${i + 1}`;

    chartData.push({
      date: formattedDate,
      users: userRegDay ? parseInt(userRegDay.count as string) || 0 : 0,
      revenue: payDay ? payDay.count : 0,
      calls: callDay ? callDay.count : 0,
    });
  }

  return chartData;
};

// Render label + total value in tab header
const TabTitle: React.FC<{
  label: string;
  total: number | string;
}> = ({ label, total }) => (
  <div className="flex flex-col items-start gap-2">
    <div className="text-sm text-default-500">{label}</div>
    <div className="text-2xl font-semibold text-default-900">
      {typeof total === "number" ? total.toLocaleString() : total}
    </div>
  </div>
);

const ConsoleStats: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("users");

  // State for API data
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // 日期范围状态 - 默认最近30天
  const [dateRange, setDateRange] = useState<any>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);

    // 格式化为 YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      start: parseDate(formatDate(thirtyDaysAgo)),
      end: parseDate(formatDate(today)),
    };
  });

  // 计算最早可选日期（30天前）
  const minValue = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return parseDate(`${year}-${month}-${day}`);
  }, []);

  // 计算最大可选日期（今天）
  const maxValue = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return parseDate(`${year}-${month}-${day}`);
  }, []);

  // 校验：开始日期必须早于结束日期，且不能早于30天前
  const dateValidation = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) {
      return { isInvalid: false, error: "" };
    }
    
    const start = dateRange.start;
    const end = dateRange.end;
    const minDate = minValue;
    
    // 检查开始日期是否早于30天前
    const isStartTooEarly = 
      start.year < minDate.year ||
      (start.year === minDate.year && start.month < minDate.month) ||
      (start.year === minDate.year && start.month === minDate.month && start.day < minDate.day);
    
    if (isStartTooEarly) {
      return { 
        isInvalid: true, 
        error: t("Start date cannot be earlier than 30 days ago") 
      };
    }
    
    // 检查开始日期是否晚于结束日期
    const isEndBeforeStart = 
      start.year > end.year ||
      (start.year === end.year && start.month > end.month) ||
      (start.year === end.year && start.month === end.month && start.day >= end.day);
    
    if (isEndBeforeStart) {
      return { 
        isInvalid: true, 
        error: t("Start date must be before end date") 
      };
    }
    
    return { isInvalid: false, error: "" };
  }, [dateRange, minValue, t]);

  // 错误消息
  const errorMessage = dateValidation.error;
  const isInvalidDateRange = dateValidation.isInvalid;

  // Fetch analytics data on component mount and when date range changes
  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange?.start || !dateRange?.end) return;
      
      // 如果日期范围无效，不发送请求
      if (isInvalidDateRange) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // parseDate 返回的对象有 year, month, day 属性
        const start = dateRange.start;
        const end = dateRange.end;

        // 转换日期为时间戳（秒）
        const startDateTime = new Date(start.year, start.month - 1, start.day, 0, 0, 0);
        const startTime = Math.floor(startDateTime.getTime() / 1000);

        const endDateTime = new Date(end.year, end.month - 1, end.day, 23, 59, 59);
        const endTime = Math.floor(endDateTime.getTime() / 1000);

        const response = await getAdminAnalytics(startTime, endTime);

        if (response.success) {
          setAnalyticsData(response.data);
        } else {
          toast.error(
            response.error_message || "Failed to load analytics data"
          );
        }
      } catch {
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, isInvalidDateRange]);

  // Transform API data to chart format
  const chartData = useMemo<ChartDataItem[]>(() => {
    if (!analyticsData) return [];
    return transformToChartData(analyticsData);
  }, [analyticsData]);

  // Format revenue as currency (USD by default)
  const formatCurrency = (value: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
      value
    );
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-4 h-full">
        <Skeleton className="rounded-lg" isLoaded={!loading}>
          <div className="h-24 rounded-lg bg-secondary" />
        </Skeleton>
        <div className="flex flex-col gap-3">
          <Skeleton className="w-3/5 rounded-lg" isLoaded={!loading}>
            <div className="h-3 w-full rounded-lg bg-secondary" />
          </Skeleton>
          <Skeleton className="w-4/5 rounded-lg" isLoaded={!loading}>
            <div className="h-3 w-full rounded-lg bg-secondary-300" />
          </Skeleton>
          <Skeleton className="w-2/5 rounded-lg" isLoaded={!loading}>
            <div className="h-3 w-full rounded-lg bg-secondary-200" />
          </Skeleton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 日期范围选择器 */}
       <div className="flex justify-end">
         <DateRangePicker
           label={t("Select Date Range")}
           value={dateRange}
           onChange={setDateRange}
           minValue={minValue}
           maxValue={maxValue}
           isInvalid={isInvalidDateRange}
           errorMessage={errorMessage}
           onKeyDown={(e) => e.preventDefault()}
           onKeyUp={(e) => e.preventDefault()}
           className="w-[250px]"
           visibleMonths={2}
           granularity="day"
         />
       </div>

      {/* Charts with Tabs */}
      <Card shadow="none" className="border-1">
        <CardHeader className="p-0 flex items-center justify-between">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            color="primary"
            classNames={{
              base: "w-full",
              tab: "h-fit justify-start border-b-1 p-4",
              cursor: "w-[90%]",
              tabList: "w-full gap-0 p-0",
            }}
          >
            <Tab
              key="users"
              title={
                <TabTitle
                  label={t("Daily Registered Users")}
                  total={analyticsData?.user_register.today || 0}
                />
              }
            />
            <Tab
              key="revenue"
              title={
                <TabTitle
                  label={t("Daily Revenue")}
                  total={formatCurrency(analyticsData?.user_pay.today || 0)}
                />
              }
            />
            <Tab
              key="calls"
              title={
                <TabTitle
                  label={t("Daily API Calls")}
                  total={analyticsData?.mcp_call.today || 0}
                />
              }
            />
          </Tabs>
        </CardHeader>
        <CardBody>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                />
                {activeTab === "users" && (
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                )}
                {activeTab === "revenue" && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                )}
                {activeTab === "calls" && (
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Top Servers List */}
      <Card shadow="none" className="border-1">
        <CardHeader className="pb-0 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            {t("Top Servers by Calls")}
          </h4>
        </CardHeader>
        <CardBody>
          <div>
            {analyticsData?.top_services?.length ? (
              <Listbox
                aria-label="top servers"
                selectionMode="none"
                className="overflow-visible p-0"
                classNames={{ list: "overflow-visible space-y-3" }}
              >
                {(analyticsData.top_services || []).map(
                  (service: TopServiceItem, index: number) => (
                    <ListboxItem
                      key={service.id}
                      className="p-3 bg-gray-50 data-[hover=true]:bg-gray-100 cursor-default"
                      classNames={{
                        title: "w-full",
                      }}
                    >
                      <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center justify-center min-w-8 w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex flex-col items-start flex-1 overflow-hidden">
                          <div className="flex gap-1 w-full">
                            <span className="text-danger-500">
                              {service.is_deleted ? t("(Deleted)") : ""}
                            </span>
                            <span className="truncate w-full flex-1">
                              {service.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 truncate w-full">
                            {service.short_description}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {service.call_count.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t("Calls")}
                          </div>
                        </div>
                      </div>
                    </ListboxItem>
                  )
                )}
              </Listbox>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("No servers available")}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ConsoleStats;
