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

- verified on 2026-07-08:
    - `pnpm check` passes
    - `pnpm test:unit run` passes with targeted green coverage for content permissions and derivation
    - `pnpm validate:content` passes with 14 JSON files validated and 0 issues
    - `pnpm test:e2e -- tests/characters.e2e.ts` was last confirmed green on 2026-07-07 with 4 tests
- completed foundations reflected in the repo:
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
    - `S12 - Role Enforcement Foundations`
    - `S13 - Admin And Test User Workflow`
    - `S14 - Expanded Character Catalog Wiring`
    - `S15 - Expanded Spell And Ability Catalogs`
    - `S16 - Structured Character Sections`
    - `S17 - Character Flow Stabilization`
    - `S18 - Session Plan And Roadmap Realignment`
    - `S19 - Private Content CRUD Foundation`
    - `S20 - SRD To Private Derivation`
    - `S21 - Role-Aware Content Operations`
    - `S22 - Shared Content Maintenance`
- effectively completed beyond the original status notes:
    - expanded catalog wiring now also covers `backgrounds`, `subspecies`, and `subclasses`
    - equipment catalog wiring now also covers character `attacks` and `inventory`, including linked `equipmentId` persistence, server-side normalization, enriched detail rendering, and targeted E2E coverage for the catalog selectors
    - `inventory`, `attacks`, `spells`, `feats`, and `notes` have structured character workflows
    - admin/test-user operator tooling is implemented through `scripts/create-test-user.ts`, `scripts/manage-user-role.ts`, and `docs/11-admin-and-test-user-workflow.md`
    - structured note placeholder rows are filtered during submit normalization and schema parsing, restoring green character create/edit E2E confidence
    - `/app/content` now supports private feat creation, SRD-to-private feat derivation, and role-aware shared/system feat publishing
    - trusted editor/admin users can now review and update shared homebrew feats from `/app/content`
- implemented but still intentionally shallow:
    - real character CRUD exists
    - the shared catalog is browseable and now has guarded publish/update workflows for feats, but not a full shared-content lifecycle yet
    - permissions exist as schema, RLS, server helpers, operator scripts, and a first visible content surface, not as a full admin/editor product surface
- current project point:
  - the MVP app shell and first character workflow are implemented and E2E-stable
  - structured character sections cover the highest-value MVP slices
  - environment separation is documented
  - runtime integration behavior is now documented in `README.md` and `docs/10-runtime-integration-check.md`, with request-time status checks in `src/lib/server/runtime/integration.ts`
  - the first private content workflow and first role-aware shared publishing workflow are now in place
  - the highest-value missing content slice is explicit lifecycle control for maintained shared feats after create/update
- next recommended block:
  - `S23 - Shared Content Lifecycle Controls`, because shared feat publishing and maintenance now exist but trusted roles still lack a bounded in-app delete/archive path

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
- current repo note:
    - this block is effectively complete in the current codebase through `README.md`, `docs/10-runtime-integration-check.md`, `src/hooks.server.ts`, and `src/lib/server/runtime/integration.ts`

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
    - the repo already includes initial `spells`, `feats`, and in-progress `equipment` catalog import/validation support
    - use this block to keep expanding and hardening the shared catalog surface now that the character-facing equipment wiring is effectively closed

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
  - `inventory`, `attacks`, `spells`, and `feats` now have structured workflows in the current codebase

### S17 - Character Flow Stabilization

- objective: restore confidence in the completed character workflow before adding new product scope
- read context:
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `src/lib/components/forms/character-create-form.svelte`
    - `src/lib/schemas/characters/character.schema.ts`
    - `src/lib/domain/characters/character-form.ts`
    - `tests/characters.e2e.ts`
    - character create/edit route actions if server normalization needs adjustment
- minimum validation:
    - `pnpm check`
    - `pnpm test:unit run`
    - `pnpm test:e2e`
- closure criterion:
    - character create and edit E2E tests pass again
    - structured note rows do not submit empty placeholder data
    - no regression is introduced in attacks, spells, feats, inventory, or delete flows
- current repo note:
    - completed on 2026-07-07
    - `pnpm test:e2e -- tests/characters.e2e.ts` now passes after filtering fully blank structured note rows in form submit normalization and schema parsing

### S18 - Session Plan And Roadmap Realignment

- objective: keep the project planning docs aligned with the codebase after S17 is green
- read context:
    - `docs/08-session-task-plan.md`
    - `docs/05-roadmap.md`
    - `docs/context/00_INDEX.md`
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
- likely files:
    - `docs/08-session-task-plan.md`
    - `docs/05-roadmap.md`
    - any context slice whose summary is materially stale
