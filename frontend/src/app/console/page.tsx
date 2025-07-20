import React from "react";
import type { Metadata } from "next";
import { createBaseMetadata, getDynamicTitle } from "@/shared/utils/metadata";
import ConsoleMain from "@/components/console/Main";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getDynamicTitle("Console");
  return createBaseMetadata(title);
}

export default function HomePage() {
  return (
    <ConsoleMain />
  );
}
