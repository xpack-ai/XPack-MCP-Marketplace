"use client";

import React from "react";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";

interface FooterProps {}

export const Footer: React.FC<FooterProps> = ({}) => {
  const { platformConfig } = usePlatformConfig();
  return (
    <>
      {/* Creative Footer */}
      <footer className="py-4 px-4 sm:px-6 text-center sm:text-end  mx-auto text-xs max-w-7xl mx-auto">
        <span className="mr-1">
          © 2025 {platformConfig?.name}. All rights reserved.
        </span>
        <a className="text-xs text-primary-500 hover:text-primary-600 transition-colors" href="https://xpack.ai">
          Powered By XPack.AI
        </a>
      </footer>
    </>
  );
};
