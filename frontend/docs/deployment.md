# Deployment Guide

## Overview

This guide covers deploying XPack WebUI to various environments including development, staging, and production. The application is built with Next.js 15 and supports multiple deployment strategies.

## Build Process

### Production Build

```bash
# Install dependencies
pnpm install

# Build the application
pnpm build

# Start production server
pnpm start
```

The build creates optimized static files in `.next/` directory.

### Build Configuration

The application is configured in `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
};

export default nextConfig;
```

## Environment Variables

### Required Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Environment-Specific Files

- `.env.example` - Template for environment variables
- `.env.local` - Local development overrides (not committed)
- `.env.development` - Development environment
- `.env.test` - Testing environment
- `.env.production` - Production environment
