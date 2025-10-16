# API Integration Guide

## Overview

XPack WebUI integrates with the XPack platform APIs to provide marketplace, user management, and admin functionality. The application uses a custom RPC layer alongside traditional REST APIs for optimal performance and real-time capabilities.

## API Configuration

### Environment Variables

```env
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Base API Client

The application uses a custom fetch wrapper and RPC client:

```typescript
// REST API Client - src/utils/api.ts
import { apiRequest } from "@/utils/api";

// GET request
const data = await apiRequest("/api/web/mcp_services");

// POST request
const result = await apiRequest("/api/web/mcp_service_info", {
  method: "POST",
  body: JSON.stringify(payload),
});

// RPC Client - src/rpc/client.ts
import { rpcClient } from "@/rpc/client";

// RPC method call
const result = await rpcClient.call("marketplace.getServices", {
  category: "ai-tools",
  limit: 20,
});
```

## API Services

### Marketplace Service

Located in `src/services/marketplaceService.ts`:

```typescript
// Fetch all MCP servers
export async function fetchServices(): Promise<ServiceData[]>;

// Fetch service by ID
export async function fetchServiceById(id: string): Promise<ServiceData | null>;

// Search services with filters
export async function searchServices(
  filters: ServiceFilters
): Promise<ServiceData[]>;
```

### Authentication Service

Located in `src/services/authService.ts`:

```typescript
// User login
export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthResponse>;

// Admin login
export async function adminLogin(
  credentials: AdminCredentials
): Promise<AdminAuthResponse>;

// Token validation
export async function validateToken(token: string): Promise<boolean>;

// Logout
export async function logout(): Promise<void>;
```

### User Service

Located in `src/services/userService.ts`:

```typescript
// Get user profile
export async function getUserProfile(): Promise<UserProfile>;

// Update user profile
export async function updateUserProfile(
  data: UserProfileUpdate
): Promise<UserProfile>;

// Get user dashboard data
export async function getUserDashboard(): Promise<DashboardData>;
```

### Wallet Service

Located in `src/services/walletService.ts`:

```typescript
// Get wallet balance
export async function getWalletBalance(): Promise<WalletBalance>;

// Get transaction history
export async function getTransactions(
  filters?: TransactionFilters
): Promise<Transaction[]>;

// Create payment
export async function createPayment(
  data: PaymentData
): Promise<PaymentResponse>;
```

## Data Types

### Service Data

```typescript
interface ServiceData {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  rating: number;
  downloads: number;
  verified: boolean;
  updatedAt: string;
  tags: string[];
  documentation?: string;
  pricing?: PricingInfo;
}
```

### User Types

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
  createdAt: string;
  lastLoginAt?: string;
}

interface UserProfile extends User {
  preferences: UserPreferences;
  subscription?: SubscriptionInfo;
}
```

### Authentication

```typescript
interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}
```

## State Management

### API State with SWR

The application uses SWR for data fetching and caching:

```typescript
import useSWR from "swr";
import { fetchServices } from "@/services/marketplaceService";

function useServices() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/web/mcp_services",
    fetchServices,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      dedupingInterval: 5000,
    }
  );

  return {
    services: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
```

### Zustand Store Structure

The application uses multiple Zustand stores for different domains:

```typescript
// src/store/authStore.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const response = await loginUser(credentials);
    set({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
```

## Error Handling

### API Error Types

```typescript
interface APIError {
  message: string;
  code: string;
  status: number;
  details?: any;
}
```

### Error Handling Pattern

```typescript
import { toast } from "react-hot-toast";

async function handleAPICall<T>(apiCall: () => Promise<T>): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof APIError) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
}
```

## Authentication Flow

### User Authentication

1. User submits login form
2. Call `loginUser` API
3. Store token and user data in auth store
4. Redirect to dashboard or intended page

```typescript
// src/hooks/useLogin.ts
export function useLogin() {
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      router.push("/dashboard");
    } catch (error) {
      toast.error("Login failed");
    }
  };

  return { handleLogin };
}
```

### Admin Authentication

Similar flow but with admin-specific endpoints and redirects to console.

## Data Fetching Patterns

### Server-Side Rendering (SSR)

For marketplace product pages with dynamic content:

```typescript
// src/app/marketplace/[id]/page.tsx
export default async function ProductPage({ params }: { params: { id: string } }) {
  // Server-side data fetching
  const service = await fetchServiceById(params.id)

  if (!service) {
    notFound()
  }

  return <ProductDetail service={service} />
}
```

### Client-side Data

For dynamic content and real-time updates:

```typescript
function ServicesPage() {
  const { services, isLoading, error } = useServices()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {services?.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  )
}
```

## API Endpoints

### Public Endpoints

- `GET /api/web/mcp_services` - List all MCP servers
- `POST /api/web/mcp_service_info` - Get service details by ID
- `GET /api/web/categories` - List service categories
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/web/featured` - Get featured services

### Protected Endpoints

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/dashboard` - Get user dashboard data
- `GET /api/user/services` - Get user's services
- `POST /api/user/services` - Create new service
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/payment` - Create payment

### Admin Endpoints

- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/services` - Get all services for management
- `PUT /api/admin/services/:id` - Update service status
- `DELETE /api/admin/services/:id` - Delete service

### RPC Methods

The application also supports RPC calls for real-time operations:

- `marketplace.getServices(filters)` - Get services with real-time updates
- `marketplace.subscribeToUpdates()` - Subscribe to service updates
- `user.getDashboard()` - Get real-time dashboard data
- `wallet.getBalance()` - Get real-time wallet balance
- `admin.getAnalytics()` - Get real-time analytics data

## Rate Limiting

The API implements rate limiting. Handle rate limit errors:

```typescript
if (error.status === 429) {
  toast.error("Too many requests. Please try again later.");
  // Implement exponential backoff
}
```

## Caching Strategy

### SWR Configuration

```typescript
// Global SWR config
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};
```

### Cache Keys

Use consistent cache keys:

```typescript
// Good
const CACHE_KEYS = {
  SERVICES: "/api/services",
  SERVICE_DETAIL: (id: string) => `/api/services/${id}`,
  USER_PROFILE: "/api/user/profile",
} as const;
```

## Testing API Integration

### Mock API Responses

```typescript
// __tests__/mocks/api.ts
export const mockServices: ServiceData[] = [
  {
    id: "1",
    name: "Test Service",
    description: "A test service",
    category: "utility",
    author: "Test Author",
    version: "1.0.0",
    rating: 4.5,
    downloads: 1000,
    verified: true,
    updatedAt: "2024-01-01",
    tags: ["test"],
  },
];
```

### API Testing

```typescript
// __tests__/api/services.test.ts
import { fetchServices } from "@/shared/api/services";

// Mock fetch
global.fetch = jest.fn();

describe("Services API", () => {
  it("fetches services successfully", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServices,
    });

    const services = await fetchServices();
    expect(services).toEqual(mockServices);
  });
});
```
