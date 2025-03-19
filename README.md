# quiltt-js

[![Maintainability](https://qlty.sh/gh/quiltt/projects/quiltt-js/maintainability.svg)](https://qlty.sh/gh/quiltt/projects/quiltt-js) [![Code Coverage](https://qlty.sh/gh/quiltt/projects/quiltt-js/coverage.svg)](https://qlty.sh/gh/quiltt/projects/quiltt-js)

This repository is the home of Quiltt's JavaScript projects, featuring a comprehensive suite of tools and libraries designed for ECMAScript runtimes. Built with full TypeScript support, our packages provide seamless integration for React, React Native, and Node.js environments.

## About Quiltt

Quiltt's unified API streamlines fintech application development by providing a single point of integration to multiple open banking data and enrichment providers. Our platform simplifies complex financial data workflows, enabling developers to focus on building exceptional user experiences.

## Getting Started

For comprehensive documentation including core concepts, guides, and API reference, visit [https://quiltt.dev](https://quiltt.dev).

## Repository Structure

This monorepo is organized as follows:

```bash
.
├── packages/         # Core packages that are published to npm
│   ├── core/         # Core functionality and utilities
│   ├── react/        # React components and hooks
│   └── react-native/ # React Native specific implementations
│
└── examples/              # Example applications showcasing usage
    ├── react-nextjs/      # Next.js example with TypeScript
    └── react-native-expo/ # React Native with Expo example
```

Each package includes detailed setup instructions and examples. See the individual package READMEs below for specific implementation details.

## Packages

### [@quiltt/core](packages/core#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Fcore.svg)](https://badge.fury.io/js/%40quiltt%2Fcore)

The Core package provides essential functionality for building Javascript-based applications with Quiltt. It includes:

- Auth API client
- JSON Web Token (JWT) management
- Observable pattern implementation
- Storage utilities (Local and Memory)
- Timeout handling
- GraphQL client with customizable links
- REST API utilities
- TypeScript type definitions

### [@quiltt/react](packages/react#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Freact.svg)](https://badge.fury.io/js/%40quiltt%2Freact)

The React package provides React Components and Hooks for integrating Quiltt into React-based applications:

- Ready-to-use components: `QuilttButton`, `QuilttContainer`
- Context providers: `QuilttAuthProvider`, `QuilttSettingsProvider` and a consolidated `QuilttProvider`
- Custom hooks: `useQuilttClient`, `useQuilttConnector`, `useQuilttSession`
- Utility hooks: `useEventListener`, `useScript`, `useStorage`

### [@quiltt/react-native](packages/react-native#readme)

[![npm version](https://badge.fury.io/js/%40quiltt%2Freact-native.svg)](https://badge.fury.io/js/%40quiltt%2Freact-native)

The React Native package provides React Native Components for integrating Quiltt Connector into React Native and Expo applications:

- Native-specific components: `QuilttConnector`,

## Development

This project uses [pnpm](https://pnpm.io/) as its package manager and [Turborepo](https://turbo.build/) for build orchestration.

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development servers
pnpm dev
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. Tests can be run from the root folder for all packages or selectively for specific packages or files.

```bash
# Run all tests with coverage report
pnpm run test:coverage

# Run all tests without coverage
pnpm test

# Run tests for a specific package
pnpm test --filter=@quiltt/core

# Run a specific test file
pnpm vitest run packages/core/tests/JsonWebToken.test.ts

# Run tests in watch mode during development
pnpm vitest watch

# Run Cypress tests for Next.js example
pnpm run test:cypress
```

Test configuration is defined in the root `vitest.config.ts` file, which sets up common test environments and coverage reporting for all packages. Each package can also have its own specific test configuration.

## Examples

This repository includes several example applications to help you get started:

- **Next.js example**: A web application built with Next.js and TypeScript
- **React Native example**: A mobile application built with React Native and Expo

Check the [examples](examples) directory for more details.

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
