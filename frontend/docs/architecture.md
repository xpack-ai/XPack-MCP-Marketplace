# Architecture Guide

## Overview

XPack WebUI is built with modern web technologies and follows best practices for scalability, maintainability, and performance. This guide provides an in-depth look at the application's architecture.

## Technology Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **React 18**: UI library with concurrent features
- **TypeScript 5**: Type-safe JavaScript

### UI & Styling
- **NextUI v2**: Modern React UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **React Icons**: Additional icon sets

### State Management
- **Zustand**: Lightweight state management
- **SWR**: Data fetching and caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Internationalization
- **react-i18next**: Internationalization framework
- **i18next**: Core i18n functionality
- **i18next-browser-languagedetector**: Language detection
- **i18next-http-backend**: Translation loading

### Additional Libraries
- **Recharts**: Charts and analytics visualization
- **React Markdown**: Markdown content rendering
- **Crypto-js**: Encryption and security utilities
- **Three.js**: 3D graphics and effects
- **Lottie React**: Animation rendering
- **Anime.js**: Advanced animation library
- **React Hot Toast**: Toast notifications
- **React Hover Video Player**: Video interactions

### Development Tools
- **ESLint**: Code linting with Next.js configuration
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Application Architecture

### Directory Structure

```
apps/op/
├── docs/                    # Documentation
│   ├── architecture.md     # System architecture
│   ├── development.md      # Development guide
│   ├── deployment.md       # Deployment instructions
│   ├── api.md             # API documentation
│   └── troubleshooting.md # Common issues and solutions
├── public/                 # Static assets
│   ├── icons/             # Application icons
│   ├── images/            # Images and graphics
│   └── locales/           # Translation files
├── src/                   # Source code
│   ├── app/              # Next.js App Router pages
│   │   ├── admin-signin/ # Admin login page
│   │   ├── console/      # Admin console
│   │   ├── dashboard/    # User dashboard
│   │   ├── loginSuccess/ # Login success page
│   │   ├── marketplace/  # Service marketplace
│   │   ├── signin/       # User login page
│   │   ├── system-setting/ # System settings
│   │   ├── wallet/       # Wallet management
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Common components
│   │   ├── console/      # Console-specific components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── marketplace/  # Marketplace components
│   │   ├── navigation/   # Navigation components
│   │   ├── signin/       # Authentication components
│   │   ├── system-setting/ # Settings components
│   │   ├── ui/           # Base UI components
│   │   └── wallet/       # Wallet components
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts    # Authentication hook
│   │   ├── useLocalStorage.ts # Local storage hook
│   │   └── useTranslation.ts # Translation hook
│   ├── rpc/              # RPC layer
│   │   ├── client.ts     # RPC client
│   │   ├── types.ts      # RPC types
│   │   └── utils.ts      # RPC utilities
│   ├── services/         # API services
│   │   ├── authService.ts # Authentication service
│   │   ├── marketplaceService.ts # Marketplace API
│   │   ├── userService.ts # User management
│   │   └── walletService.ts # Wallet operations
│   ├── shared/           # Shared utilities
│   │   ├── constants/    # Application constants
│   │   ├── lib/          # Utility libraries
│   │   ├── types/        # Shared TypeScript types
│   │   └── utils/        # Helper functions
│   ├── store/            # State management
│   │   ├── authStore.ts  # Authentication state
│   │   ├── marketplaceStore.ts # Marketplace state
│   │   ├── userStore.ts  # User state
│   │   └── walletStore.ts # Wallet state
│   ├── types/            # TypeScript definitions
│   │   ├── api.ts        # API types
│   │   ├── auth.ts       # Authentication types
│   │   ├── marketplace.ts # Marketplace types
│   │   └── user.ts       # User types
│   └── utils/            # Utility functions
│       ├── api.ts        # API utilities
│       ├── auth.ts       # Authentication utilities
│       ├── crypto.ts     # Cryptographic utilities
│       ├── format.ts     # Formatting utilities
│       └── validation.ts # Validation utilities
├── .env.example          # Environment variables template
├── .eslintrc.json        # ESLint configuration
├── .gitignore           # Git ignore rules
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

### Architectural Patterns

#### 1. Feature-Based Organization

The application follows a feature-based directory structure where related components, services, and utilities are grouped together:

- **Page-Level Features**: Each major feature (marketplace, console, dashboard, wallet) has its own directory under `app/`
- **Component Organization**: Components are organized by feature domain (marketplace, console, dashboard, etc.)
- **Service Layer**: API services are separated by business domain (auth, marketplace, user, wallet)
- **State Management**: Zustand stores are organized by feature area

```
src/
├── app/marketplace/          # Marketplace feature
│   ├── [id]/page.tsx        # Product detail page
│   └── page.tsx             # Marketplace listing
├── components/marketplace/   # Marketplace components
│   ├── ServiceCard.tsx
│   ├── ServiceList.tsx
│   └── SearchFilters.tsx
├── services/                 # API services by domain
│   ├── marketplaceService.ts
│   ├── authService.ts
│   └── walletService.ts
├── store/                    # State management by feature
│   ├── marketplaceStore.ts
│   ├── authStore.ts
│   └── walletStore.ts
└── rpc/                      # RPC layer
    ├── client.ts
    ├── types.ts
    └── utils.ts
