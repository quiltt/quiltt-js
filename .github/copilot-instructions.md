# Copilot Instructions for quiltt-js

## Project Overview

quiltt-js is a TypeScript monorepo providing JavaScript SDKs for Quiltt's unified fintech API. The project enables seamless integration with open banking data and enrichment providers across React, React Native, and Node.js environments.

### Key Concepts

- **Quiltt**: A unified fintech API platform that simplifies integration with multiple open banking providers
- **Session Tokens**: JWT-based authentication tokens used by the Quiltt Connector
- **Connector**: Pre-built UI component for connecting financial accounts
- **Auth API**: Backend service for managing Session tokens and authentication

## Architecture

### Monorepo Structure

This is a pnpm workspace monorepo managed with Turbo:

- **packages/core** - Core primitives: Auth API client, JWT handling, observables, storage, types
- **packages/react** - React components and hooks built on Apollo GraphQL client
- **packages/react-native** - React Native and Expo components for mobile apps
- **examples/react-nextjs** - Next.js example application with Playwright tests
- **examples/react-native-expo** - Expo example application with Detox tests

### Package Dependencies

- `@quiltt/react` depends on `@quiltt/core`
- `@quiltt/react-native` depends on `@quiltt/core`
- Keep versions in sync across packages to avoid dependency mismatches

## Code Standards

### TypeScript

- **Strict mode**: All packages use strict TypeScript configuration
- **Type exports**: Export all public types from package index files
- **Type organization**: Group exports by module/category with clear section comments
- **No implicit any**: Always provide explicit types
- **Interface over type**: Use `interface` for object shapes, `type` for unions/intersections

### Code Style

- **Formatter**: Biome (configured in `biome.json`)
- **Import organization**: Biome auto-organizes imports with specific grouping:
  1. React/React DOM/React Native imports
  2. Framework imports (Next.js, Expo)
  3. Testing libraries
  4. Node built-ins
  5. Radix UI components
  6. Third-party packages
  7. Internal package imports (`@quiltt/*`, `@/`)
  8. Relative imports (parent to local)
  9. CSS imports
- **Naming conventions**:
  - Components: PascalCase
  - Hooks: camelCase with `use` prefix
  - Constants: SCREAMING_SNAKE_CASE for true constants, camelCase for configuration objects
  - Files: Match exported component/function name (PascalCase for components, camelCase for utilities)

### React Patterns

- **Hooks**: Prefer hooks over class components
- **Context**: Use React Context for state that needs to be accessed by multiple components
- **Apollo Client**: Use hooks from `@apollo/client` for GraphQL operations
- **Error Boundaries**: Implement error boundaries for critical UI sections
- **Prop types**: Define TypeScript interfaces for all component props

### Testing

- **Unit tests**: Vitest with Testing Library
  - Place `.test.ts/.tsx` files alongside source files
  - Use `describe` blocks to organize related tests
  - Mock external dependencies when appropriate
  - Aim for high coverage on core functionality
- **Component tests**: Playwright for React components
  - Located in `examples/react-nextjs/playwright/`
  - Test user interactions and component integration
- **E2E tests**: Playwright for web, Detox for React Native
  - Focus on critical user flows
  - Test connector integration flows
- **Coverage**: Istanbul reports in `coverage/` directory

### File Naming

**All new files must use kebab-case naming convention:**

- **Components**: `component-name.tsx`
- **Hooks**: `use-hook-name.ts`
- **Utils**: `utility-name.ts`
- **Tests**: `file-name.test.ts` or `file-name.test.tsx`
- **Types**: Include in same file as implementation or `types.ts` for shared types

**Legacy naming conventions** (existing files only, do not use for new files):
- Components: `ComponentName.tsx`
- Hooks: `useHookName.ts`
- Utils: `utilityName.ts`

## Development Workflow

### Commands

- `pnpm install` - Install all dependencies
- `pnpm run build` - Build all packages
- `pnpm run build:packages` - Build only packages (not examples)
- `pnpm run dev` - Start development mode for all packages
- `pnpm run test` - Run tests in watch mode
- `pnpm run test:unit` - Run unit tests with coverage
- `pnpm run test:e2e` - Run end-to-end tests
- `pnpm run lint` - Lint all packages
- `pnpm run typecheck` - Type-check all packages

### Changesets

- **All changes require changesets**: Run `pnpm changeset` to document changes
- **Changeset types**:
  - `major` - Breaking changes
  - `minor` - New features (backward compatible)
  - `patch` - Bug fixes and minor improvements
- **Commit changesets**: Include generated `.changeset/*.md` files in commits
- See [RELEASING.md](../RELEASING.md) for release process

### Git Workflow

1. Create feature branch from `main`
2. Make changes following code standards
3. Run `pnpm changeset` to document changes
4. Write/update tests for changes
5. Ensure `pnpm run test:unit` passes
6. Ensure `pnpm run lint` passes
7. Ensure `pnpm run typecheck` passes
8. Commit with clear, descriptive messages
9. Push and create pull request

