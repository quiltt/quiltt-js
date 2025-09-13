# @quiltt/core

[![npm version](https://badge.fury.io/js/@quiltt%2Fcore.svg)](https://badge.fury.io/js/@quiltt%2Fcore)
[![CI](https://github.com/quiltt/quiltt-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/quiltt/quiltt-js/actions/workflows/ci.yml)

`@quiltt/core` provides essential functionality for building Javascript-based applications with Quiltt. It provides an Auth API client and modules for handling JSON Web Tokens (JWT), observables, storage management, timeouts, API handling, and Typescript types.

## Install

With `npm`:

```shell
$ npm install @quiltt/core
```

With `yarn`:

```shell
$ yarn add @quiltt/core
```

With `pnpm`:

```shell
$ pnpm add @quiltt/core
```

## Auth API Client

```ts
// Import Auth API client
import { AuthAPI } from '@quiltt/core'

// Set up client instance
const auth = new AuthAPI()

// Check if a Session token is valid
auth.ping('{SESSION_TOKEN}')

// Revoke a Session token
auth.revoke('{SESSION_TOKEN}')
```

## Modules

### JsonWebToken

The `JsonWebToken` module provides functionality related to JSON Web Tokens (JWT). It includes methods for generating, signing, and verifying JWTs. With this module, you can easily handle authentication and secure communication in your applications.

### Observable

The `Observable` module implements the Observable pattern, allowing you to create and manage observable streams of data. It provides a powerful toolset for working with asynchronous events and data streams, enabling you to build reactive and event-driven applications.

### Storage

The `Storage` module offers convenient wrappers and abstractions for working with different types of storage, such as local storage or session storage. It simplifies the process of storing and retrieving data in a secure and efficient manner.

### Timeoutable

The `Timeoutable` module provides utilities for handling timeouts and delays in your application. It allows you to schedule and manage timeouts, ensuring precise control over time-sensitive operations.

### API

The `api` module contains components and functions related to handling APIs. It offers a set of tools for making API requests, managing GraphQL subscriptions, and interacting with remote services.

### Types

The `types` module provides a collection of TypeScript type definitions and interfaces that are used throughout the `@quiltt/core` library. These types ensure type safety and provide a solid foundation for building robust applications.

## Usage

```javascript
import { JsonWebToken, Observable, Storage, Timeoutable, api, types } from '@quiltt/core'

// Example usage of the library modules
// ...
```

## Typescript support

`@quiltt/core` is written in Typescript and ships with its own type definitions.

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE.md) file for more information.

## Contributing

For information on how to contribute to this project, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.
