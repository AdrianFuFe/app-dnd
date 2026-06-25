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
- Playwright E2E: `APP_E2E=true`, which swaps Supabase access for the in-memory mock harness and injects a fixed authenticated session
- production: real app code against the `prod` Supabase project

The required environment variables are:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for server-only admin or maintenance paths
- `ADMIN_ALLOWLIST_EMAILS` for explicit admin elevation through local operator tooling
- `APP_E2E` for automated end-to-end tests only

More detail lives in [docs/09-environment-setup.md](/G:/dev/projects/app-dnd/docs/09-environment-setup.md).

## Runtime Integration Check

Today, these paths are real:

- normal local development and production auth use real Supabase Auth
- character and catalog reads/writes use the live Supabase database when `APP_E2E` is not `true`
- profile sync writes a real `profiles` row on authenticated runtime requests

These paths are mocked:

- Playwright E2E uses an in-memory catalog, character store, and fixed session
- `POST /api/test/reset` only exists in `APP_E2E=true` mode and resets the mock state

To run the app against a live Supabase project without guessing:

1. Copy `.env.example` to `.env`.
2. Set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` from your `dev` Supabase project.
3. Apply the SQL files in [supabase/sql/README.md](/G:/dev/projects/app-dnd/supabase/sql/README.md).
4. Seed the SRD catalog SQL if you changed the source JSON with `pnpm generate:content-seed-sql`.
5. Start the app with `pnpm dev`.
6. Register a user through `/auth/register` or sign in through `/auth/login`.

`pnpm test:e2e` is not a live Supabase smoke test. It validates the app flow against the mock harness only.

The full verification notes live in [docs/10-runtime-integration-check.md](/G:/dev/projects/app-dnd/docs/10-runtime-integration-check.md).

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
- `pnpm create:test-user -- --email tester@example.com --password secret123`: create a normal test user through the service-role admin API
- `pnpm manage:user-role -- --email lead@example.com --role admin`: update a user's global role, with admin grants restricted by `ADMIN_ALLOWLIST_EMAILS`

For admin and permission-level testing, see [docs/11-admin-and-test-user-workflow.md](/G:/dev/projects/app-dnd/docs/11-admin-and-test-user-workflow.md).

## Supabase Notes

- Browser and request-scoped app access use the public Supabase URL and anon key
- The service-role key is intentionally optional in today’s runtime because the current MVP flow does not require admin-only server actions on every request
- Production secrets should be configured in the deployment platform, not committed to the repo
