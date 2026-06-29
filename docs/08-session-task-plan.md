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

## Current Status

- completed foundations already reflected in the repo:
    - `S1 - Auth Guard For /app`
    - `S2 - Logout Flow`
    - `S3 - Profile Sync`
    - `S4 - Authenticated App Shell`
    - `S5 - Character Schema Slice`
    - `S6 - Character SQL Slice`
    - `S7 - Character Creation UI`
    - `S8 - Content Catalog Wiring` for `species` and `class`
    - `S9 - Environment Setup`
    - `S11 - Character Create/Edit E2E`
- effectively completed beyond the original status notes:
    - expanded catalog wiring now also covers `backgrounds`, `subspecies`, and `subclasses`
    - `inventory` already has a structured workflow with child-table persistence
- implemented but still intentionally shallow:
    - real character CRUD exists
    - spell workflows are still free-text
    - permissions exist mainly as schema and RLS foundation, not as a full admin feature set
- current project point:
  - the MVP app shell and first character workflow are working
  - structured character sections now cover `inventory`, `attacks`, and `spells`
  - the repo is ahead of this plan document in character-flow work, and environment separation is now documented
- next recommended block:
  - `S15 - Expanded Spell And Ability Catalogs`
  - this is the intended continuation after `S9 - Environment Setup`

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

### S9 - Environment Setup

- objective: separate day-to-day development from production so the app can evolve safely
- read context:
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `.env.example`
    - `README.md`
    - `src/lib/server/supabase/...`
    - deployment or environment docs if added
- minimum validation:
    - `pnpm check` if runtime code changes
    - docs review
- closure criterion:
    - the project defines separate `dev` and `prod` Supabase/app environments
    - required environment variables are documented clearly
    - local development and production expectations are not ambiguous

### S10 - Runtime Integration Check

- objective: verify which services are real, which are mocked, and what is required to run the app against live Supabase
- read context:
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `src/hooks.server.ts`
    - `src/lib/server/supabase/...`
    - `src/lib/server/e2e/...`
    - `README.md`
    - `supabase/sql/...`
- minimum validation:
    - `pnpm check` if runtime code changes
    - targeted tests if setup helpers change
- closure criterion:
    - it is clear how to run the app in mock mode vs live Supabase mode
    - missing integration steps are documented or removed
    - a developer can tell what is testable today without guessing

### S11 - Character Create/Edit E2E

- objective: cover the first end-to-end character create and edit workflows
- read context:
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `tests/characters.e2e.ts`
    - `src/lib/server/e2e/...`
    - character routes involved in form submission
- minimum validation:
    - `pnpm test:e2e`
- closure criterion:
    - character create and edit flows are covered by E2E tests

### S12 - Role Enforcement Foundations

- objective: turn the current role model into explicit application behavior and enforcement rules
- read context:
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `supabase/sql/001_initial_schema.sql`
    - `supabase/sql/002_initial_rls_policies.sql`
    - `src/lib/types/permissions/...`
    - server permission helpers if added
- minimum validation:
    - SQL review
    - `pnpm check` if app code changes
    - targeted tests if permission helpers are added
- closure criterion:
    - `user`, `content_editor`, and `admin` responsibilities are explicit
    - the repo defines where admin-only actions are enforced
    - future UI work can rely on stable permission rules

### S13 - Admin And Test User Workflow

- objective: define and implement the safe path for admin assignment and test-user creation
- read context:
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - admin-oriented server routes or scripts
    - Supabase helper utilities
    - docs for operator workflow
- minimum validation:
    - `pnpm check` if runtime code changes
    - targeted tests if admin helpers/scripts are added
- closure criterion:
    - only approved admins can grant admin privileges
    - the project has a documented way to create normal test users
    - the team can test different permission levels safely

### S14 - Expanded Character Catalog Wiring

- objective: extend character create/edit to more structured catalog entities
- read context:
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - character routes
    - `src/lib/components/forms/...`
    - `src/lib/server/repositories/catalog.ts`
    - relevant catalog types and schemas
- minimum validation:
    - `pnpm check`
    - targeted unit tests
    - targeted E2E updates if form behavior changes
- closure criterion:
    - character flows support structured selection for `backgrounds`, `subspecies`, or `subclasses`
    - saved character data uses trusted catalog IDs for the new entities
- current repo note:
    - this block is effectively complete in the current codebase and the plan document had fallen behind implementation

### S15 - Expanded Spell And Ability Catalogs

- objective: enrich the available structured game content beyond the first catalog slice
- read context:
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `data/srd-5-1/...`
    - `src/lib/schemas/content/...`
    - `src/lib/server/import/...`
    - seed SQL files if updated
- minimum validation:
    - targeted schema/import tests
    - content validation scripts if changed
- closure criterion:
    - more catalog entities such as `spells` and ability-related content are validated and available for future UI wiring
- current repo note:
    - the repo already includes initial `spells` and `feats` catalog files plus validation and seed-generation support
    - use this block to continue expanding that catalog surface or to close any remaining gaps before moving on

### S16 - Structured Character Sections

- objective: replace the highest-value free-text character sections with structured child data where it improves usability
- read context:
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - character routes and form components
    - `src/lib/server/repositories/characters.ts`
    - future child-table SQL if needed
- minimum validation:
    - `pnpm check`
    - targeted tests
    - targeted E2E coverage for changed flows
- closure criterion:
    - at least one currently free-text section such as `spells`, `attacks`, or `inventory` has a structured workflow
    - the change improves editing without breaking MVP ownership rules
- current repo note:
  - `inventory`, `attacks`, and `spells` now have structured workflows in the current codebase

## Notes

- this plan is intentionally session-oriented, not milestone-oriented
- each block should fit comfortably in one focused chat
- if a block grows during implementation, split it rather than stretching the session
- recommended implementation order from the current project state:
    - `S15 - Expanded Spell And Ability Catalogs`
    - `S10 - Runtime Integration Check`
    - `S12 - Role Enforcement Foundations`
    - `S13 - Admin And Test User Workflow`
