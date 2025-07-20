# Contributing Guide

## Welcome Contributors!

Thank you for your interest in contributing to XPack WebUI. This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)
- Git
- Basic knowledge of React, Next.js 15, and TypeScript 5

### Development Setup

1. **Fork the Repository**

   - Click the "Fork" button on GitHub
   - Clone your fork locally:
     ```bash
     git clone https://github.com/xpack-ai/XPack-MCP-Market.git
     cd XPack-MCP-Market/frontend
     ```

2. **Set Up Development Environment**

   ```bash
   # Install dependencies (from project root)
   pnpm install

   # Copy environment file
   cp .env.example .env.local

   # Start development server
   pnpm dev
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## Development Guidelines

### Code Style

We follow strict coding standards to maintain code quality:

- **TypeScript**: Use strict mode, provide proper types
- **ESLint**: Follow the configured rules
- **Prettier**: Code is automatically formatted
- **File Naming**: Use kebab-case for files, PascalCase for components

### Component Structure

```typescript
// Good component structure
import React from 'react'
import { useTranslation } from '@/shared/lib/useTranslation'
import type { ComponentProps } from './types'

interface MyComponentProps extends ComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction, ...props }: MyComponentProps) {
  const { t } = useTranslation()

  return (
    <div className="p-4" {...props}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <button onClick={onAction} className="btn-primary">
        {t('Action')}
      </button>
    </div>
  )
}
```

### State Management

- Use Zustand for global state
- Use React hooks for local component state
- Keep state as close to where it's used as possible

```typescript
// Global state example
import { create } from "zustand";

interface FeatureStore {
  data: FeatureData[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

export const useFeatureStore = create<FeatureStore>((set, get) => ({
  data: [],
  loading: false,
  fetchData: async () => {
    set({ loading: true });
    try {
      const data = await fetchFeatureData();
      set({ data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));
```

### API Integration

- Use the existing API service pattern
- Handle errors appropriately
- Provide loading states

```typescript
// API service example using fetchAPI
import { fetchAPI } from "@/shared/rpc/common-function";
import { fetchAdminAPI } from "@/rpc/admin-api";

// Public API call
export async function fetchServices(): Promise<ServiceData[]> {
  const response = await fetchAPI("/api/web/mcp_services");
  return response.data;
}

// Admin API call
export async function getMCPServiceList(
  params: GetMCPServiceListParams
): Promise<MCPServiceListApiResponse> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    page_size: params.page_size.toString(),
    ...(params.search && { search: params.search }),
    ...(params.status && { status: params.status }),
  });

  return await fetchAdminAPI<MCPService[]>(
    `/api/mcp/service/list?${queryParams.toString()}`,
    { method: "GET" }
  );
}
```

### Internationalization

- Add translations for all user-facing text
- Use the translation hook consistently
- Update both English and Chinese translations

```typescript
// Component with i18n
import { useTranslation } from '@/shared/lib/useTranslation'

function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('Welcome')}</h1>
      <p>{t('This is a description')}</p>
    </div>
  )
}
```

```json
// public/locales/en/translation.json
{
  "Welcome": "Welcome",
  "This is a description": "This is a description"
}

// public/locales/zh-CN/translation.json
{
  "Welcome": "欢迎",
  "This is a description": "这是一个描述"
}
```

## Types of Contributions

### 🐛 Bug Fixes

1. **Identify the Bug**

   - Check if the issue already exists
   - Reproduce the bug locally
   - Understand the root cause

2. **Fix the Bug**

   - Write a minimal fix
   - Add tests if applicable
   - Ensure no regression

3. **Test the Fix**
   - Test manually in browser
   - Run automated tests
   - Check different scenarios

### ✨ New Features

1. **Feature Planning**

   - Discuss the feature in issues first
   - Consider the user experience
   - Plan the implementation approach

2. **Implementation**

   - Break down into smaller tasks
   - Follow existing patterns
   - Add proper TypeScript types

3. **Documentation**
   - Update relevant documentation
   - Add code comments where needed
   - Update translation files

### 📚 Documentation

- Fix typos and grammar
- Add missing documentation
- Improve existing explanations
- Add code examples

### 🎨 UI/UX Improvements

- Follow the existing design system
- Use NextUI components when possible
- Ensure responsive design
- Test on different screen sizes

### 🌐 Translations

- Add support for new languages
- Fix translation errors
- Improve translation quality

## Pull Request Process

### Before Submitting

1. **Code Quality**

   ```bash
   # Run linting
   pnpm lint

   # Check TypeScript
   pnpm type-check

   # Run tests
   pnpm test

   # Build check
   pnpm build
   ```

2. **Test Your Changes**

   - Test in development environment
   - Check different browsers
   - Verify responsive design
   - Test with different data scenarios

3. **Update Documentation**
   - Update README if needed
   - Add/update code comments
   - Update translation files

### Submitting the PR

1. **Commit Messages**
   Use conventional commit format:

   ```
   feat: add user profile management
   fix: resolve navigation menu bug
   docs: update API documentation
   style: improve button styling
   refactor: simplify authentication logic
   test: add unit tests for services
   ```

2. **PR Title and Description**

   - Clear, descriptive title
   - Explain what changes were made
   - Reference related issues
   - Include screenshots for UI changes

3. **PR Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Style/UI improvement

   ## Testing

   - [ ] Tested locally
   - [ ] Added/updated tests
   - [ ] Checked responsive design

   ## Screenshots (if applicable)

   Add screenshots here

   ## Related Issues

   Fixes #123
   ```

### Review Process

1. **Automated Checks**

   - All CI checks must pass
   - Code coverage requirements
   - Build must succeed

2. **Code Review**

   - Maintainers will review within 48 hours
   - Address feedback promptly
   - Be open to suggestions

3. **Approval and Merge**
   - At least one approval required
   - All conversations resolved
   - Maintainer will merge

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build check
pnpm build
```

### Writing Tests

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test Title" onAction={jest.fn()} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('calls onAction when button is clicked', () => {
    const mockAction = jest.fn()
    render(<MyComponent title="Test" onAction={mockAction} />)

    fireEvent.click(screen.getByRole('button'))
    expect(mockAction).toHaveBeenCalledTimes(1)
  })
})
```

### Test Coverage

- Aim for >80% test coverage
- Focus on critical functionality
- Test edge cases and error scenarios

## Code Review Guidelines

### For Contributors

- Be responsive to feedback
- Ask questions if unclear
- Make requested changes promptly
- Keep discussions professional

### For Reviewers

- Be constructive and helpful
- Explain the reasoning behind suggestions
- Approve when ready, request changes when needed
- Focus on code quality and user experience

## Community Guidelines

### Communication

- Be respectful and inclusive
- Help newcomers get started
- Share knowledge and best practices
- Use GitHub Discussions for questions

### Issue Reporting

1. **Search Existing Issues**

   - Check if the issue already exists
   - Add to existing discussion if relevant

2. **Provide Details**

   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment information

3. **Use Issue Templates**
   - Bug report template
   - Feature request template
   - Question template

### Feature Requests

1. **Describe the Problem**

   - What problem does this solve?
   - Who would benefit from this feature?

2. **Propose a Solution**

   - How should it work?
   - What should the user experience be?

3. **Consider Alternatives**
   - Are there other ways to solve this?
   - How do other tools handle this?

## Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Project documentation
- Community discussions

## Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Code Comments**: For implementation questions
- **Documentation**: Check existing docs first

## License

By contributing to XPack WebUI, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to XPack WebUI! Your contributions help make this project better for everyone.
