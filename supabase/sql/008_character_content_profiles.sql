create table if not exists character_content_profiles (
	character_id uuid primary key references characters (id) on delete cascade,
	reason_lines jsonb not null default '[]'::jsonb,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	check (jsonb_typeof(reason_lines) = 'array')
);

alter table character_content_profiles enable row level security;

create policy "character_content_profiles_select_own"
on character_content_profiles
for select
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_content_profiles.character_id
			and (
				characters.user_id = auth.uid()
				or public.has_global_role('admin')
			)
	)
);

create policy "character_content_profiles_insert_own"
on character_content_profiles
for insert
to authenticated
with check (
	exists (
		select 1
		from characters
		where characters.id = character_content_profiles.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_content_profiles_update_own"
on character_content_profiles
for update
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_content_profiles.character_id
			and (
				characters.user_id = auth.uid()
				or public.has_global_role('admin')
			)
	)
)
with check (
	exists (
		select 1
		from characters
		where characters.id = character_content_profiles.character_id
			and (
				characters.user_id = auth.uid()
				or public.has_global_role('admin')
			)
	)
);

create policy "character_content_profiles_delete_own"
on character_content_profiles
for delete
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_content_profiles.character_id
			and (
				characters.user_id = auth.uid()
				or public.has_global_role('admin')
			)
	)
);
