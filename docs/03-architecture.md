# Architecture

## Guiding Principles

- domain logic lives in `src/lib/domain`
- validation schemas live in `src/lib/schemas`
- UI primitives stay reusable and presentation-focused
- services orchestrate data access without owning domain rules
- server-only code stays under `src/lib/server`
- catalog content must be represented as structured data, not only descriptive text
- content ownership, source, and visibility must be modeled explicitly

## Target Structure

```text
src/
  lib/
    components/
      ui/
      layout/
      character/
      forms/
    domain/
      characters/
      combat/
      content/
      inventory/
      campaigns/
    schemas/
      auth/
      characters/
      content/
    services/
      auth/
      characters/
      content/
    server/
      import/
      supabase/
      repositories/
    types/
      content/
      database/
      domain/
      permissions/
    utils/
  routes/
    auth/
      login/
      register/
    app/
      characters/
        new/
        [characterId]/
          edit/
      content/
        import/
data/
  srd-5-1/
  private-content-templates/
```

## Route Strategy

- public routes live at the root level
- auth pages stay under `/auth`
- authenticated application pages stay under `/app`
- future guards should protect `/app` through layout-level session checks
- future catalog management should live under `/app/content`

## Testing Strategy

- unit tests for domain logic in `src/lib/domain`
- unit tests for content schemas and file validation should live close to content types and schemas
- component tests only when components have meaningful behavior
- Playwright e2e for end-to-end flows, starting with home availability

## Context Strategy

- broad project docs remain the source of truth
- `docs/context/` provides short task-oriented slices for low-token working sessions
- prompts under `prompts/` should reference `docs/context/00_INDEX.md` first
