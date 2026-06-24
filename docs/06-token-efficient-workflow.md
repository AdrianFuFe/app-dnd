# Token-Efficient Workflow

## Goal

Reduce token usage without sacrificing code quality, repo safety, or architectural consistency.

## Core Principles

- load only the context needed for the current task
- prefer small, closed iterations over broad multi-area requests
- read targeted files, not entire folders, unless discovery is the task
- avoid repeating already-settled architectural decisions
- validate proportionally to the risk of the change

## Task Sizing Rules

- one task should normally affect one vertical slice or one technical concern
- avoid combining UI, SQL, auth, content import, and tests in the same request unless tightly coupled
- when a task is exploratory, stop after analysis and a concrete next-step proposal
- when a task is implementation-focused, define the acceptance criteria first

## Context Loading Strategy

Always start from `docs/context/00_INDEX.md`.

Then load only the slices required by the task:

- product scope: `docs/context/10_PRODUCT_SCOPE.md`
- architecture and stack: `docs/context/20_ARCHITECTURE_AND_STACK.md`
- content and permissions: `docs/context/30_CONTENT_AND_PERMISSIONS.md`
- auth and data access: `docs/context/40_AUTH_AND_DATA.md`
- working rules: `docs/context/50_WORKFLOW_RULES.md`

## File Reading Rules

- prefer exact file reads over broad recursive scans
- use search first when the target file is unknown
- if only one function or route is relevant, inspect only that file and its direct dependencies
- reread files only after they are known to have changed

## Validation Strategy

Use the lightest validation that still protects quality:

- docs-only changes: no full validation required
- schema/domain utility changes: run targeted unit tests plus `pnpm check` when types are affected
- route/component changes: run `pnpm check` and targeted tests; run full `lint` if Svelte markup changed
- build or config changes: run full `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build`

## Communication Rules

- keep progress updates to one or two short sentences
- summarize only decisions, blockers, and results
- avoid restating large amounts of known project context
- when uncertainty is low, act first and explain briefly after

## Session Reset Rules

- prefer a new session after each completed task block
- explicitly end a block with `BLOCK COMPLETE: start a new session for the next task.`
- explicitly state the next recommended block, using the block id and title from `docs/08-session-task-plan.md`
- if a task starts crossing into another subsystem, stop and continue in a new session
- use `docs/08-session-task-plan.md` to decide the next session boundary

## Persistence Rules

- store durable decisions in docs instead of re-explaining them in every session
- convert repeated verbal guidance into prompt files or context slices
- keep context files short, factual, and task-oriented

## Expected Benefits

- lower token consumption per turn
- fewer unnecessary file reads
- more predictable iteration boundaries
- less repeated reasoning over settled project decisions
