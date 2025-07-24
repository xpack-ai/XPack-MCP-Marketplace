import React from "react";
import type { Metadata } from "next";
import { createBaseMetadata, getDynamicTitle } from "@/shared/utils/metadata";
import { AboutThemeSelector } from "@/components/theme/AboutThemeSelector";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getDynamicTitle("About");
  return createBaseMetadata(title);
}

export default async function AboutPage() {
  return <AboutThemeSelector />;
}
