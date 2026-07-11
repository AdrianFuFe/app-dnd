create or replace function public.is_reusable_content_published(
	editorial_status text,
	visibility text
)
returns boolean
language sql
stable
as $$
	select editorial_status = 'published'
		and visibility in ('shared', 'public');
$$;

create or replace function public.can_read_reusable_content(
	owner_user_id uuid,
	editorial_status text,
	visibility text
)
returns boolean
language sql
stable
as $$
	select
		public.has_global_role('admin')
		or owner_user_id = auth.uid()
		or (
			public.has_global_role('content_editor')
			and editorial_status = 'in_review'
			and visibility = 'shared'
		)
		or public.is_reusable_content_published(editorial_status, visibility);
$$;

create or replace function public.can_insert_reusable_content(
	owner_user_id uuid,
	is_system_content boolean,
	editorial_status text,
	visibility text
)
returns boolean
language sql
stable
as $$
	select
		public.has_global_role('admin')
		or (
			owner_user_id = auth.uid()
			and is_system_content = false
			and (
				(visibility = 'private' and editorial_status = 'private_draft')
				or (visibility = 'shared' and editorial_status in ('shared_draft', 'in_review'))
				or (
					public.has_global_role('content_editor')
					and visibility = 'shared'
					and editorial_status = 'published'
				)
			)
		);
$$;

create or replace function public.can_update_reusable_content_current(
	owner_user_id uuid,
	is_system_content boolean,
	editorial_status text
)
returns boolean
language sql
stable
as $$
	select
		public.has_global_role('admin')
		or (
			owner_user_id = auth.uid()
			and is_system_content = false
		)
		or (
			public.has_global_role('content_editor')
			and is_system_content = false
			and editorial_status = 'in_review'
		);
$$;

create or replace function public.can_update_reusable_content_target(
	owner_user_id uuid,
	is_system_content boolean,
	editorial_status text,
	visibility text
)
returns boolean
language sql
stable
as $$
	select
		public.has_global_role('admin')
		or (
			owner_user_id = auth.uid()
			and is_system_content = false
			and (
				(visibility = 'private' and editorial_status in ('private_draft', 'retired'))
				or (visibility = 'shared' and editorial_status in ('shared_draft', 'in_review'))
				or (
					public.has_global_role('content_editor')
					and visibility = 'shared'
					and editorial_status = 'published'
				)
			)
		)
		or (
			public.has_global_role('content_editor')
			and owner_user_id is not null
			and is_system_content = false
			and (
				(visibility = 'private' and editorial_status = 'private_draft')
				or (visibility = 'shared' and editorial_status in ('in_review', 'published'))
			)
		);
$$;

create or replace function public.can_delete_reusable_content(
	owner_user_id uuid,
	is_system_content boolean
)
returns boolean
language sql
stable
as $$
	select
		public.has_global_role('admin')
		or (
			owner_user_id = auth.uid()
			and is_system_content = false
		);
$$;

drop policy if exists "species_select_visible" on species;
drop policy if exists "species_insert_own" on species;
drop policy if exists "species_update_own" on species;
drop policy if exists "species_delete_own" on species;

create policy "species_select_visible"
on species
for select
to authenticated
using (
	public.can_read_reusable_content(owner_user_id, editorial_status, visibility)
);

