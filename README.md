# quiltt-js

[![Maintainability](https://qlty.sh/gh/quiltt/projects/quiltt-js/maintainability.svg)](https://qlty.sh/gh/quiltt/projects/quiltt-js) [![Code Coverage](https://qlty.sh/gh/quiltt/projects/quiltt-js/coverage.svg)](https://qlty.sh/gh/quiltt/projects/quiltt-js)

This repository is the home of Quiltt's JavaScript projects, featuring a comprehensive suite of tools and libraries designed for ECMAScript runtimes. Built with full TypeScript support, our packages provide seamless integration for React, Vue, React Native, CapacitorJS, and Node.js environments.

## About Quiltt

Quiltt's unified API streamlines fintech application development by providing a single point of integration to multiple open banking data and enrichment providers. Our platform simplifies complex financial data workflows, enabling developers to focus on building exceptional user experiences.

## Getting Started

For comprehensive documentation including core concepts, guides, and API reference, visit [https://quiltt.dev](https://quiltt.dev).

Each package includes detailed setup instructions and examples. See the individual package READMEs below for specific implementation details:

- [Core Package](packages/core#readme) - Essential functionality and types
- [React Package](packages/react#readme) - React components and hooks
- [Vue Package](packages/vue#readme) - Vue 3 components and composables
- [React Native Package](packages/react-native#readme) - React Native and Expo components
- [Capacitor Package](packages/capacitor#readme) - Cross-platform mobile integration for React and Vue

## Examples

- [React + Next.js](examples/react-nextjs/README.md)
- [React Native + Expo](examples/react-native-expo/README.md)
- [Vue + Nuxt](examples/vue-nuxt/README.md)
- [Capacitor + React](examples/capacitor-react/README.md)
- [Capacitor + Vue](examples/capacitor-vue/README.md)

## Packages

### [@quiltt/core](packages/core#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Fcore.svg)](https://badge.fury.io/js/%40quiltt%2Fcore)

The foundational package providing essential functionality for JavaScript-based Quiltt applications. Features include Auth API client, JWT handling, observables, storage management, timeout utilities, and comprehensive TypeScript types.

### [@quiltt/react](packages/react#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Freact.svg)](https://badge.fury.io/js/%40quiltt%2Freact)

React components and hooks for seamless Quiltt integration, built on a powerful Apollo-based GraphQL client. Includes providers, authentication hooks, and pre-built UI components.

### [@quiltt/vue](packages/vue#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Fvue.svg)](https://badge.fury.io/js/%40quiltt%2Fvue)

Vue 3 components and composables for integrating Quiltt Connector, including plugin-based session management and connector lifecycle utilities.

### [@quiltt/react-native](packages/react-native#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Freact-native.svg)](https://badge.fury.io/js/%40quiltt%2Freact-native)

Native components optimized for React Native and Expo applications, featuring the Quiltt Connector and mobile-specific utilities for financial data integration.

### [@quiltt/capacitor](packages/capacitor#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Fcapacitor.svg)](https://badge.fury.io/js/%40quiltt%2Fcapacitor)

Capacitor plugin and framework adapters for integrating Quiltt Connector in iOS and Android apps with native OAuth deep-link handling.

## Development

### Prerequisites

- Node.js
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start development mode
pnpm run dev
```

### Testing

This project uses Vitest for unit testing and Playwright for component and end-to-end testing, with comprehensive coverage reporting.

#### Running Tests

```bash
# Run unit tests with coverage
pnpm run test:unit

# Run unit tests for specific package
pnpm run test:unit -- --project react

# Run unit tests for specific file/pattern
pnpm run test:unit -- packages/core/src/api

# Run end-to-end tests
pnpm run test:e2e

# Run tests in watch mode (development)
pnpm run test
```

#### Test Structure

- **Unit Tests**: Located alongside source files with `.test.ts/.tsx` extensions
- **Web Component/E2E Tests**: Playwright tests in `examples/react-nextjs/e2e/` and `examples/vue-nuxt/e2e/`
- **Mobile E2E Tests**: Detox tests in `examples/react-native-expo/e2e/`
- **Coverage**: Istanbul coverage reports generated in `coverage/` directory

#### Testing Stack

- **Vitest**: Fast unit test runner with native TypeScript support
- **Playwright**: Component and end-to-end testing for web examples
- **Detox**: End-to-end testing for React Native example apps
- **Testing Library**: React and React Native testing utilities
- **Happy DOM**: Lightweight DOM implementation for faster tests

### Code Quality

```bash
# Lint all packages
pnpm run lint

# Type checking
pnpm run typecheck

# Check dependency versions consistency
pnpm run check:packages
```

## Contributing

We welcome contributions from developers at all skill levels. Whether you're reporting bugs, proposing features, or contributing code, your involvement drives the improvement of these projects.

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for detailed information on how to get started. For information on creating releases and changesets, see our [Release Documentation](RELEASING.md).

## Publishing

This project uses Changesets for automated version management and publishing. The process is streamlined through GitHub Actions:

```bash
# Create a changeset (only step needed for contributors)
pnpm changeset
```

Once a changeset is created and merged to the `main` branch, our automated release workflow handles versioning and publishing to npm via the Changesets GitHub bot.

For detailed information on the release process, version management, and troubleshooting, see our [Release Documentation](RELEASING.md).

## License

This repository and all published packages are licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
