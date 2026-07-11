# Product Scope

## Current Product Goal

`app-dnd` is a SvelteKit app whose main product direction is:

- guided character creation based on a selected ruleset

The current product should grow around that flow, not around disconnected feature breadth.

## Current Priorities

- stable auth and session flow
- ownership-safe character and content model
- reusable structured content catalogs
- explicit `ruleset` and `content_mode` support for characters and entities
- editorial workflow for shared and canonical content
- `Character Creation V1 Guided` for `dnd-2014-srd`

## Ruleset Direction

Every character and every reusable entity should be understood through:

- `ruleset`
- `content_mode`

Examples:

- `ruleset = dnd-2014-srd` + `content_mode = canon`
- `ruleset = dnd-2014-srd` + `content_mode = custom`

Future support for fully freeform `ruleset = custom` should exist in the model, but can wait as a later product phase.

## Editorial Direction

The product must distinguish clearly between:

- private content
- shared content
- canonical content
- review-state content

Shared and canonical must not be treated as synonyms.

## Deferred Scope

- full freeform custom workflows
- advanced campaign collaboration
- broad admin console coverage
- full automation of every DnD rule
- broad community publishing or social features
