# Project Overview

## Purpose

`app-dnd` is a SvelteKit application for managing DnD characters, and later campaigns and shared session information.

The initial objective is to build a stable and scalable base before adding authentication, persistence, and richer game mechanics.

## Current Scope

Iteration 0 focuses on project hygiene and architecture preparation:

- repository conventions
- documentation baseline
- target folder structure
- database model draft
- roadmap for the next iterations

## Tech Stack

- SvelteKit
- TypeScript with `strict` mode
- pnpm
- Tailwind CSS
- Vitest
- Playwright
- ESLint
- Prettier

## Quality Principles

- keep business logic outside Svelte components
- favor pure and testable domain functions
- avoid unnecessary dependencies
- keep routes and components small
- prepare server-side validation and RLS before real data flows
