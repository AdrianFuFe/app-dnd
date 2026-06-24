# Context Index

## Purpose

This folder exists to avoid loading the full project documentation in every session.

Start here, then load only the slices needed for the task.

## Slices

- `10_PRODUCT_SCOPE.md`: product goal, MVP scope, deferred scope
- `20_ARCHITECTURE_AND_STACK.md`: structure, route strategy, technical conventions
- `30_CONTENT_AND_PERMISSIONS.md`: SRD, private content, visibility, import boundaries
- `40_AUTH_AND_DATA.md`: Supabase, auth direction, session model, database ownership
- `50_WORKFLOW_RULES.md`: how to approach tasks with minimal token waste

## Loading Protocol

1. read this index
2. identify the task category
3. read only the relevant slice files
4. read code files directly related to the task
5. avoid loading unrelated docs unless the task crosses that boundary

## Task To Slice Mapping

- UI-only change: `20`, `50`
- auth/session change: `20`, `40`, `50`
- SQL/RLS change: `30`, `40`, `50`
- content import/schema change: `20`, `30`, `50`
- product/roadmap discussion: `10`, plus any affected slice