create policy "species_insert_own"
on species
for insert
to authenticated
with check (
	public.can_insert_reusable_content(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "species_update_own"
on species
for update
to authenticated
using (
	public.can_update_reusable_content_current(
		owner_user_id,
		is_system_content,
		editorial_status
	)
)
with check (
	public.can_update_reusable_content_target(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "species_delete_own"
on species
for delete
to authenticated
using (
	public.can_delete_reusable_content(owner_user_id, is_system_content)
);

drop policy if exists "subspecies_select_visible" on subspecies;
drop policy if exists "subspecies_insert_own" on subspecies;
drop policy if exists "subspecies_update_own" on subspecies;
drop policy if exists "subspecies_delete_own" on subspecies;

create policy "subspecies_select_visible"
on subspecies
for select
to authenticated
using (
	public.can_read_reusable_content(owner_user_id, editorial_status, visibility)
);

create policy "subspecies_insert_own"
on subspecies
for insert
to authenticated
with check (
	public.can_insert_reusable_content(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "subspecies_update_own"
on subspecies
for update
to authenticated
using (
	public.can_update_reusable_content_current(
		owner_user_id,
		is_system_content,
		editorial_status
	)
)
with check (
	public.can_update_reusable_content_target(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "subspecies_delete_own"
on subspecies
for delete
to authenticated
using (
	public.can_delete_reusable_content(owner_user_id, is_system_content)
);

drop policy if exists "character_classes_select_visible" on character_classes;
drop policy if exists "character_classes_insert_own" on character_classes;
drop policy if exists "character_classes_update_own" on character_classes;
drop policy if exists "character_classes_delete_own" on character_classes;

create policy "character_classes_select_visible"
on character_classes
for select
to authenticated
using (
	public.can_read_reusable_content(owner_user_id, editorial_status, visibility)
);

create policy "character_classes_insert_own"
on character_classes
for insert
to authenticated
with check (
	public.can_insert_reusable_content(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "character_classes_update_own"
on character_classes
for update
to authenticated
using (
	public.can_update_reusable_content_current(
		owner_user_id,
		is_system_content,
		editorial_status
	)
)
with check (
	public.can_update_reusable_content_target(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "character_classes_delete_own"
on character_classes
for delete
to authenticated
using (
	public.can_delete_reusable_content(owner_user_id, is_system_content)
);

drop policy if exists "subclasses_select_visible" on subclasses;
drop policy if exists "subclasses_insert_own" on subclasses;
drop policy if exists "subclasses_update_own" on subclasses;
drop policy if exists "subclasses_delete_own" on subclasses;

create policy "subclasses_select_visible"
on subclasses
for select
to authenticated
using (
	public.can_read_reusable_content(owner_user_id, editorial_status, visibility)
);

create policy "subclasses_insert_own"
on subclasses
for insert
to authenticated
with check (
	public.can_insert_reusable_content(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "subclasses_update_own"
on subclasses
for update
to authenticated
using (
	public.can_update_reusable_content_current(
		owner_user_id,
		is_system_content,
		editorial_status
	)
)
with check (
	public.can_update_reusable_content_target(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "subclasses_delete_own"
on subclasses
for delete
to authenticated
using (
	public.can_delete_reusable_content(owner_user_id, is_system_content)
);

drop policy if exists "backgrounds_select_visible" on backgrounds;
drop policy if exists "backgrounds_insert_own" on backgrounds;
drop policy if exists "backgrounds_update_own" on backgrounds;
drop policy if exists "backgrounds_delete_own" on backgrounds;

create policy "backgrounds_select_visible"
on backgrounds
for select
to authenticated
using (
	public.can_read_reusable_content(owner_user_id, editorial_status, visibility)
);

create policy "backgrounds_insert_own"
on backgrounds
for insert
to authenticated
with check (
	public.can_insert_reusable_content(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "backgrounds_update_own"
on backgrounds
for update
to authenticated
using (
	public.can_update_reusable_content_current(
		owner_user_id,
		is_system_content,
		editorial_status
	)
)
with check (
	public.can_update_reusable_content_target(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "backgrounds_delete_own"
on backgrounds
for delete
to authenticated
using (
	public.can_delete_reusable_content(owner_user_id, is_system_content)
);

drop policy if exists "spells_select_visible" on spells;
drop policy if exists "spells_insert_own" on spells;
drop policy if exists "spells_update_own" on spells;
drop policy if exists "spells_delete_own" on spells;

create policy "spells_select_visible"
on spells
for select
to authenticated
using (
	public.can_read_reusable_content(owner_user_id, editorial_status, visibility)
);

create policy "spells_insert_own"
on spells
for insert
to authenticated
with check (
	public.can_insert_reusable_content(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "spells_update_own"
on spells
for update
to authenticated
using (
	public.can_update_reusable_content_current(
		owner_user_id,
		is_system_content,
		editorial_status
	)
)
with check (
	public.can_update_reusable_content_target(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "spells_delete_own"
on spells
for delete
to authenticated
using (
	public.can_delete_reusable_content(owner_user_id, is_system_content)
);

drop policy if exists "feats_select_visible" on feats;
drop policy if exists "feats_insert_own" on feats;
drop policy if exists "feats_update_own" on feats;
drop policy if exists "feats_delete_own" on feats;

create policy "feats_select_visible"
on feats
for select
to authenticated
using (
	public.can_read_reusable_content(owner_user_id, editorial_status, visibility)
);

create policy "feats_insert_own"
on feats
for insert
to authenticated
with check (
	public.can_insert_reusable_content(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "feats_update_own"
on feats
for update
to authenticated
using (
	public.can_update_reusable_content_current(
		owner_user_id,
		is_system_content,
		editorial_status
	)
)
with check (
	public.can_update_reusable_content_target(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "feats_delete_own"
on feats
for delete
to authenticated
using (
	public.can_delete_reusable_content(owner_user_id, is_system_content)
);

drop policy if exists "equipment_select_visible" on equipment;
drop policy if exists "equipment_insert_own" on equipment;
drop policy if exists "equipment_update_own" on equipment;
drop policy if exists "equipment_delete_own" on equipment;

create policy "equipment_select_visible"
on equipment
for select
to authenticated
using (
	public.can_read_reusable_content(owner_user_id, editorial_status, visibility)
);

create policy "equipment_insert_own"
on equipment
for insert
to authenticated
with check (
	public.can_insert_reusable_content(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "equipment_update_own"
on equipment
for update
to authenticated
using (
	public.can_update_reusable_content_current(
		owner_user_id,
		is_system_content,
		editorial_status
	)
)
with check (
	public.can_update_reusable_content_target(
		owner_user_id,
		is_system_content,
		editorial_status,
		visibility
	)
);

create policy "equipment_delete_own"
on equipment
for delete
to authenticated
using (
	public.can_delete_reusable_content(owner_user_id, is_system_content)
);
