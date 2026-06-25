# Database Model

## Iteration Status

This document captures the initial relational model without enabling a working Supabase integration yet.

Implementation is intentionally split in stages:

- character tables remain the first editable user data slice
- the initial SQL now includes the first catalog and permission foundations needed for character references
- deeper character automation still stays incremental

The detailed future content model is documented in `docs/rules/06_MODELO_DATOS_CONTENIDO_Y_PERMISOS.md`.

## Core Tables

### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `global_role text default 'user'`
- `created_at timestamptz`
- `updated_at timestamptz`

### `characters`

- `id uuid primary key`
- `user_id uuid references auth.users(id) on delete cascade`
- `name text not null`
- `species_id uuid nullable references species(id)`
- `subspecies_id uuid nullable references subspecies(id)`
- `class_id uuid nullable references character_classes(id)`
- `subclass_id uuid nullable references subclasses(id)`
- `background_id uuid nullable references backgrounds(id)`
- `race text`
- `subrace text`
- `class_name text`
- `subclass text`
- `level integer default 1 check 1-20`
- `background text`
- `story text`
- `created_at timestamptz`
- `updated_at timestamptz`

The free-text identity fields remain useful during the MVP as a compatibility layer while reusable catalog entities are introduced.

## Current Content Tables

These now belong to the initial working schema:

- `content_sources`
- `species`
- `subspecies`
- `character_classes`
- `subclasses`
- `backgrounds`
- `spells`

The implementation order remains:

1. add `content_sources`
2. add core content tables
3. relate `characters` to those content tables
4. add advanced permissions later

### `character_stats`

- `character_id uuid primary key references characters(id) on delete cascade`
- `strength integer default 10 check 1-30`
- `dexterity integer default 10 check 1-30`
- `constitution integer default 10 check 1-30`
- `intelligence integer default 10 check 1-30`
- `wisdom integer default 10 check 1-30`
- `charisma integer default 10 check 1-30`

### `character_combat_stats`

- `character_id uuid primary key references characters(id) on delete cascade`
- `max_hp integer default 1 check >= 1`
- `current_hp integer default 1 check >= 0 and <= max_hp`
- `temporary_hp integer default 0 check >= 0`
- `armor_class integer default 10 check >= 0`
- `initiative integer default 0`
- `speed integer default 30 check >= 0`
- `hit_dice text`

### `character_text_sections`

- `character_id uuid primary key references characters(id) on delete cascade`
- `attacks text`
- `spells text`
- `inventory text`
- `notes text`

This table is the first persistence step for the free-text character sections already modeled in the MVP form schema. More structured child tables can still replace or complement these fields later.

### `character_inventory_items`

- `id uuid primary key`
- `character_id uuid references characters(id) on delete cascade`
- `name text not null`
- `quantity integer default 1 check >= 0`
- `description text`
- `weight numeric check null or >= 0`
- `value text`
- `is_equipped boolean default false`
- `created_at timestamptz`
- `updated_at timestamptz`

### `character_attacks`

- `id uuid primary key`
- `character_id uuid references characters(id) on delete cascade`
- `name text not null`
- `attack_bonus text`
- `damage text`
- `damage_type text`
- `range text`
- `description text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `character_spells`

- `id uuid primary key`
- `character_id uuid references characters(id) on delete cascade`
- `name text not null`
- `level integer check null or 0-9`
- `school text`
- `casting_time text`
- `range text`
- `components text`
- `duration text`
- `description text`
- `is_prepared boolean default false`
- `created_at timestamptz`
- `updated_at timestamptz`

### `character_notes`

- `id uuid primary key`
- `character_id uuid references characters(id) on delete cascade`
- `title text not null`
- `content text`
- `note_type text default general`
- `created_at timestamptz`
- `updated_at timestamptz`

## Security Model

- enable RLS on every app table
- standard users can only access their own `profiles` row
- standard users can only access their own `characters`
- child tables must resolve ownership through the parent `characters.user_id = auth.uid()`
- SRD/system content should be readable by authenticated users but not editable from the normal UI
- manual/private content should be owner-scoped by default
- no broad public write policies by default

## Role Enforcement Foundation

The repo now treats global roles as an explicit application contract instead of a passive column:

- `user`: can manage their own characters and private content
- `content_editor`: inherits `user` behavior and can edit shared non-system content
- `admin`: inherits `content_editor` behavior and can read or update protected app data across users

Enforcement is intentionally split across two layers:

- SQL RLS in `supabase/sql/002_initial_rls_policies.sql` remains the persistence boundary
- server-side route and action checks should use `src/lib/server/permissions/authorization.ts` before admin-only or editor-only behavior runs

The current boundary is deliberately conservative:

- admin read and update overrides exist for content and character data
- profile role assignment is not exposed through normal runtime flows yet
- safe admin assignment and test-user workflows remain deferred to `S13 - Admin And Test User Workflow`

## Deferred Tables

Planned for later iterations:

- `content_permissions`
- `campaigns`
- `campaign_members`
- `campaign_sessions`
- `campaign_locations`
- `campaign_npcs`
- `campaign_items`
- `monsters`
- `campaign_monsters`
- `session_participants`
