"use client";

import React from "react";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import Link from "next/link";

interface FooterProps {}

export const Footer: React.FC<FooterProps> = ({}) => {
  const { platformConfig } = usePlatformConfig();
  return (
    <>
      {/* Classic Footer */}
      <footer className="bg-slate-700 text-white py-1">
        <div className="mx-auto px-6 max-w-7xl">
          <div className="text-center">
            <span className="text-gray-300 text-xs mr-2">
              © 2025 {platformConfig?.name}
            </span>

            <Link
              className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
              href="https://xpack.ai"
            >
              Powered By XPack.AI
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};
