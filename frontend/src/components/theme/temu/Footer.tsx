"use client";

import React from "react";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { ShoppingBag, Star, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FooterProps {}

export const Footer: React.FC<FooterProps> = ({}) => {
  const { platformConfig } = usePlatformConfig();
  const { t } = useTranslation();
  return (
    <>
      {/* Temu Style Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto px-6 pt-12 pb-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {platformConfig?.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {t(
                  "A marketplace for AI tools and servers. Discover and integrate powerful AI solutions for your projects."
                )}
              </p>
              <div className="flex items-center gap-2 text-orange-500">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {t("AI Tools Marketplace")}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <span>
                  © 2025 {platformConfig?.name}. All rights reserved.
                </span>
              </div>

              {/* Powered By */}
              <div className="flex items-center gap-4">
                <a
                  href="https://xpack.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors text-sm font-medium"
                >
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 hover:border-orange-200 transition-all duration-200">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span>Powered By XPack.AI</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
