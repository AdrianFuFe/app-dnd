create table if not exists character_notes (
	id uuid primary key default gen_random_uuid(),
	character_id uuid not null references characters (id) on delete cascade,
	title text not null,
	content text not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table character_notes enable row level security;

create policy "character_notes_select_own"
on character_notes
for select
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_notes.character_id
			and (
				characters.user_id = auth.uid()
				or public.has_global_role('admin')
			)
	)
);

create policy "character_notes_insert_own"
on character_notes
for insert
to authenticated
with check (
	exists (
		select 1
		from characters
		where characters.id = character_notes.character_id
			and characters.user_id = auth.uid()
	)
);

create policy "character_notes_update_own"
on character_notes
for update
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_notes.character_id
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
		where characters.id = character_notes.character_id
			and (
				characters.user_id = auth.uid()
				or public.has_global_role('admin')
			)
	)
);

create policy "character_notes_delete_own"
on character_notes
for delete
to authenticated
using (
	exists (
		select 1
		from characters
		where characters.id = character_notes.character_id
			and (
				characters.user_id = auth.uid()
				or public.has_global_role('admin')
			)
	)
);
