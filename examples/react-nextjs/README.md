# Quiltt Next.js Example

This app demonstrates `@quiltt/react` in a Next.js environment and includes Playwright coverage for connector launch flows.

## Getting Started

From the repository root:

```bash
cd examples/react-nextjs
pnpm install
pnpm run dev
```

Open <http://localhost:3000>.

## Project Scripts

```bash
pnpm run dev
pnpm run build
pnpm run start
pnpm run lint
pnpm run typecheck
```

## Playwright Tests

```bash
pnpm run playwright:install
pnpm run test:e2e
```

Use `pnpm run test:component` for component test projects and `pnpm run test` to run all configured Playwright projects.

## Related Docs

- [Main Repository README](../../README.md)
- [@quiltt/react Documentation](../../packages/react#readme)
- [Quiltt Developer Docs](https://quiltt.dev)
