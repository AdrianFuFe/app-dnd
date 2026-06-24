# Auth And Data

## Auth Direction

The project should use Supabase Auth, not custom-built authentication.

## Reasons

- direct fit with Supabase database and RLS
- lower security and maintenance risk
- already partially implemented in the repo

## Current Technical State

- request session is loaded in `src/hooks.server.ts`
- auth forms exist under `src/routes/auth`
- Supabase client utilities exist under `src/lib/server/supabase`
- SQL policies already assume authenticated users

## Data Ownership Rule

- Supabase auth user id is the canonical user identity
- ownership columns should relate to that identity
- user-visible data access must be enforced by RLS

## Immediate Next Auth Steps

- protect `/app`
- add logout
- create/sync profile row
- move authenticated entry flow into `/app`
