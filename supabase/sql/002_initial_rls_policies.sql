-- Initial RLS draft for character data plus catalog content.
-- Intended for the first Supabase integration pass.

alter table profiles enable row level security;
alter table content_sources enable row level security;
alter table species enable row level security;
alter table subspecies enable row level security;
alter table character_classes enable row level security;
alter table subclasses enable row level security;
alter table backgrounds enable row level security;
alter table spells enable row level security;
alter table characters enable row level security;
alter table character_stats enable row level security;
alter table character_combat_stats enable row level security;
alter table character_text_sections enable row level security;

create policy "content_sources_select_authenticated"
on content_sources
for select
to authenticated
using (true);

create policy "profiles_select_own"
on profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "species_select_visible"
on species
for select
to authenticated
using (
	is_system_content = true
	or visibility = 'public'
	or owner_user_id = auth.uid()
);

create policy "species_insert_own"
on species
for insert
to authenticated
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "species_update_own"
on species
for update
to authenticated
using (
	owner_user_id = auth.uid()
	and is_system_content = false
)
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "subspecies_select_visible"
on subspecies
for select
to authenticated
using (
	is_system_content = true
	or visibility = 'public'
	or owner_user_id = auth.uid()
);

create policy "subspecies_insert_own"
on subspecies
for insert
to authenticated
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "subspecies_update_own"
on subspecies
for update
to authenticated
using (
	owner_user_id = auth.uid()
	and is_system_content = false
)
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "character_classes_select_visible"
on character_classes
for select
to authenticated
using (
	is_system_content = true
	or visibility = 'public'
	or owner_user_id = auth.uid()
);

create policy "character_classes_insert_own"
on character_classes
for insert
to authenticated
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "character_classes_update_own"
on character_classes
for update
to authenticated
using (
	owner_user_id = auth.uid()
	and is_system_content = false
)
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "subclasses_select_visible"
on subclasses
for select
to authenticated
using (
	is_system_content = true
	or visibility = 'public'
	or owner_user_id = auth.uid()
);

create policy "subclasses_insert_own"
on subclasses
for insert
to authenticated
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "subclasses_update_own"
on subclasses
for update
to authenticated
using (
	owner_user_id = auth.uid()
	and is_system_content = false
)
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "backgrounds_select_visible"
on backgrounds
for select
to authenticated
using (
	is_system_content = true
	or visibility = 'public'
	or owner_user_id = auth.uid()
);

create policy "backgrounds_insert_own"
on backgrounds
for insert
to authenticated
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "backgrounds_update_own"
on backgrounds
for update
to authenticated
using (
	owner_user_id = auth.uid()
	and is_system_content = false
)
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "spells_select_visible"
on spells
for select
to authenticated
using (
	is_system_content = true
	or visibility = 'public'
	or owner_user_id = auth.uid()
);

create policy "spells_insert_own"
on spells
for insert
to authenticated
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "spells_update_own"
on spells
for update
to authenticated
using (
	owner_user_id = auth.uid()
	and is_system_content = false
)
with check (
	owner_user_id = auth.uid()
	and is_system_content = false
);

create policy "characters_select_own"
on characters
for select
to authenticated
using (user_id = auth.uid());

create policy "characters_insert_own"
on characters
for insert
to authenticated
with check (user_id = auth.uid());

create policy "characters_update_own"
on characters
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "character_stats_select_own"
on character_stats
for select
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_stats.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_stats_insert_own"
on character_stats
for insert
to authenticated
with check (
	exists (
		select 1
		from characters
		where characters.id = character_stats.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_stats_update_own"
on character_stats
for update
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_stats.character_id
			and characters.user_id = auth.uid()
	)
)
with check (
	exists (
		select 1
		from characters
		where characters.id = character_stats.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_combat_stats_select_own"
on character_combat_stats
for select
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_combat_stats.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_combat_stats_insert_own"
on character_combat_stats
for insert
to authenticated
with check (
	exists (
		select 1
		from characters
		where characters.id = character_combat_stats.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_combat_stats_update_own"
on character_combat_stats
for update
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_combat_stats.character_id
			and characters.user_id = auth.uid()
	)
)
with check (
	exists (
		select 1
		from characters
		where characters.id = character_combat_stats.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_text_sections_select_own"
on character_text_sections
for select
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_text_sections.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_text_sections_insert_own"
on character_text_sections
for insert
to authenticated
with check (
	exists (
		select 1
		from characters
		where characters.id = character_text_sections.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_text_sections_update_own"
on character_text_sections
for update
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_text_sections.character_id
			and characters.user_id = auth.uid()
	)
)
with check (
	exists (
		select 1
		from characters
		where characters.id = character_text_sections.character_id
			and characters.user_id = auth.uid()
	)
);
