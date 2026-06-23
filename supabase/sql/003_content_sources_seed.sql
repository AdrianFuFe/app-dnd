-- Seed data for content source metadata.
-- Safe to run multiple times thanks to upsert by code.

insert into content_sources (
	code,
	name,
	license,
	attribution,
	is_system_source
)
values
	(
		'srd-5-1',
		'System Reference Document 5.1',
		'CC BY 4.0',
		'Includes material from the System Reference Document 5.1 by Wizards of the Coast LLC, licensed under Creative Commons Attribution 4.0 International.',
		true
	),
	(
		'srd-5-2',
		'System Reference Document 5.2',
		'CC BY 4.0',
		'Reserved for future SRD 5.2-compatible content if adopted by the project.',
		true
	),
	(
		'user-private',
		'User Private Content',
		null,
		'User-authored private content stored for personal use.',
		false
	),
	(
		'homebrew',
		'Homebrew Content',
		null,
		'User-authored customized or derivative game content.',
		false
	)
on conflict (code) do update
set
	name = excluded.name,
	license = excluded.license,
	attribution = excluded.attribution,
	is_system_source = excluded.is_system_source;
