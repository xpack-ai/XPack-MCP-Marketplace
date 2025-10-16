import { ApiResponse } from "@/shared/types";
import { fetchAdminAPI } from "@/rpc/admin-api";

/**
 * Admin analytics API data structures based on OpenAPI spec
 * GET /api/admin/stats/analytics
 */

export interface DayCountStringItem {
  stats_day: string; // yyyy-mm-dd
  count: string;
}

export interface DayCountNumberItem {
  stats_day: string; // yyyy-mm-dd
  count: number;
}

// 用户注册数据
export interface UserRegisterData {
  total: number; // user register total count
  today?: number; // today user register count
  days: DayCountStringItem[]; // daily user register count
}

// user pay data
export interface UserPayData {
  total: number; // user pay total amount
  today?: number; // today user pay amount

  days: DayCountNumberItem[]; // daily user pay amount
}

// MCP 调用数据
export interface MCPCallData {
  total: number; // mcp call total count
  today?: number; // today mcp call count
  days: DayCountNumberItem[]; // daily mcp call count
}

// Top server items
export interface TopServiceItem {
  id: string; // server id
  name: string; // server name
  short_description: string; // short description
  call_count: number; // call count
}

// admin analytics data
export interface AdminAnalyticsData {
  user_register: UserRegisterData;
  user_pay: UserPayData;
  mcp_call: MCPCallData;
  top_services: TopServiceItem[];
}

// admin analytics response body
export interface AdminAnalyticsResponse
  extends ApiResponse<AdminAnalyticsData> {
  success: boolean;
  code: string;
  error_message: string;
  data: AdminAnalyticsData;
}

/**
 * Get admin analytics data
 * Headers: { Authorization: string }
 */
export async function getAdminAnalytics(): Promise<AdminAnalyticsResponse> {
  return fetchAdminAPI<AdminAnalyticsData>("/api/admin/stats/analytics", {
    method: "GET",
  }) as unknown as AdminAnalyticsResponse;
}
