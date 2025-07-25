/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Enable SSR
  output: "standalone",

  // Optimize images
  images: {
    domains: [],
    unoptimized: false, // Enable image optimization for SSR
  },

  // Webpack configuration
  webpack: (config) => {
    return config;
  },

  // Redirect configuration
  async redirects() {
    return [];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001"}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001"}/uploads/:path*`,
      },
      {
        source: "/mcp/:path*",
        destination: `${process.env.NEXT_PUBLIC_MCP_URL || "http://127.0.0.1:8002"}/mcp/:path*`,
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
            key: "X-Frame-Options",
            value: "DENY",
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

module.exports = nextConfig;