```

#### 2. Layered Architecture

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│      (Pages & Components)           │
├─────────────────────────────────────┤
│            Business Layer           │
│         (Hooks & Stores)            │
├─────────────────────────────────────┤
│             Service Layer           │
│        (API Services & RPC)         │
├─────────────────────────────────────┤
│             Data Layer              │
│      (External APIs & Cache)        │
└─────────────────────────────────────┘
```

**Layer Responsibilities:**
- **Presentation Layer**: UI components, pages, layouts, and user interactions
- **Business Layer**: Application logic, state management, and custom hooks
- **Service Layer**: API integration, RPC communication, and data transformation
- **Data Layer**: External API calls, caching strategies, and data persistence

#### 3. Security Architecture

- **Authentication**: JWT-based authentication with secure token storage
- **Authorization**: Role-based access control (RBAC) for admin and user roles
- **Encryption**: Client-side encryption using crypto-js for sensitive data
- **API Security**: Secure API communication with proper error handling
- **Input Validation**: Zod schema validation for all user inputs

#### 4. Performance Optimization

- **Code Splitting**: Automatic code splitting with Next.js and lazy loading
- **Image Optimization**: Next.js Image component for optimized loading
- **Caching Strategy**: SWR for intelligent data caching and revalidation
- **Bundle Optimization**: Tree shaking and module optimization
- **Virtual Scrolling**: For large lists and data sets

#### 5. Component Composition

Components follow a composition pattern for flexibility:

```typescript
// Base component
function Card({ children, className, ...props }) {
  return (
    <div className={cn("rounded-lg border", className)} {...props}>
      {children}
    </div>
  )
}

// Composed components
function ServiceCard({ service }) {
  return (
    <Card className="p-4">
      <Card.Header>
        <h3>{service.name}</h3>
      </Card.Header>
      <Card.Content>
        <p>{service.description}</p>
      </Card.Content>
      <Card.Footer>
        <Button>Install</Button>
      </Card.Footer>
    </Card>
  )
}
```

## Data Flow

### 1. Client-Side Data Flow

```
User Interaction → Component → Hook → Store → Service → API
                                ↓
                            UI Update ← State Change ← Response
```

**Flow Description:**
1. **User Interaction**: User performs an action (click, form submission, etc.)
2. **Component**: React component handles the interaction
3. **Hook**: Custom hook processes the business logic
4. **Store**: Zustand store manages state updates
5. **Service**: API service handles external communication
6. **API**: Backend API processes the request
7. **Response**: Data flows back through the same chain

