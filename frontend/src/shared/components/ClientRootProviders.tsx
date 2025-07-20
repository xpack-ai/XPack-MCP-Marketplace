"use client";

import React from "react";
import { Providers } from "@/shared/providers/nextui-provider";
import { ClientI18nProvider } from "@/shared/components/ClientI18nProvider";
import { PlatformConfigProvider } from "@/shared/contexts/PlatformConfigContext";
import { Toaster } from "react-hot-toast";
import { PlatformConfigResponse } from "@/shared/types/system";

export default function ClientRootProviders({
  children,
  initConfig
}: {
  children: React.ReactNode;
  initConfig: PlatformConfigResponse;
}) {

  return (
    <ClientI18nProvider>
      <PlatformConfigProvider initConfig={initConfig}>
        <Toaster position="top-center" />
        <Providers>{children}</Providers>
      </PlatformConfigProvider>
    </ClientI18nProvider>
  );
}
