# Editorial model and content states

## Objective

This document closes `B2 - Editorial Model And Content States`.

It defines:

- the target meaning of `ruleset`
- the target meaning of `content_mode`
- the separate editorial lifecycle
- how these concepts apply to characters and reusable entities

## Core model

All characters and reusable entities should eventually support three independent concepts:

- `ruleset`
- `content_mode`
- `editorial_status`

These should not be collapsed into one field.

## 1. `ruleset`

Purpose:

- identifies which rules system or version the item follows

Examples:

- `dnd-2014-srd`
- future: `dnd-2024-core`
- future: `pathfinder-2e-remaster`
- future: `custom`

Interpretation:

- two entities may have the same name but belong to different rulesets
- they must remain distinguishable even when their content overlaps

## 2. `content_mode`

Purpose:

- identifies whether the item follows the declared ruleset canonically or as a custom variation

Recommended values:

- `canon`
- `custom`

Interpretation:

- `canon`: follows the selected ruleset faithfully
- `custom`: extends, varies, or breaks the canonical baseline for that ruleset

Examples:

- `ruleset = dnd-2014-srd`, `content_mode = canon`
- `ruleset = dnd-2014-srd`, `content_mode = custom`
- future: `ruleset = custom`, `content_mode = custom`

Important:

- `content_mode` does not describe whether the item is private, shared, or approved

## 3. `editorial_status`

Purpose:

- identifies where the item is in the editorial and publication lifecycle

Recommended values for the near-term model:

- `private_draft`
- `shared_draft`
- `in_review`
- `published`
- `retired`

Interpretation:

- `private_draft`: only for the owner, not submitted
- `shared_draft`: intended for broader reuse but not yet under review
- `in_review`: pending editorial decision
- `published`: approved for normal shared use
- `retired`: no longer active for new use, preserved for traceability

## Why `published` instead of `canon`

Because `canon` belongs to `content_mode`, not to editorial lifecycle.

This keeps the model clean:

- `content_mode` answers: "does this follow the ruleset canonically?"
- `editorial_status` answers: "what is the publication/review state?"

## Combined examples

### Canonical published SRD-like entry

- `ruleset = dnd-2014-srd`
- `content_mode = canon`
- `editorial_status = published`

### Shared homebrew spell approved for reuse

- `ruleset = dnd-2014-srd`
- `content_mode = custom`
- `editorial_status = published`

### User proposal waiting for editorial review

- `ruleset = dnd-2014-srd`
- `content_mode = custom`
- `editorial_status = in_review`

### Fully private custom draft

- `ruleset = dnd-2014-srd`
- `content_mode = custom`
- `editorial_status = private_draft`

## Visibility

`visibility` should continue to exist, but its role should narrow.

Recommended interpretation:

- `private`
- `shared`
- optional future scopes such as `campaign`

Near-term guidance:

- avoid overloading `visibility` with editorial meaning
- avoid using `public` to mean canon

## Role interaction model

## `user`

Can:

- create private drafts
- create custom content
- keep it private
- submit eligible content into shared or review flows when enabled

Cannot:

- publish final canonical content directly

## `content_editor`

Can:

- create, edit, review, and maintain shared content
- move content into `published`
- publish final canonical content for a ruleset
- manage review outcomes

## `admin`

Can:

- do everything `content_editor` can do
- manage users, roles, and sensitive global operations

## Character model application

Characters should also support:

- `ruleset`
- `content_mode`

Characters do not need the full reusable-content editorial lifecycle in the same way as entities.

Near-term recommendation:

- characters should not require `editorial_status` in the first implementation block
- if characters later become shareable templates, that can be added as a later evolution

## Reusable entity model application

The full target model should apply to entities such as:

- species
- subspecies
- character classes
- subclasses
- backgrounds
- spells
- feats
- equipment
- future entity families

Each should eventually track:

- owner
- `ruleset`
- `content_mode`
- `editorial_status`
- `visibility`
- structured mechanics
- normal audit fields

## Recommended database naming

Recommended field names:

- `ruleset_code`
- `content_mode`
- `editorial_status`

Reasoning:

- `ruleset_code` is explicit and stable for queries
- `content_mode` is short and semantically clear
- `editorial_status` is descriptive and avoids overloading `status`

## Recommended migration direction

## Characters

Add:

- `ruleset_code text not null default 'dnd-2014-srd'`
- `content_mode text not null default 'canon'`

## Reusable entities

Add to each entity table:

- `ruleset_code text not null default 'dnd-2014-srd'`
- `content_mode text not null default 'canon'`
- `editorial_status text not null default 'published'`

## Existing fields to keep for now

- `source_id`
- `visibility`
- `owner_user_id`
- `is_system_content`

## Existing fields to reinterpret later

- `is_system_content` should gradually become an operational flag, not the main expression of canon
- `source_id` should describe provenance, not replace `ruleset`

## Suggested constraints

Near-term allowed values:

- `content_mode in ('canon', 'custom')`
- `editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired')`

## Product rules

- never use `shared` as a synonym for `canon`
- never use `content_mode` as a substitute for review state
- never rely on `source_id` alone to identify the rules version of an entity
- preserve room for future `ruleset = custom` without implementing it immediately

## Outcome of B2

This block should now be treated as closed at the documentation level.

The next natural technical follow-up is:

- align database model docs
- align TypeScript content model types
- then plan the SQL migration path
