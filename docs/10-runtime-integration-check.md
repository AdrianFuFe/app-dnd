# Runtime Integration Check

## Goal

Make it explicit which parts of the app use live Supabase today, which parts are mocked for automated tests, and what a developer must do before treating the app as live-integrated.

## Runtime Modes

### Live Supabase mode

This is the default runtime when `APP_E2E` is not `true`.

Real integrations in this mode:

- `src/hooks.server.ts` creates a request-scoped Supabase client from `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`
- `/auth/login` and `/auth/register` call real Supabase Auth methods
- profile sync writes to the real `profiles` table
- character and catalog repositories query and mutate the real Supabase tables

Requirements:

- `PUBLIC_SUPABASE_URL` must be set
- `PUBLIC_SUPABASE_ANON_KEY` must be set
- the SQL bootstrap from `supabase/sql/README.md` must already be applied to the target project

Important limitation:

- if the SQL files have not been applied, auth may still work while app data flows fail because the tables and RLS policies are missing

### E2E mock mode

This mode is enabled only when `APP_E2E=true`.

Mocked integrations in this mode:

- auth is bypassed by injecting a fixed authenticated session in `src/hooks.server.ts`
- Supabase reads and writes used by the current character flow are replaced by the in-memory mock harness in `src/lib/server/e2e/mock-app.ts`
- `/api/test/reset` resets only the mock state

Important limitation:

- this mode does not verify real Supabase Auth, real database access, or SQL bootstrap correctness

## Live Bootstrap Checklist

To run the app against a real Supabase project:

1. Copy `.env.example` to `.env`.
2. Fill in `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` from the `dev` Supabase project.
3. Apply the SQL files in the order listed by `supabase/sql/README.md`.
4. If you changed the SRD JSON sources, regenerate the seed SQL with `pnpm generate:content-seed-sql`.
5. Start the app with `pnpm dev`.
6. Register or log in through the auth routes.
7. Verify `/app`, character list, create, edit, and delete against the live project.

## What Is Testable Today

Covered without live Supabase:

- unit-tested domain logic and repository mapping behavior
- Playwright app-shell and character-flow coverage in mock mode

Requires a real Supabase project:

- sign-up and sign-in against Supabase Auth
- profile row sync in the real database
- RLS-backed character and catalog access
- confirmation that the SQL schema and seed files were applied correctly
