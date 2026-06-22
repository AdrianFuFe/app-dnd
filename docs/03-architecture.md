# Architecture

## Guiding Principles

- domain logic lives in `src/lib/domain`
- validation schemas live in `src/lib/schemas`
- UI primitives stay reusable and presentation-focused
- services orchestrate data access without owning domain rules
- server-only code stays under `src/lib/server`

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
      inventory/
      campaigns/
    schemas/
      auth/
      characters/
    services/
      auth/
      characters/
    server/
      supabase/
      repositories/
    types/
      database/
      domain/
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
```

## Route Strategy

- public routes live at the root level
- auth pages stay under `/auth`
- authenticated application pages stay under `/app`
- future guards should protect `/app` through layout-level session checks

## Testing Strategy

- unit tests for domain logic in `src/lib/domain`
- component tests only when components have meaningful behavior
- Playwright e2e for end-to-end flows, starting with home availability
