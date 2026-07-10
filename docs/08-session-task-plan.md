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
- verified on 2026-07-09:
    - `pnpm test:e2e -- tests/content.e2e.ts` passes with 7 tests covering privileged feat and spell browser workflows plus invalid publish guardrails
- verified on 2026-07-10:
    - `pnpm test:e2e -- tests/content.e2e.ts` passes with 9 tests covering invalid shared-content maintenance edits in addition to the existing privileged content browser workflows
- verified again on 2026-07-10 during planning review:
    - `pnpm check` passes
    - `pnpm build` passes
    - `pnpm lint` is currently red because Prettier formatting drift exists in multiple repo files
    - `pnpm test` is currently red before E2E execution because `src/lib/schemas/content/content-template.schema.spec.ts` still expects the pre-expansion SRD fixture counts for `species`, `subspecies`, and `subclasses`
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
    - `S23 - Shared Content Lifecycle Controls`
    - `S24 - Private Spell CRUD Foundation`
    - `S25 - SRD To Private Spell Derivation`
    - `S31 - Shared Content Edit Validation E2E`
    - `S32 - Catalog Seed Expansion For Subspecies And Subclasses`
- effectively completed beyond the original status notes:
    - expanded catalog wiring now also covers `backgrounds`, `subspecies`, and `subclasses`
    - equipment catalog wiring now also covers character `attacks` and `inventory`, including linked `equipmentId` persistence, server-side normalization, enriched detail rendering, and targeted E2E coverage for the catalog selectors
    - `inventory`, `attacks`, `spells`, `feats`, and `notes` have structured character workflows
    - admin/test-user operator tooling is implemented through `scripts/create-test-user.ts`, `scripts/manage-user-role.ts`, and `docs/11-admin-and-test-user-workflow.md`
    - structured note placeholder rows are filtered during submit normalization and schema parsing, restoring green character create/edit E2E confidence
    - `/app/content` now supports private feat creation, SRD-to-private feat derivation, and role-aware shared/system feat publishing
    - `/app/content` now also supports private spell creation, SRD-to-private spell derivation, and role-aware shared/system spell publishing
    - trusted editor/admin users can now review and update shared homebrew feats from `/app/content`
    - trusted editor/admin users can now also review and update shared homebrew spells from `/app/content`
    - trusted editor/admin users can now also retire or permanently delete maintained shared feats from `/app/content`
    - trusted editor/admin users can now also retire or permanently delete maintained shared spells from `/app/content`
    - `/app/content` browser coverage now exercises role-sensitive feat and spell publish, maintain, retire, and delete flows in the E2E mock runtime
    - invalid privileged feat and spell publish attempts now stay on `/app/content` with stable field-level validation feedback in browser coverage
    - invalid trusted-role shared feat and spell edit attempts now also stay in the maintenance editor with stable field feedback and preserved selected-entry state in browser coverage
- implemented but still intentionally shallow:
    - real character CRUD exists
    - the shared catalog is browseable and now has guarded create/update/retire/delete workflows for both feats and spells, while the SRD seed files for some existing catalog families are still intentionally thin
    - permissions exist as schema, RLS, server helpers, operator scripts, and a first visible content surface, not as a full admin/editor product surface
- current project point:
    - the MVP app shell and first character workflow are implemented and E2E-stable
    - structured character sections cover the highest-value MVP slices
    - environment separation is documented
    - runtime integration behavior is now documented in `README.md` and `docs/10-runtime-integration-check.md`, with request-time status checks in `src/lib/server/runtime/integration.ts`
    - the first private content workflows now exist for both feats and spells
    - trusted editor/admin users can now publish bounded shared and system homebrew entries for both feats and spells
    - trusted editor/admin users can now also review, update, retire, and delete maintained shared spells
    - privileged content workflows are now covered in the browser for the primary feat and spell lifecycle paths
    - rejected privileged publish submissions now have browser regression coverage with stable field feedback
    - the highest-value nearby confidence slice is targeted browser coverage for dependent `subspecies` and `subclass` selection behavior that now has richer seed data behind it
    - the current repo is close to an internally testable MVP, but it is not yet at a fully green release-ready checkpoint because content-template expectations and formatting drift still need cleanup
    - live Supabase runtime and deployment readiness are documented, but still need an explicit smoke-test pass against a real environment after the current quality gaps are closed
- next recommended block:
    - `S33 - Character Catalog Dependent Selection E2E`, because the character forms already depend on `species -> subspecies` and `class -> subclass` relationships, the newly expanded seed data should now be proven in the browser, and this is still the tightest next confidence slice from the previous implementation session
- near-term follow-up after `S33`:
    - `S34 - Catalog Fixture And Quality Gate Realignment`, to restore green unit expectations after the expanded SRD seed and to clear the current formatting drift
    - `S35 - Live Supabase Smoke And Deploy Readiness`, to validate the app against a real Supabase project and close the remaining gap between "implemented MVP" and "operational MVP"

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

### S24 - Private Spell CRUD Foundation

