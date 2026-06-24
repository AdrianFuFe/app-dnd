# Architecture And Stack

## Stack

- SvelteKit
- TypeScript
- pnpm
- Tailwind CSS
- Vitest
- Playwright
- Supabase
- Zod

## Structure Rules

- domain logic in `src/lib/domain`
- schemas in `src/lib/schemas`
- server-only code in `src/lib/server`
- reusable UI in `src/lib/components`
- authenticated app routes under `src/routes/app`
- auth routes under `src/routes/auth`

## Route Strategy

- public landing pages at root
- auth pages under `/auth`
- protected application area under `/app`
- layout-level guards should protect authenticated areas

## Quality Rules

- keep business logic outside Svelte components
- use small server actions and reusable server utilities
- validate external data with Zod
- keep domain rules testable
