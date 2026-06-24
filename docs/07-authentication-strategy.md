# Authentication Strategy

## Recommendation

Use `Supabase Auth` as the primary authentication system for the MVP and near-term roadmap.

Do not build custom authentication from scratch.

## Why Supabase Auth Fits This Project

- the project already uses Supabase as the data layer
- RLS depends naturally on Supabase authenticated users
- the app needs ownership-aware data access more than custom auth logic
- email/password auth is already partially wired in the current codebase
- it reduces security risk, implementation time, and maintenance cost

## Current Project State

The codebase already points to a Supabase-centered auth architecture:

- request-scoped Supabase client in `src/hooks.server.ts`
- auth forms and server actions under `src/routes/auth`
- RLS SQL policies designed around authenticated users
- `profiles` and ownership-based content models in SQL

This means the planned direction is already delegated auth, not self-managed auth.

## Recommended MVP Scope

- email + password registration
- login
- logout
- protected `/app` layout
- session-aware redirects
- `profiles` row creation on first confirmed user access

## What Not To Build Now

- custom password hashing
- local user table as source of truth for credentials
- homemade refresh-token system
- custom email verification flow
- OAuth providers unless they become a real product need

## Free-Tier Evaluation

For this project, Supabase free tier is a better tradeoff than self-hosted or fully custom auth because:

- setup is fast
- operational complexity is low
- auth integrates with Postgres policies directly
- it avoids spending project time on security-sensitive plumbing

## Recommended Data Ownership Model

- Supabase Auth user id is the root identity
- `profiles.id` should map to `auth.users.id`
- user-owned rows should use that id for ownership checks
- RLS should continue to be the enforcement layer

## Near-Term Implementation Plan

1. keep Supabase Auth as the credential provider
2. add protected `/app` layout and redirect unauthenticated users
3. add logout flow
4. create or sync `profiles` on authenticated entry
5. move post-login user experience from `/` to `/app`

## Decision

Authentication should be delegated to Supabase Auth.

Custom authentication should be avoided unless a future requirement appears that Supabase Auth cannot cover.
