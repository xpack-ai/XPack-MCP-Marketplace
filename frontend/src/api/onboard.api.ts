import { fetchAdminAPI } from "@/rpc/admin-api";
import { ApiResponse } from "@/shared/types";
import toast from "react-hot-toast";

export enum OnboardingTaskKey {
  PLATFORM_SETUP = "configure-platform-settings",
  MCP_SERVICES = "add-mcp-services",
  REVENUE_MANAGEMENT = "configure-platment-billings",
  SHARE_PLATFORM = "share-your-platform",
}
export enum TaskStatusEnum {
  COMPLETED = 1,
  NOT_STARTED = 0,
}
export type TaskItem = {
  task_id: OnboardingTaskKey;
  task_status: TaskStatusEnum;
};
export async function updateAdminOnboardingTasks(
  task: TaskItem
): Promise<boolean> {
  const res = (await fetchAdminAPI<void>("/api/onboarding/task_update_status", {
    method: "PUT",
    body: task as unknown as BodyInit,
  })) as unknown as ApiResponse<void>;
  // if (!res.success) {
  //   toast.error(res.error_message || "Failed to update onboarding task status");
  // }
  return res.success;
}