### 2. Server-Side Data Flow

```
Next.js App Router → Server Components → API Routes → External Services
                                      ↓
                    Client Hydration ← SSR ← Data Fetching
```

**Server-Side Features:**
- **Server Components**: React Server Components for initial data loading
- **API Routes**: Next.js API routes for backend integration
- **SSR**: Server-side rendering for dynamic content and SEO optimization
- **Middleware**: Authentication and request processing

### 3. State Management with Zustand

```typescript
// Example: Marketplace Store
interface MarketplaceState {
  services: Service[]
  loading: boolean
  error: string | null
  fetchServices: () => Promise<void>
  selectService: (id: string) => void
}

const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  services: [],
  loading: false,
  error: null,
  
  fetchServices: async () => {
    set({ loading: true, error: null })
    try {
      const services = await marketplaceService.fetchServices()
      set({ services, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  selectService: (id: string) => {
    const service = get().services.find(s => s.id === id)
    // Handle service selection logic
  }
}))
```

### 4. RPC Communication

The application uses a custom RPC layer for backend communication:

```typescript
// RPC Client Structure
interface RPCClient {
  call<T>(method: string, params?: any): Promise<T>
  subscribe(event: string, callback: Function): void
  unsubscribe(event: string): void
}

// Usage Example
const rpcClient = new RPCClient(config.rpcEndpoint)

// Service method call
const result = await rpcClient.call('marketplace.getServices', {
  category: 'ai-tools',
  limit: 20
})

// Real-time updates
rpcClient.subscribe('service.updated', (data) => {
  // Handle real-time service updates
})
```

### 5. Caching Strategy

**SWR Configuration:**
- **Revalidation**: Automatic revalidation on focus
- **Error Retry**: Exponential backoff for failed requests
- **Deduplication**: Automatic request deduplication
- **Optimistic Updates**: Immediate UI updates with rollback on error

```typescript
// SWR Usage Example
const { data, error, mutate } = useSWR(
  ['services', filters],
  () => marketplaceService.fetchServices(filters),
  {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    dedupingInterval: 5000
  }
)
```

### 6. Authentication Flow

```
Login Request → Auth Service → JWT Token → Local Storage
                                        ↓
Protected Route → Auth Guard → Token Validation → Access Granted/Denied
```

**Authentication Features:**
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token refresh
- **Role-Based Access**: Different access levels for users and admins
- **Session Management**: Secure session handling with automatic logout
```

## API Architecture

### 1. Service Layer Pattern

```typescript
// Base API client
class ApiClient {
  private baseURL: string
  
  constructor(baseURL: string) {
    this.baseURL = baseURL
  }
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }
}

// Service-specific clients
class ServiceAPI extends ApiClient {
  async getServices(): Promise<Service[]> {
    return this.request('/services')
  }
  
  async getService(id: string): Promise<Service> {
    return this.request(`/services/${id}`)
  }
  
