# Live Smoke Run Log

## Goal

Capture the first real Supabase smoke-test pass in one repeatable format so future deploy-readiness sessions can compare environments and outcomes quickly.

## Run Metadata

- date:
- operator:
- app commit or branch:
- Supabase project:
- environment type: `dev` / `hosted-test` / `prod-like`
- hosting target:
- runtime mode confirmed: `live-supabase`

## Configuration Check

- `PUBLIC_SUPABASE_URL` set: yes / no
- `PUBLIC_SUPABASE_ANON_KEY` set: yes / no
- `APP_E2E` unset or `false`: yes / no
- SQL bootstrap applied through `005_character_notes.sql`: yes / no
- SRD seed SQL regenerated before bootstrap when needed: yes / no

## Manual Smoke Results

### Auth

- register:
- login:
- redirect into `/app`:
- logout:

### Protected App Shell

- `/app` loads with session:
- refresh preserves session:
- signed-in identity visible:

### Character CRUD

- list:
- create:
- detail:
- edit:
- delete:

### Content

- shared catalog loads:
- private content loads:
- private content create/edit/delete:
- shared feat workflow checked:
- shared spell workflow checked:

## Deployment Readiness Outcome

- chosen host:
- `adapter-auto` confirmed compatible: yes / no
- host-specific adapter required: yes / no
- production env vars provisioned: yes / no
- blockers:

## Notes

- unexpected behavior:
- follow-up fixes:
- final outcome: pass / partial / blocked
