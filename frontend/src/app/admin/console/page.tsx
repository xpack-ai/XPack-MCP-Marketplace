import React from "react";
import type { Metadata } from "next";
import { createBaseMetadata, getDynamicTitle } from "@/shared/utils/metadata";
import ConsoleMain from "@/components/console/Main";

export async function generateMetadata(): Promise<Metadata> {
  const platformConfig = await getDynamicTitle("Console");
  return createBaseMetadata(platformConfig);
}

export default function AdminConsolePage() {
  return <ConsoleMain />;
}
