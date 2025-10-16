"use client";

import { initEarthPixelAnimation } from "@/shared/lib/animations/EarthPixelAnimation";
import React, { useEffect, useRef } from "react";

interface BgCollagePatternProps {
  /** @deprecated Unused – kept for backward compatibility */
  hueRange?: [number, number];
  /** @deprecated Unused – kept for backward compatibility */
  gap?: number;
  /** @deprecated Unused – kept for backward compatibility */
  speed?: [number, number];
  /** @deprecated Unused – kept for backward compatibility */
  colorsLen?: number;
  options?: Parameters<typeof initEarthPixelAnimation>[2];
  children?: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function BgCollagePattern({
  options,
  containerRef,
}: BgCollagePatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const dispose = initEarthPixelAnimation(
      canvasRef.current,
      containerRef.current,
      options
    );

    return () => {
      if (dispose) dispose();
    };
  }, [options]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
