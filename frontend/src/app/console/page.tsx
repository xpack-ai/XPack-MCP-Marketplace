import React from "react";
import type { Metadata } from "next";
import { createBaseMetadata, getDynamicTitle } from "@/shared/utils/metadata";
import DashboardMain from "@/components/dashboard/Main";

export async function generateMetadata(): Promise<Metadata> {
  const platformConfig = await getDynamicTitle("Dashboard");
  return createBaseMetadata(platformConfig);
}

export default function ConsolePage() {
  return <DashboardMain />;
}
