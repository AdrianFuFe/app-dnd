# Roadmap

## Iteration 0

- create project baseline files
- document requirements, architecture, database model, and roadmap
- prepare source folders for upcoming features

## Iteration 1

- align documentation with SRD, content, and permission guidance
- create TypeScript types for content and permissions
- prepare `src/lib/schemas/content`
- install `zod` only when schema validation work begins

## Iteration 2

- install and configure `zod`
- create content schemas and validation tests
- validate local JSON templates and future import files

## Iteration 3

- add content-oriented SQL drafts
- add `content_sources` and core catalog tables
- prepare MVP RLS for SRD and private content
- define seeds/import boundaries

## Iteration 4

- implement local content import and validation workflow
- support versioned files under `data/`
- prepare minimal SRD seeds and private templates

## Iteration 5

- integrate catalog content into character creation and editing
- keep free-text fallbacks during the transition
- complete basic auth and protected app flows with Supabase Auth

## Iteration 6

- advanced permissions and sharing
- campaign-aware visibility
- future campaign and companion features

## Cross-Cutting Workflow

- maintain focused context slices under `docs/context/`
- favor small tasks with proportional validation to reduce token waste