- minimum validation:
    - docs review
    - `pnpm check` only if code-adjacent references are changed
- closure criterion:
    - completed session blocks match the repository state
    - the next recommended block is unambiguous
    - stale implementation-order notes are removed or replaced

### S19 - Private Content CRUD Foundation

- objective: create the first user-facing workflow for private/manual content
- read context:
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `src/routes/app/content/...`
    - `src/lib/server/repositories/...`
    - `src/lib/schemas/content/...`
    - `src/lib/server/permissions/authorization.ts`
    - relevant tests near the new repository or route code
- minimum validation:
    - `pnpm check`
    - targeted unit tests
    - targeted E2E only if a full browser workflow is added
- closure criterion:
    - authenticated users can list and create one private content family, preferably `spells` or `feats`
    - created entries are owner-scoped and do not weaken SRD/system content boundaries
    - the UI clearly distinguishes shared SRD entries from user-private entries
- current repo note:
    - schemas, SQL, RLS, templates, and catalog browsing exist
    - user-facing private/homebrew content creation does not exist yet

### S20 - SRD To Private Derivation

- objective: let users start from a trusted SRD entry and save an editable private copy
- read context:
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/rules/05_GUIA_CARGA_CONTENIDO_DESDE_ARCHIVOS.md`
    - `docs/rules/06_MODELO_DATOS_CONTENIDO_Y_PERMISOS.md`
- likely files:
    - content route files created in S19
    - content repositories and schemas
    - permission helpers if derivation needs a named capability
- minimum validation:
    - `pnpm check`
    - targeted unit tests for derivation and ownership rules
    - targeted E2E if the copy flow is implemented in the browser
- closure criterion:
    - a shared SRD entry can be copied into private user-owned content
    - the derived entry keeps enough source metadata to explain where it came from
    - the original SRD entry remains read-only in normal user flows

### S21 - Role-Aware Content Operations

- objective: turn the existing role foundation into visible editor/admin behavior without exposing unsafe role management
- read context:
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/11-admin-and-test-user-workflow.md`
- likely files:
    - `src/routes/app/content/...`
    - `src/lib/server/permissions/authorization.ts`
    - content repositories
    - tests for user, content_editor, and admin behavior
- minimum validation:
    - `pnpm check`
    - targeted permission tests
    - targeted E2E if role-visible UI branches are added
- closure criterion:
    - normal users remain limited to their own private content
    - `content_editor` behavior is explicitly enforced for shared editable content
    - `admin` behavior is explicitly enforced for privileged operations
    - role assignment remains outside normal runtime UI unless a later block deliberately creates a hardened admin console

### S22 - Shared Content Maintenance

- objective: add the first bounded update workflow for trusted shared content after the initial publish path
- read context:
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/11-admin-and-test-user-workflow.md`
- likely files:
    - `src/routes/app/content/...`
    - `src/lib/server/repositories/private-feats.ts`
    - `src/lib/server/permissions/authorization.ts`
    - relevant tests near the content route/repository code
- minimum validation:
    - `pnpm check`
    - targeted unit tests for shared/system update rules
    - targeted E2E only if a browser edit workflow is added
- closure criterion:
    - `content_editor` and `admin` users can review the shared feats they are allowed to maintain
    - shared non-system feats can be updated through explicit app-side authorization
    - system-owned feats remain admin-only for update operations
    - normal users remain unable to edit shared or system-owned catalog content

### S23 - Shared Content Lifecycle Controls

- objective: add the first bounded delete/archive workflow for maintained shared feats
- read context:
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/11-admin-and-test-user-workflow.md`
- likely files:
    - `src/routes/app/content/...`
    - `src/lib/server/repositories/private-feats.ts`
    - `src/lib/server/permissions/authorization.ts`
    - relevant tests near the content route/repository code
- minimum validation:
    - `pnpm check`
    - targeted unit tests for shared/system delete or archive rules
    - targeted E2E only if a browser delete/archive workflow is added
- closure criterion:
    - `content_editor` users can retire or delete only their own shared non-system feats
    - `admin` users can retire or delete shared and system-owned homebrew feats
    - normal users remain unable to mutate shared or system-owned catalog content
    - the UI explains destructive scope clearly before applying the action

## Notes

- this plan is intentionally session-oriented, not milestone-oriented
- each block should fit comfortably in one focused chat
- if a block grows during implementation, split it rather than stretching the session
- recommended implementation order from the current project state:
    - `S23 - Shared Content Lifecycle Controls`