  async createService(data: CreateServiceRequest): Promise<Service> {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}
```

### 2. Error Handling Strategy

```typescript
// Centralized error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Error boundary for API errors
export function ApiErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## Component Architecture

### 1. Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Navigation
│   │   ├── UserMenu
│   │   └── LanguageSelector
│   ├── Sidebar (conditional)
│   └── Footer
├── Page Components
│   ├── Marketplace
│   │   ├── HeroSection
│   │   ├── SearchFilters
│   │   └── ServiceList
│   │       └── ServiceCard[]
│   ├── Console
│   │   ├── AdminSidebar
│   │   ├── ServiceManagement
│   │   ├── UserManagement
│   │   └── Analytics
│   └── Dashboard
│       ├── UserProfile
│       ├── InstalledServices
│       └── ActivityFeed
└── Shared Components
    ├── UI Components
    ├── Form Components
    └── Modal Components
```

### 2. Component Design Principles

#### Single Responsibility
Each component has one clear purpose:

```typescript
// Good: Single responsibility
function ServiceCard({ service }) {
  return (
    <Card>
      <ServiceImage src={service.image} />
      <ServiceInfo service={service} />
      <ServiceActions service={service} />
    </Card>
  )
}

// Bad: Multiple responsibilities
function ServiceCardWithModal({ service }) {
  const [showModal, setShowModal] = useState(false)
  // ... modal logic, card logic, form logic all mixed
}
```

#### Composition over Inheritance
Use composition to build complex components:

```typescript
// Composable modal system
function Modal({ children, isOpen, onClose }) {
  return (
    <Portal>
      <Overlay onClick={onClose} />
      <ModalContent>
        {children}
      </ModalContent>
    </Portal>
  )
}

function ServiceModal({ service, isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <h2>{service.name}</h2>
      </Modal.Header>
      <Modal.Body>
        <ServiceDetails service={service} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Close</Button>
        <Button variant="primary">Install</Button>
      </Modal.Footer>
    </Modal>
  )
}
```

#### Props Interface Design
Clear and type-safe props interfaces:

```typescript
interface ServiceCardProps {
  service: Service
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  onInstall?: (service: Service) => void
  onFavorite?: (service: Service) => void
  className?: string
}

function ServiceCard({
  service,
  variant = 'default',
  showActions = true,
  onInstall,
  onFavorite,
  className,
}: ServiceCardProps) {
  // Component implementation
}
```

## State Management Architecture

### 1. State Organization

```typescript
// Global application state
interface AppState {
  user: UserState
  services: ServiceState
  ui: UIState
  auth: AuthState
}

// Feature-specific state
interface ServiceState {
  items: Service[]
  loading: boolean
  error: string | null
  filters: ServiceFilters
  pagination: PaginationState
}
```

### 2. Store Patterns

#### Domain Stores
Each domain has its own store:

```typescript
// User store
export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  updateProfile: async (data) => {
    set({ loading: true })
    try {
      const user = await updateUserProfile(data)
      set({ user, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  }
}))

// Service store
export const useServiceStore = create<ServiceState>((set) => ({
  services: [],
  loading: false,
  fetchServices: async () => {
    // Implementation
  }
}))
```

#### UI State Store
Separate store for UI-specific state:

```typescript
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  language: 'en',
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language })
}))
```

### 3. Data Synchronization

#### SWR Integration
Combine Zustand with SWR for data fetching:

```typescript
function useServices() {
  const { data, error, mutate } = useSWR('/api/services', fetchServices)
  const setServices = useServiceStore((state) => state.setServices)
  
  useEffect(() => {
    if (data) {
      setServices(data)
    }
  }, [data, setServices])
  
  return {
    services: data || [],
    loading: !error && !data,
    error,
    refresh: mutate
  }
}
```

## Performance Architecture

### 1. Code Splitting Strategy

```typescript
// Route-based splitting
const MarketplacePage = lazy(() => import('./marketplace/page'))
const ConsolePage = lazy(() => import('./console/page'))
const DashboardPage = lazy(() => import('./dashboard/page'))

// Component-based splitting
const ServiceModal = lazy(() => import('./components/ServiceModal'))
const AdminPanel = lazy(() => import('./components/AdminPanel'))
```

### 2. Optimization Techniques

#### Memoization
Strategic use of React.memo and useMemo:

```typescript
// Memoized component
const ServiceCard = memo(function ServiceCard({ service }) {
  const formattedPrice = useMemo(() => 
    formatPrice(service.price), [service.price]
  )
  
  return (
    <Card>
      <h3>{service.name}</h3>
      <p>{formattedPrice}</p>
    </Card>
  )
})

