import React from "react";
import type { Metadata } from "next";
import { createBaseMetadata, getDynamicTitle } from "@/shared/utils/metadata";
import DashboardMain from "@/components/dashboard/Main";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getDynamicTitle("Dashboard");
  return createBaseMetadata(title);
}

export default function HomePage() {
  return (
    <DashboardMain />
  );
}
