import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  
  experimental: {
    optimizePackageImports: ["@nextui-org/react"],
  },
  
  transpilePackages: ["@nextui-org/react", "@nextui-org/theme"],
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: false,
  },

  // Redirect configuration
  async redirects() {
    return [];
  },
  
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001"
        }/uploads/:path*`,
      },
    ];
  },

  // Headers for better performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