- objective: extend the first user-facing private content workflow from feats into spells
- read context:
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/rules/05_GUIA_CARGA_CONTENIDO_DESDE_ARCHIVOS.md`
- likely files:
    - `src/routes/app/content/...`
    - `src/lib/server/repositories/...`
    - `src/lib/schemas/content/spell...`
    - relevant tests near the new route/repository/schema code
- minimum validation:
    - `pnpm check`
    - targeted unit tests
    - targeted E2E only if a full browser workflow is added
- closure criterion:
    - authenticated users can list and create private spells from the app UI
    - private spells remain owner-scoped and do not weaken SRD/shared spell boundaries
    - spell-specific fields are validated in the app workflow, not only in file-import schemas
    - the UI clearly distinguishes shared SRD spells from user-private spell drafts

### S25 - SRD To Private Spell Derivation

- objective: let users start from a trusted shared SRD spell and save an editable private copy
- read context:
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/rules/05_GUIA_CARGA_CONTENIDO_DESDE_ARCHIVOS.md`
    - `docs/rules/06_MODELO_DATOS_CONTENIDO_Y_PERMISOS.md`
- likely files:
    - `src/routes/app/content/...`
    - `src/lib/server/repositories/private-spells.ts`
    - `src/lib/server/e2e/mock-app.ts`
    - relevant tests near the content route/repository code
- minimum validation:
    - `pnpm check`
    - targeted unit tests for spell derivation and ownership rules
    - targeted E2E only if the copy flow is exercised in the browser
- closure criterion:
    - a shared SRD spell can be copied into private user-owned spell content
    - the derived spell keeps enough source metadata to explain where it came from
    - the original shared SRD spell remains read-only in normal user flows
    - the UI clearly distinguishes manual private spell creation from shared-spell derivation

### S26 - Shared Spell Publishing Foundation

- objective: add the first bounded trusted-role publishing workflow for spells
- read context:
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/11-admin-and-test-user-workflow.md`
- likely files:
    - `src/routes/app/content/...`
    - `src/lib/server/repositories/private-spells.ts`
    - `src/lib/schemas/content/private-spell...`
    - `src/lib/server/permissions/authorization.ts`
    - relevant tests near the route/repository code
- minimum validation:
    - `pnpm check`
    - targeted permission and repository tests
    - targeted E2E only if a full browser publish flow is added
- closure criterion:
    - `content_editor` users can publish validated shared homebrew spells
    - `admin` users can publish bounded system-owned spell entries
    - normal users remain unable to publish shared or system spell content
    - the spell publishing path preserves clear separation between private drafts and shared/system catalog entries

### S27 - Shared Spell Maintenance

- objective: add the first bounded update workflow for trusted shared spell content after the initial publish path
- read context:
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/11-admin-and-test-user-workflow.md`
- likely files:
    - `src/routes/app/content/...`
    - `src/lib/server/repositories/private-spells.ts`
    - `src/lib/server/permissions/authorization.ts`
    - relevant tests near the content route/repository code
- minimum validation:
    - `pnpm check`
    - targeted unit tests for shared/system spell update rules
    - targeted E2E only if a browser edit workflow is added
- closure criterion:
    - `content_editor` and `admin` users can review the shared spells they are allowed to maintain
    - shared non-system spells can be updated through explicit app-side authorization
    - system-owned spells remain admin-only for update operations
    - normal users remain unable to edit shared or system-owned spell catalog content

### S28 - Shared Spell Lifecycle Controls

- objective: add the first bounded retire/delete workflow for maintained shared spells
- read context:
    - `docs/context/10_PRODUCT_SCOPE.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/11-admin-and-test-user-workflow.md`
- likely files:
    - `src/routes/app/content/...`
    - `src/lib/server/repositories/private-spells.ts`
    - `src/lib/server/permissions/authorization.ts`
    - relevant tests near the content route/repository code
- minimum validation:
    - `pnpm check`
    - targeted unit tests for shared/system spell delete or archive rules
    - targeted E2E only if a browser delete/archive workflow is added
- closure criterion:
    - `content_editor` users can retire or delete only their own shared non-system spells
    - `admin` users can retire or delete shared and system-owned homebrew spells
    - normal users remain unable to mutate shared or system-owned spell catalog content
    - the UI explains destructive scope clearly before applying the action

### S29 - Privileged Content E2E Coverage

- objective: add focused browser coverage for role-sensitive `/app/content` workflows
- read context:
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/11-admin-and-test-user-workflow.md`
- likely files:
    - `tests/...`
    - `tests/e2e/...`
    - `src/routes/api/test/...`
    - `src/lib/server/e2e/mock-app.ts`
- minimum validation:
    - `pnpm check`
    - `pnpm test:e2e -- tests/content.e2e.ts`
- closure criterion:
    - Playwright can switch between `user`, `content_editor`, and `admin` behavior in E2E mode
    - at least one trusted-role shared spell publish and lifecycle workflow is covered in the browser
    - the test harness resets role state between tests so the suite remains deterministic

### S30 - Content Validation E2E Guardrails

- objective: add focused browser coverage for invalid `/app/content` submissions and rejected privileged actions
- read context:
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/11-admin-and-test-user-workflow.md`
- likely files:
    - `tests/content.e2e.ts`
    - `tests/e2e/...`
    - `src/routes/app/content/+page.server.ts`
    - `src/lib/server/e2e/mock-app.ts`