// Memoized selector
const useFilteredServices = () => {
  const services = useServiceStore((state) => state.services)
  const filters = useServiceStore((state) => state.filters)
  
  return useMemo(() => 
    filterServices(services, filters), 
    [services, filters]
  )
}
```

#### Virtual Scrolling
For large lists:

```typescript
import { FixedSizeList as List } from 'react-window'

function ServiceList({ services }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ServiceCard service={services[index]} />
    </div>
  )
  
  return (
    <List
      height={600}
      itemCount={services.length}
      itemSize={200}
    >
      {Row}
    </List>
  )
}
```

### 3. Bundle Optimization

#### Tree Shaking
Ensure proper tree shaking:

```typescript
// Good: Named imports
import { Button, Card } from '@nextui-org/react'

// Bad: Default import
import NextUI from '@nextui-org/react'
```

#### Dynamic Imports
Load features on demand:

```typescript
// Dynamic feature loading
async function loadAdminFeatures() {
  const { AdminPanel } = await import('./admin/AdminPanel')
  const { UserManagement } = await import('./admin/UserManagement')
  
  return { AdminPanel, UserManagement }
}
```

## Security Architecture

### 1. Authentication Flow

```typescript
// Auth context
interface AuthContext {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

// Protected route wrapper
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" />
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" />
  }
  
  return children
}
```

### 2. Data Validation

```typescript
// Input validation with Zod
import { z } from 'zod'

const ServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  price: z.number().min(0),
  category: z.enum(['ai', 'productivity', 'development'])
})

// Form validation
function ServiceForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ServiceSchema)
  })
  
  const onSubmit = (data) => {
    // Data is automatically validated
    createService(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### 3. XSS Prevention

```typescript
// Safe HTML rendering
import DOMPurify from 'dompurify'

function SafeHTML({ content }) {
  const sanitizedContent = useMemo(() => 
    DOMPurify.sanitize(content), [content]
  )
  
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  )
}
```

## Testing Architecture

### 1. Testing Strategy

```
Unit Tests (70%)
├── Components
├── Hooks
├── Utilities
└── Stores

Integration Tests (20%)
├── API Integration
├── Component Integration
└── User Flows

E2E Tests (10%)
├── Critical User Journeys
├── Authentication Flows
└── Admin Functions
```

### 2. Test Organization

```typescript
// Component test
describe('ServiceCard', () => {
  const mockService = {
    id: '1',
    name: 'Test Service',
    description: 'Test description',
    price: 9.99
  }
  
  it('renders service information', () => {
    render(<ServiceCard service={mockService} />)
    expect(screen.getByText('Test Service')).toBeInTheDocument()
  })
  
  it('calls onInstall when install button is clicked', () => {
    const onInstall = jest.fn()
    render(<ServiceCard service={mockService} onInstall={onInstall} />)
    
    fireEvent.click(screen.getByText('Install'))
    expect(onInstall).toHaveBeenCalledWith(mockService)
  })
})

// Hook test
describe('useServices', () => {
  it('fetches services on mount', async () => {
    const { result } = renderHook(() => useServices())
    
    await waitFor(() => {
      expect(result.current.services).toHaveLength(3)
    })
  })
})
```

## Deployment Architecture

### 1. Build Process

```typescript
// next.config.js
module.exports = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}
```

### 2. Environment Configuration

```typescript
// Environment-specific configs
const config = {
  development: {
    apiUrl: 'http://localhost:3001',
    debug: true,
  },
  production: {
    apiUrl: 'https://api.xpack.dev',
    debug: false,
  },
  test: {
    apiUrl: 'http://localhost:3001',
    debug: false,
  },
}

export default config[process.env.NODE_ENV || 'development']
```

### 3. Monitoring and Analytics

```typescript
// Error tracking
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})

// Performance monitoring
export function reportWebVitals(metric) {
  if (metric.label === 'web-vital') {
    console.log(metric)
    // Send to analytics service
  }
}
```

This architecture provides a solid foundation for building scalable, maintainable, and performant web applications with modern React and Next.js patterns.