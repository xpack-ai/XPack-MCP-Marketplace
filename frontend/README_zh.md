# XPack WebUI

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![NextUI](https://img.shields.io/badge/NextUI-2-purple?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

一个现代化的企业级 Web 应用程序，专为 MCP（模型上下文协议）商店打造，实现 AI 智能体工具和服务的无缝发现、管理和集成。

## 🌟 概述

XPack WebUI 是 MCP 商店生态系统的旗舰前端界面，旨在连接 AI 智能体与数千个即用型 API 和工具。采用前沿技术构建，为开发者和企业提供统一平台，加速 AI 智能体的开发和部署。

这是一个现代化的企业级 Web 应用程序，专为 MCP（模型上下文协议）商店打造，实现 AI 智能体工具和服务的无缝发现、管理和集成。

### ✨ 核心特性

- **🛍️ 综合性市场**: 跨多个类别浏览、搜索和发现 MCP 服务
- **👤 多层级认证**: 安全的用户和管理员认证系统
- **⚙️ 高级管理控制台**: 完整的服务管理、用户管理和收入跟踪
- **🌐 完整国际化**: 原生支持中英文，具备可扩展的 i18n 框架
- **📱 响应式设计**: 针对桌面、平板和移动设备优化
- **🎨 现代化 UI/UX**: 基于 NextUI 和 Tailwind CSS 构建，提供卓越用户体验
- **🔧 开发者优先**: 全面的 API 集成和管理工具
- **📊 分析与洞察**: 内置收入管理和用户分析
- **🚀 性能优化**: SSR（服务器端渲染）支持动态内容和SEO优化，配备高级缓存策略

## 🚀 快速开始

### 前置要求

- **Node.js** 18.0 或更高版本
- **pnpm** 包管理器（推荐）
- **后端 API** 服务运行中（完整功能需要）

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd apps/op

# 安装依赖
pnpm install

# 配置环境
cp .env.example .env.local

# 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用程序。

### 环境配置

在项目根目录创建 `.env.local` 文件，配置后端服务 URL：

```bash
# 后端服务 API URL 前缀
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001

```

### 生产构建

```bash
pnpm build
pnpm start
```

## 🏗️ 架构

### 技术栈

- **框架**: Next.js 15 with App Router
- **语言**: TypeScript 5
- **UI 库**: NextUI v2
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **数据获取**: SWR + 自定义 API 服务
- **动画**: Framer Motion
- **国际化**: react-i18next
- **表单处理**: React Hook Form + Zod
- **图标**: Lucide React + React Icons
- **其他库**:
  - Recharts (图表分析)
  - React Markdown (内容渲染)
  - Crypto-js (加密)
  - Three.js (3D 效果)
  - Lottie React (动画)
  - Anime.js (高级动画)
  - React Hook Form + Zod (表单验证)
  - React Hot Toast (通知)
  - React Hover Video Player (媒体)
  - @uiw/react-md-editor (Markdown 编辑)
  - Simplex Noise (程序化生成)

### 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── marketplace/        # 服务市场
│   ├── console/           # 管理控制台
│   ├── dashboard/         # 用户仪表板
│   ├── signin/            # 用户认证
│   ├── admin-signin/      # 管理员认证
│   └── loginSuccess/      # 登录成功页面
├── components/            # 功能特定组件
│   ├── console/           # 管理控制台组件
│   ├── dashboard/         # 用户仪表板组件
│   ├── marketplace/       # 市场组件
│   ├── mcp-services/      # MCP 服务管理
│   ├── user-management/   # 用户管理
│   ├── revenue-management/# 收入跟踪
│   ├── system-setting/    # 系统配置
│   └── wallet/            # 钱包管理
├── shared/               # 共享工具和组件
│   ├── components/        # 可复用 UI 组件
│   ├── hooks/            # 自定义 React hooks
│   ├── store/            # 全局状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── lib/              # 工具函数
│   ├── rpc/              # RPC 服务
│   ├── providers/        # React 提供者
│   ├── contexts/         # React 上下文
│   ├── config/           # 配置文件
│   ├── data/             # 静态数据和模拟数据
│   └── utils/            # 工具函数
├── services/             # 后端 API 集成
│   ├── marketplaceService.ts  # 市场 API
│   ├── mcpService.ts         # MCP 服务 API
│   ├── userService.ts        # 用户管理 API
│   ├── revenueService.ts     # 收入跟踪 API
│   ├── paymentChannelService.ts # 支付 API
│   ├── systemConfigService.ts   # 系统配置 API
│   ├── platformConfigService.ts # 平台配置 API
│   └── overviewService.ts    # 概览/统计 API
├── hooks/                # 应用特定 hooks
│   ├── useAdminLogin.tsx     # 管理员认证
│   ├── useLogin.tsx          # 用户认证
│   ├── useMCPServicesList.ts # MCP 服务数据
│   ├── useMCPServiceDetail.ts # 服务详情
│   ├── useUserManagement.ts  # 用户管理
│   ├── useRevenueManagement.ts # 收入数据
│   ├── usePaymentChannelManagement.ts # 支付渠道
│   └── useSystemConfigManagement.ts   # 系统配置
├── store/                # Zustand 状态存储
│   └── admin.ts          # 管理员状态管理
├── types/                # TypeScript 类型定义
│   ├── admin.ts          # 管理员类型
│   ├── dashboard.ts      # 仪表板类型
│   ├── mcp-service.ts    # MCP 服务类型
│   ├── payment.ts        # 支付类型
│   ├── revenue.ts        # 收入类型
│   ├── system.ts         # 系统类型
│   ├── user.ts           # 用户类型
│   └── global.d.ts       # 全局类型声明
├── rpc/                  # RPC 层
│   └── admin-api.ts      # 管理员 API 客户端
└── utils/                # 工具函数
    └── getEmail.ts       # 邮箱工具
```

## 🎯 核心功能

### 市场体验

- **服务发现**: MCP 服务的高级搜索和过滤功能
- **服务目录**: 按类别浏览服务，提供详细信息
- **服务详情**: 全面的服务文档和 API 规范
- **安装指南**: 为开发者提供分步集成说明

### 用户仪表板

- **个人概览**: 账户摘要
- **API 密钥管理**: 创建、编辑和管理 API 密钥，包含使用统计

### 管理控制台

- **MCP 服务管理**: MCP 服务的完整 CRUD 操作
  - 使用 OpenAPI 生成器创建和编辑服务
  - 从文件或 URL 解析 OpenAPI 文档
  - 服务状态管理（启用/禁用）
  - API 配置和文档
- **用户管理**: 用户账户管理和监控
- **收入管理**: 财务报告和收入分析
- **系统配置**: 全面的平台设置和自定义
  - 平台配置（品牌、URL、功能）
  - 管理员账户设置
  - 邮件服务配置
  - Google OAuth 认证设置
- **支付渠道**: 支付方式配置和管理
- **平台概览**: 实时统计和系统监控

### 开发者体验

- **API 集成**: 使用自定义 RPC 层的无缝后端 API 连接
- **类型安全**: 完整的 TypeScript 支持和全面的类型定义
- **组件库**: 使用 NextUI 设计系统的可复用 UI 组件
- **自定义 Hooks**: 优化的数据获取和状态管理
- **错误处理**: 全面的错误边界和用户反馈
- **实时更新**: 与后端服务的实时数据同步

## 🌐 国际化

应用程序支持多语言，具备强大的 i18n 系统：

- **英语**（默认）
- **简体中文**

翻译文件位于 `public/locales/`，通过 react-i18next 管理，支持自动语言检测和回退。

## 📚 文档

`docs/` 目录中提供了全面的文档：

- **[开发指南](./docs/development.md)** - 设置、工作流程和编码标准
- **[架构指南](./docs/architecture.md)** - 技术架构和设计模式
- **[API 集成](./docs/api.md)** - 后端 API 服务和数据管理
- **[部署指南](./docs/deployment.md)** - 生产构建和部署
- **[国际化](./docs/i18n.md)** - 多语言支持和翻译
- **[贡献指南](./docs/contributing.md)** - 贡献指南和最佳实践

## 🛠️ 开发

### 可用脚本

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 生产构建
pnpm start        # 启动生产服务器
pnpm lint         # 运行 ESLint
pnpm type-check   # TypeScript 类型检查
```

### 开发工作流

1. **设置**: 按照上述安装指南操作
2. **开发**: 使用 `pnpm dev` 进行热重载开发
3. **类型检查**: 提交前运行 `pnpm type-check`
4. **代码检查**: 使用 `pnpm lint` 确保代码质量
5. **构建**: 使用 `pnpm build` 测试生产构建

### 代码质量

- **ESLint**: 配置了 Next.js 和 TypeScript 规则
- **TypeScript**: 启用严格类型检查
- **Prettier**: 代码格式化（在 IDE 中配置）
- **Husky**: 质量保证的预提交钩子

## 🚀 部署

应用程序针对各种部署平台进行了优化：

- **Vercel**: 零配置的原生 Next.js 部署
- **Docker**: 使用独立输出的容器化部署
- **自托管**: Node.js 服务器部署

### 构建配置

- **独立输出**: 针对容器化部署优化
- **图像优化**: 为静态资源配置
- **SSR 支持**: 服务器端渲染支持动态内容和SEO优化
- **包分析**: Webpack 包优化

## 🤝 贡献

我们欢迎社区贡献！请阅读我们的[贡献指南](./docs/contributing.md)了解详细信息：

- **开发设置**: 本地环境配置
- **代码标准**: 编码约定和最佳实践
- **拉取请求流程**: 贡献工作流程和审查过程
- **问题报告**: 错误报告和功能请求
- **测试指南**: 质量保证要求

### 开始贡献

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 进行更改并彻底测试
4. 提交更改：`git commit -m 'Add amazing feature'`
5. 推送到分支：`git push origin feature/amazing-feature`
6. 打开拉取请求

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- **NextUI 团队** 提供卓越的 UI 组件库
- **Vercel 团队** 提供 Next.js 和部署平台
- **开源社区** 提供出色的工具和库

## 📞 支持

- **文档**: 查看 `docs/` 目录获取详细指南
- **问题**: 通过 GitHub Issues 报告错误和请求功能
- **社区**: 加入我们的社区讨论
- **企业**: 联系我们获取企业支持和定制

---

**由 XPack.AI 团队用 ❤️ 构建**