## Common Patterns

### Auth API Usage

```typescript
import { AuthAPI } from '@quiltt/core'

const auth = new AuthAPI()
await auth.ping(sessionToken)
await auth.revoke(sessionToken)
```

### JWT Handling

```typescript
import { JsonWebToken } from '@quiltt/core'

const jwt = new JsonWebToken(token)
if (jwt.isValid()) {
  const payload = jwt.getPayload()
}
```

### React Provider Setup

```typescript
import { QuilttProvider } from '@quiltt/react'

<QuilttProvider auth={{ connectorId }}>
  <App />
</QuilttProvider>
```

### React Hooks

```typescript
import { useQuilttAuth, useQuilttSession } from '@quiltt/react'

const { authenticate, revokeSession } = useQuilttAuth()
const { token, profile } = useQuilttSession()
```

### React Native Components

```typescript
import { QuilttConnector } from '@quiltt/react-native'

<QuilttConnector
  connectorId={connectorId}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

## Agent Skills

The project includes specialized skills that provide detailed best practices for specific areas:

### React Best Practices

See [.github/skills/react-best-practices.md](.github/skills/react-best-practices.md) for comprehensive performance optimization guidelines for React and Next.js code in the `@quiltt/react` package and examples. This includes:

- Eliminating async waterfalls (CRITICAL)
- Bundle size optimization (CRITICAL)
- GraphQL & Apollo Client optimization (HIGH)
- Re-render optimization (MEDIUM)
- Rendering performance (MEDIUM)
- Quiltt-specific patterns for authentication and data fetching

**When to reference:** Writing or reviewing React components, implementing GraphQL queries, optimizing performance, or working in the Next.js example app.

### React Native Best Practices

See [.github/skills/react-native-best-practices.md](.github/skills/react-native-best-practices.md) for mobile-specific best practices for the `@quiltt/react-native` package and Expo example app. This includes:

- Core rendering patterns (CRITICAL)
- List performance for financial data (HIGH)
- Animation optimization (HIGH)
- Navigation patterns (HIGH)
- UI patterns and platform-specific considerations (HIGH)
- Quiltt Connector integration patterns

**When to reference:** Building React Native components, optimizing list/scroll performance, implementing the Quiltt Connector, or working in the Expo example app.

## Module-Specific Guidelines

### @quiltt/core

- Pure TypeScript, no UI dependencies
- Platform-agnostic code (works in browser, Node, React Native)
- Export all types used in public APIs
- Document all public classes and methods
- Keep modules focused and single-purpose

### @quiltt/react

- Built on Apollo Client for GraphQL
- Export Apollo types and utilities for user convenience
- Provide both hook-based and component-based APIs
- Handle loading, error, and success states
- Support SSR where applicable

### @quiltt/react-native

- Compatible with both React Native and Expo
- Use platform-specific code only when necessary
- Test on both iOS and Android
- Handle permission requests appropriately
- Optimize for mobile performance

## Documentation

### Code Comments

- Use JSDoc for public APIs
- Include `@param`, `@returns`, `@throws` tags
- Provide usage examples in complex cases
- Avoid obvious comments; comment the "why", not the "what"

### README Files

- Each package has its own README
- Include installation, usage examples, and API reference
- Link to main documentation at https://quiltt.dev
- Keep examples simple and practical

### Changesets

- Write clear, user-facing descriptions
- Explain what changed and why it matters
- Include migration notes for breaking changes
- Reference related issues/PRs when applicable

## Common Tasks

### Adding a New Feature

1. Determine which package(s) need changes
2. Write tests first (TDD approach preferred)
3. Implement feature following existing patterns
4. Update TypeScript types
5. Run tests and type-checking
6. Create changeset with `pnpm changeset`
7. Update relevant README if API changed
8. Submit PR with clear description

### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Fix the issue
3. Ensure test passes
4. Check for regression in related areas
5. Create changeset (usually patch version)
6. Submit PR referencing the issue

### Updating Dependencies

- Use `pnpm update` to update dependencies
- Test thoroughly after updates
- Update package.json versions if needed
- Create changeset if dependency update affects users
- Check for breaking changes in dependency changelogs

## Performance Considerations

- **Bundle size**: Keep package sizes minimal; check with `pnpm run bundlesize`
- **Tree shaking**: Use named exports for better tree-shaking
- **Lazy loading**: Lazy load components when appropriate
- **Memoization**: Use `useMemo`, `useCallback` judiciously (profile first)
- **GraphQL**: Use fragments to avoid over-fetching data

## Security

- **Never commit secrets**: Use environment variables
- **JWT validation**: Always validate tokens before use
- **Input sanitization**: Sanitize user inputs
- **Dependencies**: Keep dependencies updated for security patches
- **Token storage**: Use secure storage mechanisms (especially in React Native)

## Additional Resources

- Main documentation: https://www.quiltt.dev
- Contributing guide: [CONTRIBUTING.md](../CONTRIBUTING.md)
- Release process: [RELEASING.md](../RELEASING.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)
