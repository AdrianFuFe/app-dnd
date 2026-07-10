# Live Smoke Run Log

## Goal

Capture the first real Supabase smoke-test pass in one repeatable format so future deploy-readiness sessions can compare environments and outcomes quickly.

## Run Metadata

- date: `2026-07-10`
- operator: local manual test
- app commit or branch: local workspace with uncommitted changes
- Supabase project: `RolApp-dev`
- environment type: `dev`
- hosting target: not selected yet
- runtime mode confirmed: `live-supabase`

## Configuration Check

- `PUBLIC_SUPABASE_URL` set: yes
- `PUBLIC_SUPABASE_ANON_KEY` set: yes
- `APP_E2E` unset or `false`: yes
- SQL bootstrap applied through `005_character_notes.sql`: yes, with `005` already effectively covered by prior schema/policy application
- SRD seed SQL regenerated before bootstrap when needed: no

## Manual Smoke Results

### Auth

- register: ok
- login: ok after local cookie/session persistence fix for `http://localhost`
- redirect into `/app`: ok
- logout: ok

### Protected App Shell

- `/app` loads with session: ok
- refresh preserves session: implicitly ok after successful login redirect and protected app access
- signed-in identity visible: ok

### Character CRUD

- list: ok
- create: ok
- detail: ok
- edit: ok
- delete: ok

### Content

- shared catalog loads: ok
- private content loads: ok
- private content create/edit/delete: create path ok; visible edit/delete controls for private content do not appear to exist in the current product surface
- shared feat workflow checked: not checked yet in live mode
- shared spell workflow checked: not checked yet in live mode

## Deployment Readiness Outcome

- chosen host: not selected yet
- `adapter-auto` confirmed compatible: no
- host-specific adapter required: unknown until host is selected
- production env vars provisioned: no
- blockers: hosting target still undecided; live smoke still needs trusted-role shared feat/spell workflow checks in a real environment, and private content lifecycle scope should be clarified if edit/delete is expected

## Notes

- unexpected behavior: login initially appeared to succeed but `/app` redirected back to `/auth/login?redirectTo=%2Fapp` because localhost cookie/session persistence was not correctly configured for the server Supabase client
- follow-up fixes: updated server Supabase cookie handling to avoid `secure` cookies on `http://localhost` and enabled request-side session persistence for the server client
- final outcome: partial
