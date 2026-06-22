# Modelo de datos para contenido y permisos

## Objetivo

Extender el modelo inicial de personajes para soportar contenido SRD, contenido manual y permisos.

## Tablas base nuevas recomendadas

### content_sources

```sql
create table content_sources (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  license text,
  attribution text,
  is_system_source boolean not null default false,
  created_at timestamptz not null default now()
);
```

Ejemplos:

- `srd-5-1`.
- `srd-5-2`.
- `user-private`.
- `homebrew`.

### profiles

Anadir rol global:

```sql
alter table profiles
add column if not exists global_role text not null default 'user'
check (global_role in ('user', 'content_editor', 'admin'));
```

### species

```sql
create table species (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  source_id uuid not null references content_sources(id),
  visibility text not null default 'private'
    check (visibility in ('private', 'campaign', 'shared', 'public')),
  slug text not null,
  name text not null,
  summary text,
  description text,
  size text,
  base_speed integer,
  mechanics jsonb not null default '[]'::jsonb,
  is_system_content boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, owner_user_id, slug)
);
```

### subspecies

```sql
create table subspecies (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  source_id uuid not null references content_sources(id),
  visibility text not null default 'private'
    check (visibility in ('private', 'campaign', 'shared', 'public')),
  slug text not null,
  name text not null,
  summary text,
  description text,
  mechanics jsonb not null default '[]'::jsonb,
  is_system_content boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, owner_user_id, slug)
);
```

### character_classes

Usar `character_classes` en lugar de `classes` para evitar conflicto semantico en codigo.

```sql
create table character_classes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  source_id uuid not null references content_sources(id),
  visibility text not null default 'private'
    check (visibility in ('private', 'campaign', 'shared', 'public')),
  slug text not null,
  name text not null,
  hit_die integer not null,
  primary_abilities text[] not null default '{}',
  saving_throw_proficiencies text[] not null default '{}',
  skill_choices jsonb not null default '{}'::jsonb,
  proficiencies jsonb not null default '{}'::jsonb,
  spellcasting jsonb,
  summary text,
  description text,
  mechanics jsonb not null default '[]'::jsonb,
  is_system_content boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, owner_user_id, slug)
);
```

### class_features

```sql
create table class_features (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references character_classes(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  source_id uuid not null references content_sources(id),
  level integer not null check (level between 1 and 20),
  slug text not null,
  name text not null,
  summary text,
  description text,
  mechanics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### subclasses

```sql
create table subclasses (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references character_classes(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  source_id uuid not null references content_sources(id),
  visibility text not null default 'private'
    check (visibility in ('private', 'campaign', 'shared', 'public')),
  slug text not null,
  name text not null,
  summary text,
  description text,
  mechanics jsonb not null default '[]'::jsonb,
  is_system_content boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, owner_user_id, slug)
);
```

### subclass_features

```sql
create table subclass_features (
  id uuid primary key default gen_random_uuid(),
  subclass_id uuid not null references subclasses(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  source_id uuid not null references content_sources(id),
  level integer not null check (level between 1 and 20),
  slug text not null,
  name text not null,
  summary text,
  description text,
  mechanics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### backgrounds

```sql
create table backgrounds (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  source_id uuid not null references content_sources(id),
  visibility text not null default 'private'
    check (visibility in ('private', 'campaign', 'shared', 'public')),
  slug text not null,
  name text not null,
  skill_proficiencies text[] not null default '{}',
  tool_proficiencies text[] not null default '{}',
  languages jsonb not null default '{}'::jsonb,
  equipment jsonb not null default '[]'::jsonb,
  feature_name text,
  summary text,
  description text,
  mechanics jsonb not null default '[]'::jsonb,
  is_system_content boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, owner_user_id, slug)
);
```

### spells

```sql
create table spells (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  source_id uuid not null references content_sources(id),
  visibility text not null default 'private'
    check (visibility in ('private', 'campaign', 'shared', 'public')),
  slug text not null,
  name text not null,
  level integer check (level between 0 and 9),
  school text,
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
  unique(source_id, owner_user_id, slug)
);
```

## Integracion con personajes

En `characters`, anadir referencias opcionales:

```sql
alter table characters
add column if not exists species_id uuid references species(id),
add column if not exists subspecies_id uuid references subspecies(id),
add column if not exists class_id uuid references character_classes(id),
add column if not exists subclass_id uuid references subclasses(id),
add column if not exists background_id uuid references backgrounds(id);
```

Mantener campos de texto libres `race`, `class_name`, etc. temporalmente durante el MVP puede ser util para migracion progresiva.

## Recomendacion

No implementar todas estas tablas en la primera iteracion si retrasa el MVP.

Orden recomendado:

1. `content_sources`.
2. `species`, `character_classes`, `subclasses`, `backgrounds`, `spells`.
3. Relacionar personajes.
4. `features` y `mechanics`.
5. Permisos avanzados.
