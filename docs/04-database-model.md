# Database Model

## Current Direction

This document reflects the database direction after closing:

- `B1 - Product Contract Alignment`
- `B2 - Editorial Model And Content States`

The current target is no longer just "character CRUD plus content tables".

The target is:

- characters with explicit ruleset identity
- reusable entities with explicit ruleset identity
- separation between canonical/custom mode and editorial publication state

## Core Concepts

The data model should distinguish these concerns clearly:

- ownership
- ruleset
- content mode
- editorial status
- visibility
- provenance

These concepts should not be merged into one overloaded field.

## Roles In The Model

The global roles remain:

- `user`
- `content_editor`
- `admin`

The role model is still enforced through:

- SQL RLS
- server-side authorization

## `profiles`

Current direction:

- keep `global_role`
- continue using it as the application contract for authorization

Expected shape:

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `global_role text default 'user'`
- `created_at timestamptz`
- `updated_at timestamptz`

## Characters

## Character identity

Characters should continue to own their current structured identity and detail fields.

## New required product fields

Characters should also track:

- `ruleset_code`
- `content_mode`

Recommended shape additions:

- `ruleset_code text not null default 'dnd-2014-srd'`
- `content_mode text not null default 'canon'`

Recommended constraints:

- `content_mode in ('canon', 'custom')`

Characters do not need the full editorial lifecycle in the immediate phase.

## Current character references

These remain valid:

- `species_id`
- `subspecies_id`
- `class_id`
- `subclass_id`
- `background_id`

The existing free-text compatibility fields may remain temporarily during transition.

## Reusable Entity Tables

The reusable content families remain:

- `species`
- `subspecies`
- `character_classes`
- `subclasses`
- `backgrounds`
- `spells`
- `feats`
- `equipment`

Future families can follow the same contract.

## Shared reusable entity contract

Each reusable entity should eventually track at least:

- `owner_user_id`
- `source_id`
- `ruleset_code`
- `content_mode`
- `editorial_status`
- `visibility`
- structured fields for its domain
- `is_system_content`
- audit timestamps

## Recommended field additions for each entity table

- `ruleset_code text not null default 'dnd-2014-srd'`
- `content_mode text not null default 'canon'`
- `editorial_status text not null default 'published'`

Recommended constraints:

- `content_mode in ('canon', 'custom')`
- `editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired')`

## Meaning of these fields

### `ruleset_code`

- identifies which rule system or rules version the entity follows

### `content_mode`

- `canon`: follows that ruleset faithfully
- `custom`: extends or varies that ruleset

### `editorial_status`

- `private_draft`
- `shared_draft`
- `in_review`
- `published`
- `retired`

### `visibility`

Should remain focused on access scope, not editorial meaning.

Near-term guidance:

- keep `private`
- keep `shared`
- preserve room for future `campaign`

Avoid treating `public` as a synonym for canonical content.

## Existing fields that stay useful

### `source_id`

Still useful for provenance, licensing, and import origin.

But:

- it should not replace `ruleset_code`

### `is_system_content`

Still useful as an operational flag for protected or system-maintained rows.

But:

- it should not be the main expression of whether content is canon

## Content Sources

`content_sources` still remains useful for provenance metadata such as:

- source code
- source name
- license
- attribution
- whether the source is system-owned

This should coexist with `ruleset_code`, not replace it.

## Security Model

The current direction remains:

- enable RLS on every app table
- standard users access only their own character data
- child tables resolve ownership through the parent character
- shared readable content should remain distinct from owner-only content
- editor/admin write behavior should be explicit and guarded

## Migration Direction

The next technical migration block should focus on:

1. add `ruleset_code` and `content_mode` to `characters`
2. add `ruleset_code`, `content_mode`, and `editorial_status` to reusable entities
3. update TypeScript content model types
4. update repository queries and filters
5. update authorization expectations around editorial status transitions

## Deferred Model Areas

These remain later-phase concerns:

- campaign sharing and campaign roles
- fine-grained content permissions
- broader social/community visibility
- full custom freeform ruleset workflows
