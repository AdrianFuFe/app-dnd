# app-dnd

`app-dnd` is a SvelteKit + Supabase project for managing D&D characters and related game content.

## Stack

- SvelteKit
- TypeScript
- pnpm
- Tailwind CSS
- Supabase
- Vitest
- Playwright

## Local Development

1. Install dependencies with `pnpm install`
2. Copy `.env.example` to `.env`
3. Fill in `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` from the dedicated `dev` Supabase project
4. Run `pnpm dev`

Use a separate Supabase project for local development. Do not point local `.env` values at production.

## Environment Model

The repo currently recognizes three practical runtime modes:

- local development: real app code against the `dev` Supabase project
- Playwright E2E: `APP_E2E=true`, which swaps Supabase access for the in-memory mock harness
- production: real app code against the `prod` Supabase project

The required environment variables are:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for server-only admin or maintenance paths
- `APP_E2E` for automated end-to-end tests only

More detail lives in [docs/09-environment-setup.md](/G:/dev/projects/app-dnd/docs/09-environment-setup.md).

## Scripts

- `pnpm dev`: start the local dev server
- `pnpm build`: create a production build
- `pnpm preview`: preview the production build locally
- `pnpm check`: run Svelte and TypeScript checks
- `pnpm lint`: run Prettier and ESLint
- `pnpm test:unit`: run Vitest
- `pnpm test:e2e`: run Playwright against the in-memory E2E harness
- `pnpm validate:content`: validate structured content inputs
- `pnpm generate:content-seed-sql`: generate SQL seed output from content sources

## Supabase Notes

- Browser and request-scoped app access use the public Supabase URL and anon key
- The service-role key is intentionally optional in today’s runtime because the current MVP flow does not require admin-only server actions on every request
- Production secrets should be configured in the deployment platform, not committed to the repo
