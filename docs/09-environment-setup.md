# Environment Setup

## Goal

Keep local development, automated tests, and production pointed at intentionally separate environments so changes can ship without cross-contaminating data or credentials.

## Required Environment Split

- `dev`: a dedicated Supabase project for day-to-day development
- `prod`: the production Supabase project used by the deployed app

Do not reuse the production Supabase project for regular local development.

## Environment Variables

These variables are currently used by the app:

- `PUBLIC_SUPABASE_URL`: Supabase project URL for the active environment
- `PUBLIC_SUPABASE_ANON_KEY`: browser-safe anon key for the active environment
- `SUPABASE_SERVICE_ROLE_KEY`: optional for normal runtime today, but required for future server-only admin or maintenance tasks
- `APP_E2E`: turns on the in-memory test harness when set to `true`

## Expected Local Files

For local development:

1. copy `.env.example` to `.env`
2. fill in the `dev` Supabase URL and anon key
3. add the `dev` service-role key only if you are working on server-only tooling that needs it

For deployed production:

1. set the same variable names in the hosting platform
2. point them at the `prod` Supabase project
3. never deploy with `APP_E2E=true`

## Current Runtime Modes

- normal local development: reads `.env` and talks to the `dev` Supabase project
- Playwright E2E: uses `APP_E2E=true`, injects a fixed authenticated session, and runs against the in-memory mock app instead of Supabase
- production: reads host-provided variables and talks to the `prod` Supabase project

## Notes

- Missing `PUBLIC_SUPABASE_URL` or `PUBLIC_SUPABASE_ANON_KEY` prevents real Supabase access
- `APP_E2E` is only for automated tests and should not be used as a local development shortcut
- This block documents environment separation only; the runtime verification details now live in `docs/10-runtime-integration-check.md`
