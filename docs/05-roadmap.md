# Roadmap

## Roadmap Status

The project already completed a strong technical foundation:

- auth and protected app shell
- character CRUD
- structured SRD-backed catalog content
- role-aware content operations for bounded content families
- tests and validation strong enough for iterative work

The next roadmap should now shift from "more breadth first" to "stronger product direction first".

## Completed Foundation

These blocks are already substantially in place:

1. baseline documentation and project structure
2. schema and validation groundwork for content
3. SQL and RLS foundations
4. initial SRD seed/import direction
5. protected app shell and auth flows
6. character create/edit/detail/delete workflow
7. first private content CRUD for bounded families
8. first role-aware shared content publishing and maintenance for bounded families

This foundation should now be reused rather than replaced.

## Next Strategic Block

The next recommended block is:

- `B1 - Product Contract Alignment`

This block should lock down:

- `ruleset` and `content_mode` as first-class product concepts
- role responsibilities
- editorial review flow
- scope of `Character Creation V1 Guided`

## Near-Term Roadmap

## B1 - Product Contract Alignment

Objective:

- align requirements, roadmap, and context docs with the current product direction

Expected output:

- updated requirements
- clarified product scope
- clarified content/editorial model
- clarified next implementation priorities

## B2 - Editorial Model And Content States

Objective:

- define how shared, canonical, custom, and review-state content should coexist

Key decisions:

- every entity should support `ruleset`
- every entity should support `content_mode`
- characters should also support `ruleset` and `content_mode`
- editorial status should be modeled separately from content mode when review workflows are needed

Expected output:

- agreed state model
- target field naming
- target data-model direction before SQL changes

## B3 - Character Area UX Consolidation

Objective:

- improve the current character area before rebuilding the main creation flow

Expected work:

- gallery polish
- clearer detail/edit flow
- double confirmation for destructive delete operations
- UI cleanup that reduces friction before the guided creator lands

## B4 - Character Creation V1 Guided Design

Objective:

- design the first real guided creator before implementation

Scope:

- first ruleset: `dnd-2014-srd`
- step-based experience
- heavy automation for canonical progression
- architecture prepared for future custom overrides

Expected output:

- step map
- automatic vs editable field policy
- progression and rule-application contract
- integration plan with the current catalog

## B5 - Character Creation V1 Guided Implementation

Objective:

- build the new guided creator as the next major product delivery

Expected work:

- step-based UI
- rule application layer
- validation updates
- integration with catalog entities
- automated test coverage

## B6 - Custom Foundation

Objective:

- prepare the second-phase path for custom behavior without blocking guided v1

Expected work:

- override model
- custom entity linkage to an existing ruleset
- foundation for future `ruleset = custom`

Important note:

- this foundation should be prepared after guided v1 is clearly defined, not before

## B7 - Generalized Entity Authoring

Objective:

- expand content creation beyond the currently bounded feat/spell flows

Expected work:

- reusable authoring patterns by entity type
- ruleset-aware and content-mode-aware forms
- alignment with the editorial flow

This should happen after the editorial contract is clear enough to avoid rework.

## Supporting Workstreams

These should continue, but should not distract from the guided creator roadmap:

- live Supabase smoke validation
- deployment readiness
- documentation hygiene
- quality gates
- progressive i18n preparation

## Product Rules For Upcoming Work

- do not treat shared content and canonical content as the same thing
- do not implement full custom mode before guided v1 has a stable contract
- do not expand admin UI broadly before the editorial model is clear
- do not keep adding horizontal CRUD surfaces unless they directly support the guided creator or the agreed editorial model

## Cross-Cutting Workflow

- maintain focused context slices under `docs/context/`
- favor small implementation blocks with validation
- document product decisions before broadening the surface area again
