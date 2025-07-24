# XPack WebUI

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![NextUI](https://img.shields.io/badge/NextUI-2-purple?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

A modern, enterprise-grade web application for the MCP (Model Context Protocol) Store, enabling seamless discovery, management, and integration of AI agent tools and services.

## 🌟 Overview

XPack WebUI is the flagship frontend interface for the MCP Store ecosystem, designed to connect AI agents with thousands of ready-to-use APIs and tools. Built with cutting-edge technologies, it provides developers and businesses with a unified platform to accelerate AI agent development and deployment.

### ✨ Key Features

- **🛍️ Comprehensive Marketplace**: Browse, search, and discover MCP services across multiple categories
- **👤 Multi-tier Authentication**: Secure user and admin authentication systems
- **⚙️ Advanced Admin Console**: Complete service management, user administration, and revenue tracking
- **🌐 Full Internationalization**: Native support for English and Chinese with extensible i18n framework
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile experiences
- **🎨 Modern UI/UX**: Built with NextUI and Tailwind CSS for exceptional user experience
- **🔧 Developer-First**: Comprehensive API integration and management tools
- **📊 Analytics & Insights**: Built-in revenue management and user analytics
- **🚀 Performance Optimized**: SSR (Server-Side Rendering) for dynamic content and SEO optimization with advanced caching strategies

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **pnpm** package manager (recommended)
- **Backend API** service running (for full functionality)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd apps/op

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Configuration

Create `.env.local` file in the project root and configure your backend service URLs:

```bash
# Backend Service API URL Prefix
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001

```

### Production Build

```bash
pnpm build
pnpm start
```

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **UI Library**: NextUI v2
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: SWR + Custom API Services
- **Animations**: Framer Motion
- **Internationalization**: react-i18next
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React + React Icons
- **Additional Libraries**:
  - Recharts (for analytics charts)
  - React Markdown (for content rendering)
  - Crypto-js (for encryption)
  - Three.js (for 3D effects)
  - Lottie React (for animations)
  - Anime.js (for advanced animations)
  - React Hook Form + Zod (for form validation)
  - React Hot Toast (for notifications)
  - React Hover Video Player (for media)
  - @uiw/react-md-editor (for markdown editing)
  - Simplex Noise (for procedural generation)

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── marketplace/        # Service marketplace
│   ├── console/           # Admin console
│   ├── dashboard/         # User dashboard
│   ├── signin/            # User authentication
│   ├── admin-signin/      # Admin authentication
│   └── loginSuccess/      # Login success page
├── components/            # Feature-specific components
│   ├── console/           # Admin console components
│   ├── dashboard/         # User dashboard components
│   ├── marketplace/       # Marketplace components
│   ├── mcp-services/      # MCP service management
│   ├── user-management/   # User administration
│   ├── revenue-management/# Revenue tracking
│   ├── system-setting/    # System configuration
│   └── wallet/            # Wallet management
├── shared/               # Shared utilities and components
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Global state management
│   ├── types/            # TypeScript definitions
│   ├── lib/              # Utility functions
│   ├── rpc/              # RPC services
│   ├── providers/        # React providers
│   ├── contexts/         # React contexts
│   ├── config/           # Configuration files
│   ├── data/             # Static data and mocks
│   └── utils/            # Utility functions
├── services/             # Backend API integration
│   ├── marketplaceService.ts  # Marketplace API
│   ├── mcpService.ts         # MCP service API
│   ├── userService.ts        # User management API
│   ├── revenueService.ts     # Revenue tracking API
│   ├── paymentChannelService.ts # Payment API
│   ├── systemConfigService.ts   # System config API
│   ├── platformConfigService.ts # Platform config API
│   └── overviewService.ts    # Overview/stats API
├── hooks/                # App-specific hooks
│   ├── useAdminLogin.tsx     # Admin authentication
│   ├── useLogin.tsx          # User authentication
│   ├── useMCPServicesList.ts # MCP services data
│   ├── useMCPServiceDetail.ts # Service details
│   ├── useUserManagement.ts  # User management
│   ├── useRevenueManagement.ts # Revenue data
│   ├── usePaymentChannelManagement.ts # Payment channels
│   └── useSystemConfigManagement.ts   # System config
├── store/                # Zustand stores
│   └── admin.ts          # Admin state management
├── types/                # TypeScript type definitions
│   ├── admin.ts          # Admin types
│   ├── dashboard.ts      # Dashboard types
│   ├── mcp-service.ts    # MCP service types
│   ├── payment.ts        # Payment types
│   ├── revenue.ts        # Revenue types
│   ├── system.ts         # System types
│   ├── user.ts           # User types
│   └── global.d.ts       # Global type declarations
├── rpc/                  # RPC layer
│   └── admin-api.ts      # Admin API client
└── utils/                # Utility functions
    └── getEmail.ts       # Email utilities
```

## 🎯 Core Features

### Marketplace Experience

- **Service Discovery**: Advanced search and filtering capabilities for MCP services
- **Service Catalog**: Browse services by categories with detailed information
- **Service Details**: Comprehensive service documentation and API specifications
- **Installation Guides**: Step-by-step integration instructions for developers

### User Dashboard

- **Personal Overview**: Account summary
- **API Key Management**: Create, edit, and manage API keys with usage analytics

### Admin Console

- **MCP Services Management**: Complete CRUD operations for MCP services
  - Service creation and editing with OpenAPI generator
  - OpenAPI document parsing from files or URLs
  - Service status management (enabled/disabled)
  - API configuration and documentation
- **User Management**: User account administration and monitoring
- **Revenue Management**: Financial reporting and revenue analytics
- **System Configuration**: Comprehensive platform settings and customization
  - Platform configuration (branding, URLs, features)
  - Admin account settings
  - Email service configuration
  - Google OAuth authentication setup
- **Payment Channels**: Payment method configuration and management
- **Platform Overview**: Real-time statistics and system monitoring

### Developer Experience

- **API Integration**: Seamless backend API connectivity with custom RPC layer
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Component Library**: Reusable UI components with NextUI design system
- **Custom Hooks**: Optimized data fetching and state management
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Real-time Updates**: Live data synchronization with backend services

## 🌐 Internationalization

The application supports multiple languages with a robust i18n system:

- **English** (default)
- **Chinese Simplified**

Translation files are located in `public/locales/` and managed through react-i18next with automatic language detection and fallback support.

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Development Guide](./docs/development.md)** - Setup, workflow, and coding standards
- **[Architecture Guide](./docs/architecture.md)** - Technical architecture and design patterns
- **[API Integration](./docs/api.md)** - Backend API services and data management
- **[Deployment Guide](./docs/deployment.md)** - Production build and deployment
- **[Internationalization](./docs/i18n.md)** - Multi-language support and translation
- **[Contributing Guide](./docs/contributing.md)** - Contribution guidelines and best practices

## 🛠️ Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript type checking
```

### Development Workflow

1. **Setup**: Follow the installation guide above
2. **Development**: Use `pnpm dev` for hot-reload development
3. **Type Checking**: Run `pnpm type-check` before commits
4. **Linting**: Ensure code quality with `pnpm lint`
5. **Building**: Test production builds with `pnpm build`

### Code Quality

- **ESLint**: Configured with Next.js and TypeScript rules
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (configured in IDE)
- **Husky**: Pre-commit hooks for quality assurance

## 🚀 Deployment

The application is optimized for various deployment platforms:

- **Vercel**: Native Next.js deployment with zero configuration
- **Docker**: Containerized deployment with standalone output
- **Self-hosted**: Node.js server deployment

### Build Configuration

- **Standalone Output**: Optimized for containerized deployments
- **Image Optimization**: Configured for static assets
- **SSR Support**: Server-side rendering for dynamic content and SEO
- **Bundle Analysis**: Webpack bundle optimization

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./docs/contributing.md) for detailed information on:

- **Development Setup**: Local environment configuration
- **Code Standards**: Coding conventions and best practices
- **Pull Request Process**: Contribution workflow and review process
- **Issue Reporting**: Bug reports and feature requests
- **Testing Guidelines**: Quality assurance requirements

### Getting Started with Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NextUI Team** for the exceptional UI component library
- **Vercel Team** for Next.js and deployment platform
- **Open Source Community** for the amazing tools and libraries

## 📞 Support

- **Documentation**: Check the `docs/` directory for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join our community discussions
- **Enterprise**: Contact us for enterprise support and customization

---

**Built with ❤️ by the XPack.AI Team**
