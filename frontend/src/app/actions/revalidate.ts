"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

export async function revalidatePlatformConfig() {
  // Get current host for host-specific cache invalidation
  const headersList = await headers();
  const host = headersList.get("host") || "default";

  // Revalidate root path and all sub-paths
  revalidatePath("/", "layout");

  // Revalidate host-specific cache tag
  revalidateTag(`platform-config-${host}`, 'max');

  console.info(
    `Platform config cache revalidated for host: platform-config-${host}`
  );
}
