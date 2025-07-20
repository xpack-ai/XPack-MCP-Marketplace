# Troubleshooting Guide

## Common Issues

### Development Environment

#### 1. Installation Issues

**Problem**: `pnpm install` fails with dependency conflicts

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and pnpm-lock.yaml
rm -rf node_modules pnpm-lock.yaml

# Reinstall dependencies
pnpm install
```

**Problem**: TypeScript compilation errors

**Solution**:
```bash
# Check TypeScript configuration
pnpm type-check

# Clear Next.js cache
rm -rf .next

# Restart development server
pnpm dev
```

#### 2. Environment Variables

**Problem**: Environment variables not loading

**Solution**:
1. Ensure `.env.local` file exists in project root
2. Check variable names start with `NEXT_PUBLIC_` for client-side access
3. Restart development server after changes

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Problem**: API endpoints returning 404

**Solution**:
1. Verify backend server is running on correct port
2. Check API URL configuration in environment variables
3. Ensure CORS is properly configured on backend

#### 3. Build Issues

**Problem**: Build fails with memory errors

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Run build
pnpm build
```

**Problem**: Static export fails

**Solution**:
```typescript
// next.config.ts - Ensure proper configuration for static export
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

### Runtime Issues

#### 1. Authentication Problems

**Problem**: Login fails with valid credentials

**Solution**:
1. Check network tab for API response errors
2. Verify JWT token storage in localStorage
3. Check token expiration and refresh logic

```typescript
// Debug authentication state
console.log('Auth state:', useAuthStore.getState())
console.log('Token:', localStorage.getItem('auth-token'))
```

**Problem**: Protected routes not working

**Solution**:
1. Verify auth middleware is properly configured
2. Check route protection logic in components
3. Ensure token validation on server side

#### 2. API Integration Issues

**Problem**: API calls failing with CORS errors

**Solution**:
1. Configure CORS headers on backend
2. Check API URL configuration
3. Verify request headers and methods

```typescript
// Debug API calls using project's actual API functions
import { fetchAPI } from '@/shared/rpc/common-function'
import { fetchAdminAPI } from '@/rpc/admin-api'

// Debug public API call
const response = await fetchAPI('/api/web/mcp_services', {
  method: 'GET'
})
console.log('Public API Response:', response)

