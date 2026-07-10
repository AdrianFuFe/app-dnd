# Live Smoke Test And Deploy Readiness

## Goal

Provide one operational checklist for validating the MVP against a real Supabase project and for preparing the first hosted internal test build.

## Preflight

Before treating the app as live-integrated, confirm all of the following:

1. `.env` exists locally and is based on `.env.example`.
2. `PUBLIC_SUPABASE_URL` points at the intended `dev` or hosted test project.
3. `PUBLIC_SUPABASE_ANON_KEY` is set for that same project.
4. `APP_E2E` is unset or `false`.
5. The SQL files in `supabase/sql/README.md` were applied in the documented order.
6. If SRD JSON changed, `pnpm generate:content-seed-sql` was run before applying `004_srd_catalog_seed.sql`.

Optional only when using local operator tooling:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ALLOWLIST_EMAILS`

## Live Smoke Checklist

Run these checks against a real Supabase project, not `APP_E2E=true`.

### Auth

1. Start the app with `pnpm dev`.
2. Open `/`.
3. Confirm the landing page does not show a live-runtime misconfiguration warning.
4. Register through `/auth/register`, or sign in through `/auth/login` with an existing account.
5. Confirm successful auth redirects into `/app`.

### Protected App Shell

1. Refresh `/app`.
2. Confirm the session persists.
3. Confirm the signed-in identity is shown in the app shell.
4. Confirm logout returns the browser to a signed-out state.

### Character CRUD

1. Open `/app/characters`.
2. Create a character with valid species, subspecies, class, and subclass values.
3. Confirm the new character appears in the list after redirect.
4. Open the character detail page and confirm the saved values render correctly.
5. Edit the character and confirm updates persist after refresh.
6. Delete the character and confirm it is removed from the list.

### Content Area

1. Open `/app/content`.
2. Confirm shared SRD-backed catalog sections load without server errors.
3. Confirm private user-scoped sections load for the signed-in account.
4. Create at least one private content entry that the current role is allowed to create.
5. Edit that entry and confirm the changes persist after refresh.
6. Delete that entry and confirm it no longer appears.

## Deployment Readiness

Before shipping an internal hosted build:

1. Set production environment variables in the hosting platform instead of copying `.env`.
2. Point hosted variables at the separate non-local Supabase project intended for that environment.
3. Confirm `APP_E2E` is unset or `false` in the host.
4. Apply the SQL bootstrap to the hosted Supabase project before exposing `/app`.
5. Run `pnpm check` and `pnpm build` from the repository state being deployed.
6. Confirm the selected host is supported by `@sveltejs/adapter-auto`, or replace it with a host-specific SvelteKit adapter before deployment.

## Current Limitation

This repository can document the live smoke path, but the actual pass result still depends on access to a real Supabase project and the chosen hosting environment. Record the date, target project, and outcome when the manual smoke pass is executed.
