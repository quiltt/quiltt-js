# Quiltt Next.js Example

This Next.js app demonstrates how to integrate `@quiltt/react` and provides Playwright e2e coverage for React SDK behavior.

## Getting Started

From the repository root:

```bash
cd examples/react-nextjs
pnpm install
pnpm run dev
```

Open <http://localhost:3000>.

## Environment

The app reads these public runtime values from environment variables (with local defaults in `src/app/quiltt-provider.tsx` and `src/app/_components/quiltt-config.ts`):

- `NEXT_PUBLIC_QUILTT_CLIENT_ID`
- `NEXT_PUBLIC_QUILTT_AUTH_TOKEN`
- `NEXT_PUBLIC_CONNECTOR_ID`
- `NEXT_PUBLIC_CONTAINER_CONNECTOR_ID`
- `NEXT_PUBLIC_INSTITUTION_SEARCH_TERM`

Set real values in a `.env` file in this directory when testing against a real Quiltt environment.

## E2E Tests

```bash
pnpm run playwright:install
pnpm run test:e2e
```

This runs the Playwright project configured in `playwright.config.ts` and starts Next.js on port `3000`.

## Related Docs

- [Main Repository README](../../README.md)
- [@quiltt/react Documentation](../../packages/react#readme)
- [Quiltt Developer Docs](https://quiltt.dev)
