# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)
- Git

### Development Setup

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd apps/op
   pnpm install
   ```

2. **Environment Configuration**

   Create the environment file:

   ```bash
   cp .env.example .env.local
   ```

   Update variables as needed:

   ```env
   # Backend Service API URL Prefix
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8100
   ```

3. **Start Development Server**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

## Project Structure

### Core Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── marketplace/        # Service marketplace pages
│   ├── console/           # Admin console
│   ├── dashboard/         # User dashboard
│   ├── signin/            # User authentication
│   ├── admin-signin/      # Admin authentication
│   └── loginSuccess/      # Login success page
├── components/            # Feature-specific components
│   ├── console/           # Console management
│   ├── dashboard/         # Dashboard components
│   ├── marketplace/       # Marketplace components
│   ├── mcp-services/      # MCP service management
│   ├── revenue-management/# Revenue tracking
│   ├── system-setting/    # System configuration
│   ├── user-management/   # User administration
│   └── wallet/            # Wallet management
├── shared/               # Shared utilities
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state stores
│   ├── types/           # TypeScript definitions
│   ├── lib/             # Utility libraries
│   ├── rpc/             # RPC services
│   ├── providers/       # React providers
│   ├── contexts/        # React contexts
│   ├── config/          # Configuration files
│   ├── data/            # Static data and mocks
│   └── utils/           # Utility functions
├── services/            # Backend API integration
│   ├── marketplaceService.ts  # Marketplace API
│   ├── mcpService.ts         # MCP service API
│   ├── userService.ts        # User management API
│   ├── revenueService.ts     # Revenue tracking API
│   ├── paymentChannelService.ts # Payment API
│   ├── systemConfigService.ts   # System config API
│   ├── platformConfigService.ts # Platform config API
│   └── overviewService.ts    # Overview/stats API
├── hooks/               # App-specific hooks
│   ├── useAdminLogin.tsx     # Admin authentication
│   ├── useLogin.tsx          # User authentication
│   ├── useMCPServicesList.ts # MCP services data
│   ├── useMCPServiceDetail.ts # Service details
│   ├── useUserManagement.ts  # User management
│   ├── useRevenueManagement.ts # Revenue data
│   ├── usePaymentChannelManagement.ts # Payment channels
│   └── useSystemConfigManagement.ts   # System config
├── store/               # Zustand stores
│   └── admin.ts         # Admin state management
├── types/               # TypeScript type definitions
│   ├── admin.ts         # Admin types
│   ├── dashboard.ts     # Dashboard types
│   ├── mcp-service.ts   # MCP service types
│   ├── payment.ts       # Payment types
│   ├── revenue.ts       # Revenue types
│   ├── system.ts        # System types
│   ├── user.ts          # User types
│   └── global.d.ts      # Global type declarations
├── rpc/                 # RPC layer
│   └── admin-api.ts     # Admin API client
└── utils/               # Utility functions
    └── getEmail.ts      # Email utilities
```

### Key Files

- `src/app/layout.tsx` - Root layout with providers and platform config
- `src/app/page.tsx` - Homepage with marketplace
- `src/shared/components/Navigation.tsx` - Main navigation
- `src/shared/store/` - Global state management with Zustand
- `next.config.ts` - Next.js configuration with NextUI optimization
- `tailwind.config.ts` - Tailwind CSS configuration

## Development Workflow

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended + custom rules
- **Prettier**: Automatic formatting
- **File naming**: kebab-case for files, PascalCase for components

### State Management

Using Zustand for global state:

```typescript
// Example store
import { create } from "zustand";

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### API Integration

Custom fetch wrapper with SWR:

```typescript
// Using SWR for data fetching
import useSWR from "swr";
import { fetchServices } from "@/shared/api/services";

function useServices() {
  const { data, error, isLoading } = useSWR("/api/services", fetchServices);
  return { services: data, error, isLoading };
}
```

### Internationalization

Using react-i18next:

```typescript
// In components
import { useTranslation } from '@/shared/lib/useTranslation'

function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('Welcome')}</h1>
}
```

Translation files are in `public/locales/{lang}/translation.json`

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Utilities
pnpm format           # Format code with Prettier
```

## Adding New Features

### 1. Create a New Page

```bash
# Create page directory
mkdir src/app/my-feature

# Create page component
touch src/app/my-feature/page.tsx
```

```typescript
// src/app/my-feature/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Feature | XPack',
}

export default function MyFeaturePage() {
  return (
    <div>
      <h1>My Feature</h1>
    </div>
  )
}
```

### 2. Add Components

```typescript
// src/components/my-feature/MyComponent.tsx
import React from 'react'
import { useTranslation } from '@/shared/lib/useTranslation'

export function MyComponent() {
  const { t } = useTranslation()

  return (
    <div className="p-4">
      <h2>{t('My Component')}</h2>
    </div>
  )
}
```

### 3. Add Translations

```json
// public/locales/en/translation.json
{
  "My Component": "My Component",
  "My Feature": "My Feature"
}

// public/locales/zh-CN/translation.json
{
  "My Component": "我的组件",
  "My Feature": "我的功能"
}
```

### 4. Add Types

```typescript
// src/shared/types/my-feature.ts
export interface MyFeatureData {
  id: string;
  name: string;
  description: string;
}
```

### 5. Add API Services

```typescript
// src/shared/api/my-feature.ts
import { apiRequest } from "./base";
import type { MyFeatureData } from "@/shared/types/my-feature";

export async function fetchMyFeatureData(): Promise<MyFeatureData[]> {
  return apiRequest("/api/my-feature");
}
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-feature/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('My Component')).toBeInTheDocument()
  })
})
```

## Debugging

### Development Tools

- **React DevTools**: Browser extension for React debugging
- **Next.js DevTools**: Built-in development features
- **TypeScript**: Compile-time error checking
- **ESLint**: Code quality and error detection

### Common Issues

1. **Port conflicts**: Change port in package.json if 3000 is occupied
2. **Environment variables**: Ensure all required env vars are set
3. **TypeScript errors**: Run `pnpm type-check` to identify issues
4. **Build failures**: Check for missing dependencies or syntax errors

## Performance

### Optimization Tips

- Use Next.js Image component for images
- Implement proper loading states
- Use React.memo for expensive components
- Optimize bundle size with dynamic imports
- Enable SSR for dynamic content and SEO optimization

### Monitoring

- Use Next.js built-in analytics
- Monitor Core Web Vitals
- Check bundle analyzer for size optimization

## Deployment

See [Deployment Guide](./deployment.md) for production deployment instructions.
