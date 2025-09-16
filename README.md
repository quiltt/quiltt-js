# quiltt-js

<!-- @todo: Add QLTY tags for Maintenability + Code Coverage -->

This repository is the home of Quiltt's JavaScript projects, featuring a comprehensive suite of tools and libraries designed for ECMAScript runtimes. Built with full TypeScript support, our packages provide seamless integration for React, React Native, and Node.js environments.

## About Quiltt

Quiltt's unified API streamlines fintech application development by providing a single point of integration to multiple open banking data and enrichment providers. Our platform simplifies complex financial data workflows, enabling developers to focus on building exceptional user experiences.

## Getting Started

For comprehensive documentation including core concepts, guides, and API reference, visit [https://quiltt.dev](https://quiltt.dev).

Each package includes detailed setup instructions and examples. See the individual package READMEs below for specific implementation details.

## Packages

### [@quiltt/core](packages/core#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Fcore.svg)](https://badge.fury.io/js/%40quiltt%2Fcore)

The foundational package providing essential functionality for JavaScript-based Quiltt applications. Features include Auth API client, JWT handling, observables, storage management, timeout utilities, and comprehensive TypeScript types.

### [@quiltt/react](packages/react#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Freact.svg)](https://badge.fury.io/js/%40quiltt%2Freact)

React components and hooks for seamless Quiltt integration, built on a powerful Apollo-based GraphQL client. Includes providers, authentication hooks, and pre-built UI components.

### [@quiltt/react-native](packages/react-native#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Freact-native.svg)](https://badge.fury.io/js/%40quiltt%2Freact-native)

Native components optimized for React Native and Expo applications, featuring the Quiltt Connector and mobile-specific utilities for financial data integration.

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

This project uses Vitest for unit testing and Cypress for end-to-end testing, with comprehensive coverage reporting.

#### Running Tests

```bash
# Run unit tests with coverage
pnpm run test:unit

# Run unit tests for specific package
pnpm run test:unit packages/react

# Run unit tests for specific file/pattern
pnpm run test:unit packages/core/src/api

# Run end-to-end tests
pnpm run test:e2e

# Run tests in watch mode (development)
pnpm run test
```

#### Test Structure

- **Unit Tests**: Located alongside source files with `.test.ts/.tsx` extensions
- **E2E Tests**: Cypress tests in `examples/react-nextjs/cypress/`
- **Coverage**: Istanbul coverage reports generated in `coverage/` directory

#### Testing Stack

- **Vitest**: Fast unit test runner with native TypeScript support
- **Cypress**: End-to-end testing for React applications
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

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for detailed information on how to get started.

## Publishing

This project uses Changesets for automated version management and publishing. The process is streamlined through GitHub Actions:

```bash
# Create a changeset (only step needed for contributors)
pnpm changeset
```

Once a changeset is created and merged to the `main` branch, our automated release workflow handles versioning and publishing to npm via the Changesets GitHub bot.

## License

This repository and all published packages are licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

