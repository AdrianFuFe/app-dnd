# Database Model

## Iteration Status

This document captures the initial relational model without enabling a working Supabase integration yet.

Implementation is planned for Iteration 1.

## Core Tables

### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `characters`

- `id uuid primary key`
- `user_id uuid references auth.users(id) on delete cascade`
- `name text not null`
- `race text`
- `subrace text`
- `class_name text`
- `subclass text`
- `level integer default 1 check 1-20`
- `background text`
- `story text`
- `created_at timestamptz`
- `updated_at timestamptz`

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
- `max_hp integer default 1 check >= 0`
- `current_hp integer default 1 check >= 0`
- `temporary_hp integer default 0 check >= 0`
- `armor_class integer default 10 check >= 0`
- `initiative integer default 0`
- `speed integer default 30 check >= 0`
- `hit_dice text`

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
- users can only access their own `profiles` row
- users can only access their own `characters`
- child tables must resolve ownership through the parent `characters.user_id = auth.uid()`
- no public policies by default

## Deferred Tables

Planned for later iterations:

- `campaigns`
- `campaign_members`
- `campaign_sessions`
- `campaign_locations`
- `campaign_npcs`
- `campaign_items`
- `monsters`
- `campaign_monsters`
- `session_participants`
