# Session Task Plan

## Goal

Split development into small sessions with bounded context, clear closure criteria, and explicit handoff points.

## How To Use This File

- start one session per task block
- load only the context slices listed for that block
- stop the session when the closure criterion is met
- if the next step belongs to another concern, start a new session

## Session Boundary Rule

Start a new session when any of these happens:

- the current task is complete
- the next step touches a different subsystem
- more than 3 to 5 files outside the current slice need inspection
- the conversation already mixed implementation, review, docs, and planning
- the next step would require re-explaining too much prior context

## Clear Stop Signal

When a block is finished, the closing message should explicitly say:

`BLOCK COMPLETE: start a new session for the next task.`

It should also explicitly name the next recommended block, for example:

`Next recommended block: S2 - Logout Flow`

If the next task is still very close to the current one, the closing message may say:

`BLOCK COMPLETE: you may continue here, but a new session is recommended.`

In that case, it should still name the next recommended block.

## Session Blocks

### S1 - Auth Guard For `/app`

- objective: create protected layout behavior for authenticated app routes
- read context:
  - `docs/context/20_ARCHITECTURE_AND_STACK.md`
  - `docs/context/40_AUTH_AND_DATA.md`
  - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
  - `src/routes/+layout.server.ts`
  - `src/hooks.server.ts`
  - `src/routes/app/...`
- minimum validation:
  - `pnpm check`
  - targeted tests if added
- closure criterion:
  - unauthenticated users are redirected away from `/app`
  - authenticated users can enter `/app`

### S2 - Logout Flow

- objective: add logout action and basic authenticated navigation
- read context:
  - `docs/context/20_ARCHITECTURE_AND_STACK.md`
  - `docs/context/40_AUTH_AND_DATA.md`
  - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
  - `src/routes/app/...`
  - auth/session-related layout components
- minimum validation:
  - `pnpm check`
  - `pnpm lint` if Svelte markup changes
- closure criterion:
  - logged-in user can sign out cleanly
  - session-aware UI reflects logout state

### S3 - Profile Sync

- objective: create or sync `profiles` row for authenticated users
- read context:
  - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
  - `docs/context/40_AUTH_AND_DATA.md`
  - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
  - `supabase/sql/...`
  - `src/lib/server/...`
  - auth-related server code
- minimum validation:
  - `pnpm check`
  - targeted unit tests if logic is extracted
- closure criterion:
  - first authenticated entry ensures a valid profile row

### S4 - Authenticated App Shell

- objective: create the minimal `/app` landing shell after login
- read context:
  - `docs/context/10_PRODUCT_SCOPE.md`
  - `docs/context/20_ARCHITECTURE_AND_STACK.md`
  - `docs/context/40_AUTH_AND_DATA.md`
- likely files:
  - `src/routes/app/+page.svelte`
  - `src/routes/+page.svelte`
  - related layout files
- minimum validation:
  - `pnpm check`
  - `pnpm lint`
- closure criterion:
  - authenticated users land in `/app`
  - public and private entry flows are separated clearly

### S5 - Character Schema Slice

- objective: add initial schemas/types for character creation fields
- read context:
  - `docs/context/10_PRODUCT_SCOPE.md`
  - `docs/context/20_ARCHITECTURE_AND_STACK.md`
  - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
- likely files:
  - `src/lib/schemas/characters/...`
  - `src/lib/types/...`
  - `src/lib/domain/characters/...`
- minimum validation:
  - targeted unit tests
  - `pnpm check`
- closure criterion:
  - initial character input model is typed and validated

### S6 - Character SQL Slice

- objective: align character persistence tables with the first editable character slice
- read context:
  - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
  - `docs/context/40_AUTH_AND_DATA.md`
  - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
  - `supabase/sql/001_initial_schema.sql`
  - `supabase/sql/002_initial_rls_policies.sql`
- minimum validation:
  - SQL review
  - `pnpm check` only if app types are updated
- closure criterion:
  - SQL model supports the next character UI slice without contradicting ownership rules

### S7 - Character Creation UI

- objective: build the first bounded character creation flow
- read context:
  - `docs/context/10_PRODUCT_SCOPE.md`
  - `docs/context/20_ARCHITECTURE_AND_STACK.md`
  - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
- likely files:
  - `src/routes/app/characters/new/...`
  - `src/lib/components/forms/...`
  - supporting schemas/services
- minimum validation:
  - `pnpm check`
  - `pnpm lint`
  - targeted tests as needed
- closure criterion:
  - user can create a first character with MVP fields

### S8 - Content Catalog Wiring

- objective: connect existing catalog content to character forms where useful
- read context:
  - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
  - `docs/context/40_AUTH_AND_DATA.md`
  - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
  - character routes
  - content services/repositories
  - relevant SQL or query helpers
- minimum validation:
  - `pnpm check`
  - targeted tests
- closure criterion:
  - at least one character flow consumes structured catalog data

## Notes

- this plan is intentionally session-oriented, not milestone-oriented
- each block should fit comfortably in one focused chat
- if a block grows during implementation, split it rather than stretching the session
