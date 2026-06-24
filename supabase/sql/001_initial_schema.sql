-- Initial schema draft for Supabase/PostgreSQL.
-- This file is now a real SQL design draft for the first catalog-oriented
-- iteration, but it is still not wired into a live Supabase project yet.

create extension if not exists pgcrypto;

create table if not exists content_sources (
	id uuid primary key default gen_random_uuid(),
	code text not null unique,
	name text not null,
	license text,
	attribution text,
	is_system_source boolean not null default false,
	created_at timestamptz not null default now()
);

create table if not exists profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	display_name text,
	global_role text not null default 'user' check (
		global_role in ('user', 'content_editor', 'admin')
	),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists species (
	id uuid primary key default gen_random_uuid(),
	owner_user_id uuid references auth.users (id) on delete cascade,
	source_id uuid not null references content_sources (id),
	visibility text not null default 'private' check (
		visibility in ('private', 'campaign', 'shared', 'public')
	),
	slug text not null,
	name text not null,
	summary text,
	description text,
	size text,
	base_speed integer check (base_speed is null or base_speed >= 0),
	languages text[] not null default '{}',
	subspecies_slugs text[] not null default '{}',
	mechanics jsonb not null default '[]'::jsonb,
	is_system_content boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (source_id, owner_user_id, slug)
);

create table if not exists subspecies (
	id uuid primary key default gen_random_uuid(),
	owner_user_id uuid references auth.users (id) on delete cascade,
	source_id uuid not null references content_sources (id),
	visibility text not null default 'private' check (
		visibility in ('private', 'campaign', 'shared', 'public')
	),
	species_slug text not null,
	slug text not null,
	name text not null,
	summary text,
	description text,
	mechanics jsonb not null default '[]'::jsonb,
	is_system_content boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (source_id, owner_user_id, slug)
);

create table if not exists character_classes (
	id uuid primary key default gen_random_uuid(),
	owner_user_id uuid references auth.users (id) on delete cascade,
	source_id uuid not null references content_sources (id),
	visibility text not null default 'private' check (
		visibility in ('private', 'campaign', 'shared', 'public')
	),
	slug text not null,
	name text not null,
	hit_die integer not null check (hit_die > 0),
	primary_abilities text[] not null default '{}',
	saving_throw_proficiencies text[] not null default '{}',
	armor_proficiencies text[] not null default '{}',
	weapon_proficiencies text[] not null default '{}',
	tool_proficiencies text[] not null default '{}',
	skill_choices jsonb not null default '{}'::jsonb,
	starting_equipment jsonb not null default '[]'::jsonb,
	spellcasting_ability text,
	progression jsonb not null default '[]'::jsonb,
	summary text,
	description text,
	mechanics jsonb not null default '[]'::jsonb,
	is_system_content boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (source_id, owner_user_id, slug)
);

create table if not exists subclasses (
	id uuid primary key default gen_random_uuid(),
	owner_user_id uuid references auth.users (id) on delete cascade,
	source_id uuid not null references content_sources (id),
	visibility text not null default 'private' check (
		visibility in ('private', 'campaign', 'shared', 'public')
	),
	class_slug text not null,
	slug text not null,
	name text not null,
	summary text,
	description text,
	granted_spells_by_level jsonb not null default '[]'::jsonb,
	features jsonb not null default '[]'::jsonb,
	mechanics jsonb not null default '[]'::jsonb,
	is_system_content boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (source_id, owner_user_id, slug)
);

create table if not exists backgrounds (
	id uuid primary key default gen_random_uuid(),
	owner_user_id uuid references auth.users (id) on delete cascade,
	source_id uuid not null references content_sources (id),
	visibility text not null default 'private' check (
		visibility in ('private', 'campaign', 'shared', 'public')
	),
	slug text not null,
	name text not null,
	skill_proficiencies text[] not null default '{}',
	tool_proficiencies text[] not null default '{}',
	languages text[] not null default '{}',
	equipment jsonb not null default '[]'::jsonb,
	feature_name text,
	summary text,
	description text,
	mechanics jsonb not null default '[]'::jsonb,
	is_system_content boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (source_id, owner_user_id, slug)
);

create table if not exists spells (
	id uuid primary key default gen_random_uuid(),
	owner_user_id uuid references auth.users (id) on delete cascade,
	source_id uuid not null references content_sources (id),
	visibility text not null default 'private' check (
		visibility in ('private', 'campaign', 'shared', 'public')
	),
	slug text not null,
	name text not null,
	level integer not null check (level between 0 and 9),
	school text not null,
	casting_time text,
	range_text text,
	components text,
	materials text,
	duration text,
	concentration boolean not null default false,
	ritual boolean not null default false,
	class_slugs text[] not null default '{}',
	summary text,
	description text,
	mechanics jsonb not null default '[]'::jsonb,
	is_system_content boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (source_id, owner_user_id, slug)
);

create table if not exists characters (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	species_id uuid references species (id),
	subspecies_id uuid references subspecies (id),
	class_id uuid references character_classes (id),
	subclass_id uuid references subclasses (id),
	background_id uuid references backgrounds (id),
	name text not null,
	race text,
	subrace text,
	class_name text,
	subclass text,
	level integer not null default 1 check (
		level between 1 and 20
	),
	background text,
	story text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists character_stats (
	character_id uuid primary key references characters (id) on delete cascade,
	strength integer not null default 10 check (
		strength between 1 and 30
	),
	dexterity integer not null default 10 check (
		dexterity between 1 and 30
	),
	constitution integer not null default 10 check (
		constitution between 1 and 30
	),
	intelligence integer not null default 10 check (
		intelligence between 1 and 30
	),
	wisdom integer not null default 10 check (
		wisdom between 1 and 30
	),
	charisma integer not null default 10 check (
		charisma between 1 and 30
	)
);

create table if not exists character_combat_stats (
	character_id uuid primary key references characters (id) on delete cascade,
	max_hp integer not null default 1 check (max_hp >= 1),
	current_hp integer not null default 1 check (
		current_hp >= 0
		and current_hp <= max_hp
	),
	temporary_hp integer not null default 0 check (temporary_hp >= 0),
	armor_class integer not null default 10 check (armor_class >= 0),
	initiative integer not null default 0,
	speed integer not null default 30 check (speed >= 0),
	hit_dice text
);

create table if not exists character_text_sections (
	character_id uuid primary key references characters (id) on delete cascade,
	attacks text,
	spells text,
	inventory text,
	notes text
);
