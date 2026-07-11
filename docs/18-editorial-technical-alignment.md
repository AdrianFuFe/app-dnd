# Editorial Technical Alignment

## Objective

This document translates the editorial contract into the technical baseline currently present in the repository.

It closes the gap between:

- the product-level model in `docs/17-editorial-model-and-content-states.md`
- the SQL already present in `supabase/sql`
- the TypeScript types currently used by repositories and route flows

## Current technical state

The repository already contains the core technical primitives for the editorial model:

- `supabase/sql/006_ruleset_and_editorial_fields.sql`
- shared TypeScript unions for `ruleset`, `content_mode`, and `editorial_status`
- repository logic for `private_draft`, `in_review`, `published`, and `retired`
- UI flows that now use those states in real creation, review, and publication behavior

This means the project is no longer at a "metadata only" stage for the reusable catalog paths already used by characters and content management.

## SQL baseline already present

The current SQL direction is:

- characters track `ruleset_code` and `content_mode`
- reusable content tables track `ruleset_code`, `content_mode`, and `editorial_status`
- `visibility` is still preserved as a separate concern

Tables already aligned by SQL:

- `characters`
- `species`
- `subspecies`
- `character_classes`
- `subclasses`
- `backgrounds`
- `spells`
- `feats`
- `equipment`

## TypeScript baseline

The shared content type layer should be treated as the source of truth for the near-term editorial vocabulary:

- `RulesetCode`
- `ContentMode`
- `EditorialStatus`
- `ContentVisibility`

Near-term expectation:

- repositories should prefer these shared unions over local string duplication when practical
- catalog-facing types should keep enough editorial metadata to explain why content is visible
- characters should continue using `rulesetCode` and `contentMode` without inheriting the full reusable editorial lifecycle yet

## Important technical interpretation

The following distinctions should now be considered mandatory:

- `ruleset_code` identifies the rules version
- `content_mode` identifies canonical vs custom behavior relative to that ruleset
- `editorial_status` identifies review/publication lifecycle
- `visibility` identifies access scope, not canonical status

That means:

- `public` is not equivalent to `canon`
- `shared` is not equivalent to `published`
- `published` is not equivalent to `system-owned`
- `is_system_content` remains an operational flag, not the primary editorial model

## Remaining gaps

Even with the current progress, there are still technical gaps to close:

### 1. Generated database types remain stringly typed

The generated Supabase database types have already been narrowed for the reusable catalog tables currently exercised by the app.

Impact:

- repository code now needs fewer casts and less defensive narrowing
- invalid values are harder to introduce accidentally at integration boundaries
- the remaining risk is now unevenness, not absence of typed editorial vocabulary

### 2. RLS still follows mostly visibility-era assumptions

The current RLS policies were designed before the editorial workflow became behaviorally significant.

Impact:

- enforcement still leans heavily on `visibility`
- editorial-state-specific guarantees are still mostly implemented in server code

### 3. Shared catalog metadata is still only partially exposed

The catalog layer already filters by editorial meaning, but not every downstream type or UI surface explains that explicitly.

Impact:

- some consumers know content is visible, but not always why
- future admin/editorial surfaces may need richer metadata

## Recent implementation progress

The repository now already applies real editorial semantics in more places than the original baseline assumed:

- `spells` and `feats` use `editorial_status` and `content_mode` in creation, review, return, publication, and catalog visibility
- the `/app/content` area exposes editorial state to privileged flows
- `species`
- `subspecies`
- `character_classes`
- `subclasses`
- `backgrounds`
- `equipment`

These catalog entities now follow published/shared filtering in character-facing catalog resolution, so users cannot link non-published reusable content through creation or editing flows by ID alone.

## Recommended next technical steps

The next sensible technical sequence is:

1. document the now-implemented editorial behavior as the current baseline, not future intent
2. revisit RLS so editorial state is protected closer to the data layer across all reusable catalog tables
3. decide which admin or editorial surfaces should expose richer metadata for species, classes, subclasses, backgrounds, and equipment
4. only after that, expand equivalent create/review/maintenance tooling beyond spells and feats where product value justifies it

## Outcome

The project now has a coherent technical baseline for the editorial model:

- product contract defined
- SQL direction present
- TypeScript vocabulary present
- real behavior active in the app

The next block should focus on making those guarantees stricter at the schema and persistence boundaries, not inventing a new model.
