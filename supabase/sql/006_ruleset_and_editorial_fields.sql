alter table characters
add column if not exists ruleset_code text not null default 'dnd-2014-srd',
add column if not exists content_mode text not null default 'canon'
	check (content_mode in ('canon', 'custom'));

alter table species
add column if not exists ruleset_code text not null default 'dnd-2014-srd',
add column if not exists content_mode text not null default 'canon'
	check (content_mode in ('canon', 'custom')),
add column if not exists editorial_status text not null default 'published'
	check (editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired'));

alter table subspecies
add column if not exists ruleset_code text not null default 'dnd-2014-srd',
add column if not exists content_mode text not null default 'canon'
	check (content_mode in ('canon', 'custom')),
add column if not exists editorial_status text not null default 'published'
	check (editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired'));

alter table character_classes
add column if not exists ruleset_code text not null default 'dnd-2014-srd',
add column if not exists content_mode text not null default 'canon'
	check (content_mode in ('canon', 'custom')),
add column if not exists editorial_status text not null default 'published'
	check (editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired'));

alter table subclasses
add column if not exists ruleset_code text not null default 'dnd-2014-srd',
add column if not exists content_mode text not null default 'canon'
	check (content_mode in ('canon', 'custom')),
add column if not exists editorial_status text not null default 'published'
	check (editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired'));

alter table backgrounds
add column if not exists ruleset_code text not null default 'dnd-2014-srd',
add column if not exists content_mode text not null default 'canon'
	check (content_mode in ('canon', 'custom')),
add column if not exists editorial_status text not null default 'published'
	check (editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired'));

alter table spells
add column if not exists ruleset_code text not null default 'dnd-2014-srd',
add column if not exists content_mode text not null default 'canon'
	check (content_mode in ('canon', 'custom')),
add column if not exists editorial_status text not null default 'published'
	check (editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired'));

alter table feats
add column if not exists ruleset_code text not null default 'dnd-2014-srd',
add column if not exists content_mode text not null default 'canon'
	check (content_mode in ('canon', 'custom')),
add column if not exists editorial_status text not null default 'published'
	check (editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired'));

alter table equipment
add column if not exists ruleset_code text not null default 'dnd-2014-srd',
add column if not exists content_mode text not null default 'canon'
	check (content_mode in ('canon', 'custom')),
add column if not exists editorial_status text not null default 'published'
	check (editorial_status in ('private_draft', 'shared_draft', 'in_review', 'published', 'retired'));
