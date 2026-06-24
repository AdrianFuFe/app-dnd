# Workflow Rules

## Goal

Keep sessions precise, low-noise, and token-efficient.

## Work Pattern

- define one concrete task
- load only the needed context slices
- inspect only the files directly involved
- implement one bounded change
- run proportional validation
- when closing a completed block, explicitly name the next recommended block from `docs/08-session-task-plan.md`

## Avoid

- mixing unrelated concerns in one turn
- rereading full docs when a short context slice is enough
- running full validation for docs-only edits
- asking for broad “continue the plan” work without naming the next slice

## Preferred Task Framing

Good examples:

- implement `/app` auth guard
- add logout action using Supabase
- extend content validation for spells and subclasses
- update SQL for character ownership

Less efficient examples:

- continue the whole project
- review everything and keep going
- implement auth, content, and UI together
