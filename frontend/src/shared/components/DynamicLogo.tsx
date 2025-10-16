"use client";

import React from "react";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { getURL } from "@/shared/rpc/adapter";

interface DynamicLogoProps {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  hideText?: boolean;
}

export const DynamicLogo: React.FC<DynamicLogoProps> = ({
  className = "",
  alt,
  width,
  height,
  fallbackSrc = "/static/logo/logo.png",
  hideText = false,
}) => {
  const { platformConfig } = usePlatformConfig();

  const logoSrc = getURL(platformConfig.logo || fallbackSrc);
  const logoAlt = alt || `Platform Logo`;
  if (!logoSrc) return <></>;

  return (
    <div className="flex items-center gap-1">
      <img
        src={logoSrc}
        alt={logoAlt}
        className={`${!platformConfig.official ? "rounded-lg" : ""} ${className}`}
        width={width}
        height={height}
        onError={(e) => {
          // if custom logo loading fails, fallback to default logo
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
          }
        }}
      />
      {!hideText && platformConfig.name && !platformConfig.official && (
        <div className="text-lg font-bold">{platformConfig.name}</div>
      )}
    </div>
  );
};
