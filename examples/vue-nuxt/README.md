# Quiltt Nuxt Example

This Nuxt app demonstrates how to integrate `@quiltt/vue` and provides Playwright e2e coverage for Vue SDK behavior.

## Getting Started

From the repository root:

```bash
cd examples/vue-nuxt
pnpm install
pnpm run dev
```

Open <http://localhost:3301>.

## Environment

The app reads these public runtime values from environment variables (with local defaults in `nuxt.config.ts`):

- `NUXT_PUBLIC_QUILTT_CLIENT_ID`
- `NUXT_PUBLIC_QUILTT_AUTH_TOKEN`
- `NUXT_PUBLIC_CONNECTOR_ID`
- `NUXT_PUBLIC_INSTITUTION_SEARCH_TERM`

Set real values in a `.env` file in this directory when testing against a real Quiltt environment.

## E2E Tests

```bash
pnpm run playwright:install
pnpm run test:e2e
```

This runs the Playwright project configured in `playwright.config.ts` and starts Nuxt on port `3301`.

## Related Docs

- [Main Repository README](../../README.md)
- [@quiltt/vue Documentation](../../packages/vue#readme)
- [Quiltt Developer Docs](https://quiltt.dev)
