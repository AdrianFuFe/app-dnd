# Basic Supabase And Hosting Setup Guide

## Goal

Guide a first-time operator through the minimum correct setup for this project without mixing development, tests, and future production decisions.

This guide is intentionally basic and sequential. Follow one phase at a time. Do not skip ahead to hosting until the local `dev` environment works.

## Technical Decisions For This Project

These decisions come from the current repository configuration:

- the app is a `SvelteKit + Supabase` project
- normal local development uses a real Supabase backend
- automated E2E tests do **not** use your Supabase project; they use the internal mock harness with `APP_E2E=true`
- the repository expects separate Supabase environments for `dev` and `prod`
- the current repo uses `@sveltejs/adapter-auto`, so hosting should be chosen deliberately and validated later

## What You Need To Create

### Required Now

1. A Supabase project for `dev`
2. A local `.env` file in this repo
3. The SQL bootstrap applied to the `dev` Supabase project

### Required Later

1. A second Supabase project for `prod`
2. A hosting platform account and one chosen hosting target
3. Hosted environment variables configured in that platform

### Not Required Right Now

1. Supabase GitHub integration
2. Supabase Vercel integration
3. Supabase Data API integration
4. A production Supabase project before local `dev` is working

## Recommendation About Supabase Integrations

If Supabase offers these options in the dashboard:

- connect with GitHub
- install integration with Vercel

Do **not** enable them yet.

Why:

- this project does not need those integrations to run locally
- they add moving parts before the base app is verified
- the repo does not yet declare a fixed hosting target or host-specific adapter

Recommended timing:

1. finish local `dev` setup first
2. complete the live smoke test locally
3. choose the hosting target
4. only then decide whether any Supabase integration is useful

## Recommendation About Environments

### Should `dev` and `prod` be separate?

Yes. For this repository, the correct setup is:

- one Supabase project for `dev`
- one separate Supabase project for `prod`

Even if Supabase allows different workflows inside one project, this repo is documented around separate projects. That separation is safer for:

- auth users
- test data
- schema changes
- content imports
- operator scripts

### Minimum Safe Setup

If you want the simplest correct path:

1. create and use `RolApp-dev` now
2. do **not** create `prod` yet
3. create the `prod` project only after `dev` works and the smoke test passes

## Services And Accounts You Should Have

### Required

1. Supabase account
2. Supabase project `RolApp-dev`
3. Local Node/pnpm environment already working for this repo

### Recommended Later

1. GitHub repository for the project
2. Hosting account
   Recommended easiest candidate: `Vercel`

## Phase Plan

Use these phases in order.

### Phase 1 - Local Dev Backend Setup

Objective:

- connect the repo to `RolApp-dev`

You will do:

1. get `Project URL`
2. get `anon public key`
3. create `.env`

### Phase 2 - Database Bootstrap

Objective:

- create the tables, seeds, and policies the app needs

You will do:

1. open Supabase SQL Editor
2. run the SQL files in repo order

### Phase 3 - Local Live Smoke Test

Objective:

- prove the app works against real Supabase in local development

You will do:

1. start `pnpm dev`
2. register a user
3. open `/app`
4. test character CRUD
5. test `/app/content`

### Phase 4 - Optional Role/Admin Setup

Objective:

- test `content_editor` or `admin` flows

You will do:

1. add `SUPABASE_SERVICE_ROLE_KEY`
2. add `ADMIN_ALLOWLIST_EMAILS`
3. use the repo scripts when needed

### Phase 5 - Production Planning

Objective:

- choose how the app will be deployed later

You will do:

1. choose a host
2. decide whether `adapter-auto` is enough
3. create a separate Supabase `prod` project

## Phase 1 Checklist

Do only this phase first.

### Step 1

Open `RolApp-dev` in Supabase.

### Step 2

Go to the area where Supabase shows:

- `Project URL`
- `anon` key

Depending on the current dashboard UI, this is usually under `Configuration -> API Keys`.

### Step 3

Copy those values somewhere temporary.

You need:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

### Step 4

Create `.env` in the repository root using `.env.example` as the template.

The minimum contents should be:

```env
PUBLIC_SUPABASE_URL=your_project_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
APP_E2E=false
```

Do not fill these yet unless you are specifically told to use them later:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ALLOWLIST_EMAILS`

### Phase 1 Stop Condition

Stop here when:

- `.env` exists
- `PUBLIC_SUPABASE_URL` is filled
- `PUBLIC_SUPABASE_ANON_KEY` is filled
- `APP_E2E=false`

Do not move to hosting yet.

## Phase 2 Checklist

After Phase 1 is complete:

1. open [supabase/sql/README.md](/G:/dev/projects/app-dnd/supabase/sql/README.md:1)
2. run each SQL file in this exact order:
    - [001_initial_schema.sql](/G:/dev/projects/app-dnd/supabase/sql/001_initial_schema.sql:1)
    - [003_content_sources_seed.sql](/G:/dev/projects/app-dnd/supabase/sql/003_content_sources_seed.sql:1)
    - [004_srd_catalog_seed.sql](/G:/dev/projects/app-dnd/supabase/sql/004_srd_catalog_seed.sql:1)
    - [002_initial_rls_policies.sql](/G:/dev/projects/app-dnd/supabase/sql/002_initial_rls_policies.sql:1)
    - [005_character_notes.sql](/G:/dev/projects/app-dnd/supabase/sql/005_character_notes.sql:1)

### Phase 2 Stop Condition

Stop when all SQL files have executed successfully in `RolApp-dev`.

## Phase 3 Checklist

After Phase 2 is complete:

1. run `pnpm dev`
2. open the app in the browser
3. register a fresh user
4. verify `/app`
5. verify character create/edit/delete
6. verify `/app/content`

Use these documents during that phase:

- [docs/12-live-smoke-test-and-deploy-readiness.md](/G:/dev/projects/app-dnd/docs/12-live-smoke-test-and-deploy-readiness.md:1)
- [docs/13-live-smoke-run-log.md](/G:/dev/projects/app-dnd/docs/13-live-smoke-run-log.md:1)

## Hosting Recommendation

Do not choose hosting until the local smoke test passes.

When you are ready to choose:

- easiest likely first choice: `Vercel`
- still verify compatibility with `@sveltejs/adapter-auto`
- if compatibility is unclear, the repo should switch to a host-specific adapter later

## What To Do Next In A Separate Session

If you open a fresh Codex session, use this prompt:

`Use docs/14-basic-supabase-and-hosting-setup-guide.md and guide me through Phase 1 only. Do not jump ahead.`