// Debug admin API call
const adminResponse = await fetchAdminAPI('/api/mcp/service/list', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
console.log('Admin API Response:', adminResponse)
```

**Problem**: RPC connection fails

**Solution**:
1. Check WebSocket endpoint configuration
2. Verify network connectivity
3. Check browser WebSocket support

```typescript
// Debug RPC connection using project's actual RPC structure
import { getApiUrl } from '@/shared/rpc/adapter'

// Check RPC endpoint configuration
console.log('API Base URL:', getApiUrl('/'))
console.log('RPC Endpoint:', process.env.NEXT_PUBLIC_API_URL)

// Test API connectivity
try {
  const response = await fetch(getApiUrl('/api/health'))
  console.log('Health check:', response.status)
} catch (error) {
  console.error('RPC connection error:', error)
}
```

#### 3. UI/UX Issues

**Problem**: Components not rendering correctly

**Solution**:
1. Check browser console for JavaScript errors
2. Verify component props and state
3. Check CSS conflicts with browser dev tools

**Problem**: Responsive design issues

**Solution**:
1. Test with browser responsive mode
2. Check Tailwind CSS breakpoints
3. Verify NextUI component responsive props

```css
/* Debug responsive issues */
.debug-responsive {
  @apply border-2 border-red-500;
}

/* Mobile first approach */
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

### Performance Issues

#### 1. Slow Page Loading

**Problem**: Initial page load is slow

**Solution**:
1. Analyze bundle size with webpack analyzer
2. Implement code splitting for large components
3. Optimize images and static assets

```bash
# Analyze bundle size
ANALYZE=true pnpm build
```

```typescript
// Implement code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})
```

**Problem**: API responses are slow

**Solution**:
1. Implement SWR caching strategy
2. Add loading states for better UX
3. Consider pagination for large datasets

```typescript
// Optimize data fetching using project's actual hooks and services
import { useMCPServicesList } from '@/hooks/useMCPServicesList'
import { fetchServices } from '@/services/marketplaceService'

// Use custom hook with built-in caching
const { data, isLoading, error, refetch } = useMCPServicesList({
  page: 1,
  page_size: 20,
  search: '',
  status: ''
})

// Implement manual caching for service data
const cachedFetchServices = useMemo(() => {
  return async (params: FetchServicesParams) => {
    const cacheKey = JSON.stringify(params)
    const cached = sessionStorage.getItem(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }
    
    const result = await fetchServices(params)
    sessionStorage.setItem(cacheKey, JSON.stringify(result))
    return result
  }
}, [])
```

#### 2. Memory Leaks

**Problem**: Memory usage increases over time

**Solution**:
1. Clean up event listeners in useEffect
2. Cancel pending API requests on component unmount
3. Properly dispose of subscriptions

```typescript
// Proper cleanup
useEffect(() => {
  const controller = new AbortController()
  
  fetchData({ signal: controller.signal })
    .then(setData)
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error(error)
      }
    })
  
  return () => {
    controller.abort()
  }
}, [])
```

### Deployment Issues

#### 1. Production Build Failures

**Problem**: Build works locally but fails in CI/CD

**Solution**:
1. Check Node.js version consistency
2. Verify environment variables in deployment
3. Check for platform-specific dependencies

```yaml
# GitHub Actions - Ensure consistent environment
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'pnpm'

- name: Install pnpm
  uses: pnpm/action-setup@v2
  with:
    version: latest
```

**Problem**: Static assets not loading

**Solution**:
1. Check asset paths in production
2. Verify CDN configuration
3. Check Next.js asset prefix configuration

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '/static' : '',
  basePath: process.env.BASE_PATH || ''
}
```

#### 2. Runtime Errors in Production

**Problem**: Application crashes in production

**Solution**:
1. Enable error tracking (Sentry)
2. Check server logs for detailed errors
3. Implement proper error boundaries

```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}
```

## Debugging Tools

### 1. Browser Developer Tools

**Network Tab**:
- Monitor API requests and responses
- Check request headers and status codes
- Analyze response times

**Console Tab**:
- View JavaScript errors and warnings
- Debug application state
- Test API calls manually

**Application Tab**:
- Inspect localStorage and sessionStorage
- Check service worker status
- Monitor cookies and tokens

### 2. React Developer Tools

Install React DevTools browser extension:
- Inspect component hierarchy
- Monitor state changes
- Profile component performance

### 3. Next.js Debugging

```typescript
// Enable debug mode
export default function MyApp({ Component, pageProps }) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Page props:', pageProps)
  }
  
  return <Component {...pageProps} />
}
```

### 4. API Debugging

```typescript
// Create debug API wrapper
const debugAPI = (url: string, options?: RequestInit) => {
  console.log('API Request:', url, options)
  
  return fetch(url, options)
    .then(response => {
      console.log('API Response:', response.status, response.statusText)
      return response
    })
    .catch(error => {
      console.error('API Error:', error)
      throw error
    })
}
```

## Getting Help

### 1. Check Documentation

- Review relevant documentation files in `/docs`
- Check component documentation in code comments
- Refer to Next.js and React documentation

### 2. Search Issues

- Check GitHub issues for similar problems
- Search Stack Overflow for common solutions
- Review Next.js discussions and forums

### 3. Create Detailed Bug Reports

When reporting issues, include:

1. **Environment Information**:
   - Node.js version
   - Browser version
   - Operating system

2. **Steps to Reproduce**:
   - Detailed steps to recreate the issue
   - Expected vs actual behavior

3. **Error Messages**:
   - Complete error messages and stack traces
   - Browser console errors
   - Server logs if applicable

4. **Code Samples**:
   - Minimal reproducible example
   - Relevant configuration files

### 4. Emergency Contacts

For critical production issues:
- Check monitoring dashboards
- Review error tracking alerts
- Contact system administrators
- Implement rollback procedures if necessary

## Prevention

### 1. Code Quality

- Use TypeScript for type safety
- Implement comprehensive testing
- Follow ESLint and Prettier rules
- Conduct code reviews

### 2. Monitoring

- Set up error tracking (Sentry)
- Monitor performance metrics
- Implement health checks
- Set up alerting for critical issues

### 3. Documentation

- Keep documentation up to date
- Document known issues and solutions
- Maintain troubleshooting runbooks
- Share knowledge across team members