- minimum validation:
    - `pnpm check`
    - `pnpm test:e2e -- tests/content.e2e.ts`
- closure criterion:
    - invalid feat or spell publish attempts render stable field-level feedback in the browser
    - at least one privileged browser test confirms the page stays on the form when validation fails
    - the coverage remains deterministic across role resets in E2E mode

### S31 - Shared Content Edit Validation E2E

- objective: add focused browser coverage for invalid trusted-role edits in the shared feat and spell maintenance editors
- read context:
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
    - `docs/11-admin-and-test-user-workflow.md`
- likely files:
    - `tests/content.e2e.ts`
    - `src/routes/app/content/+page.server.ts`
    - `src/routes/app/content/+page.svelte`
    - `src/lib/server/e2e/mock-app.ts`
- minimum validation:
    - `pnpm check`
    - `pnpm test:e2e -- tests/content.e2e.ts`
- closure criterion:
    - invalid shared feat or spell edits render stable field-level feedback in the maintenance editor
    - the selected managed entry stays loaded after validation failure so the user can correct the draft in place
    - the coverage remains deterministic across role resets in E2E mode

### S32 - Catalog Seed Expansion For Subspecies And Subclasses

- objective: expand the thin SRD catalog seed coverage for `subspecies` and `subclasses` without changing the existing runtime model
- read context:
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `data/srd-5-1/species.json`
    - `data/srd-5-1/subspecies.json`
    - `data/srd-5-1/subclasses.json`
    - validation tests or docs only if needed
- minimum validation:
    - `pnpm validate:content`
    - targeted schema tests only if the data shape pushes existing validation boundaries
- closure criterion:
    - at least one additional valid subspecies is linked from an existing species entry
    - at least one additional valid subclass is added for an already-modeled class
    - the expanded files validate cleanly through the local content-validation workflow

### S33 - Character Catalog Dependent Selection E2E

- objective: add focused browser coverage for dependent `subspecies` and `subclass` behavior in the character create/edit forms
- read context:
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `tests/characters.e2e.ts`
    - `src/lib/components/forms/character-create-form.svelte`
    - `src/lib/server/e2e/mock-app.ts`
- minimum validation:
    - `pnpm check`
    - `pnpm test:e2e -- tests/characters.e2e.ts`
- closure criterion:
    - browser coverage proves subspecies options change with the selected species
    - browser coverage proves subclass options change with the selected class
    - at least one assertion exercises newly expanded catalog entries rather than only the original seed rows

### S34 - Catalog Fixture And Quality Gate Realignment

- objective: restore the repository quality gates after the recent SRD seed expansion
- read context:
    - `docs/05-roadmap.md`
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `src/lib/schemas/content/content-template.schema.spec.ts`
    - `data/srd-5-1/species.json`
    - `data/srd-5-1/subspecies.json`
    - `data/srd-5-1/subclasses.json`
    - any repo files currently flagged by `pnpm lint`
- minimum validation:
    - `pnpm check`
    - `pnpm test:unit run`
    - `pnpm lint`
- closure criterion:
    - content-template expectations reflect the current expanded SRD fixture set
    - `pnpm test:unit run` is green again
    - formatting drift no longer keeps `pnpm lint` red

### S35 - Live Supabase Smoke And Deploy Readiness

- objective: prove that the MVP can run against a real Supabase environment and is ready for first hosted testing
- read context:
    - `docs/09-environment-setup.md`
    - `docs/10-runtime-integration-check.md`
    - `docs/11-admin-and-test-user-workflow.md`
    - `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - `docs/context/40_AUTH_AND_DATA.md`
    - `docs/context/50_WORKFLOW_RULES.md`
- likely files:
    - `README.md`
    - `.env.example`
    - `supabase/sql/...`
    - hosting or adapter configuration if introduced
- minimum validation:
    - `pnpm check`
    - `pnpm build`
    - a documented live smoke-test pass against a real Supabase project
- closure criterion:
    - a developer can bootstrap the SQL and environment without guessing
    - auth, `/app`, character CRUD, and `/app/content` core flows have been smoke-tested against live Supabase
    - deployment prerequisites are explicit enough to host an internal test build without relying on the mock runtime

## Notes

- this plan is intentionally session-oriented, not milestone-oriented
- each block should fit comfortably in one focused chat
- if a block grows during implementation, split it rather than stretching the session
- recommended implementation order from the current project state:
    - `S33 - Character Catalog Dependent Selection E2E`
    - `S34 - Catalog Fixture And Quality Gate Realignment`
    - `S35 - Live Supabase Smoke And Deploy Readiness`
