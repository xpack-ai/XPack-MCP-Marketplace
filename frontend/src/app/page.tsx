import React, { Suspense } from "react";
import { MarketplaceMain } from "@/components/marketplace/Main";
import type { Metadata } from "next";
import { createBaseMetadata, getDynamicTitle } from "@/shared/utils/metadata";
import { Navigation } from "@/shared/components/Navigation";
import { Footer } from "@/shared/components/Footer";
import { fetchServices } from "@/services/marketplaceService";
import type { ServiceData } from "@/shared/types/marketplace";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getDynamicTitle("Marketplace");
  return createBaseMetadata(title);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // get search params
  const params = await searchParams;
  const page = params.page ? parseInt(params.page as string, 10) : 1;
  const search = (params.search as string) || "";
  const pageSize = 36;

  // get services data
  let services: ServiceData[] = [];
  let total = 0;
  let error = null;

  try {
    // use real API interface
    const response = await fetchServices({
      page,
      page_size: pageSize,
      keyword: search,
    });
    services = response?.data?.services || [];
    total = response?.page?.total || 0;
  } catch (err) {
    console.error("Error fetching services:", err);
    error = "Failed to load services";
  }

  return (
    <ThemeSelector
      initialServices={services}
      initialTotal={total}
      initialPage={page}
      initialSearch={search}
      pageSize={pageSize}
      error={error}
    />
  );
}
