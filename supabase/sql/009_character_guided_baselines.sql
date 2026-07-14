alter table character_content_profiles
add column if not exists guided_baseline jsonb;

alter table character_content_profiles
drop constraint if exists character_content_profiles_guided_baseline_check;

alter table character_content_profiles
add constraint character_content_profiles_guided_baseline_check
check (
	guided_baseline is null
	or jsonb_typeof(guided_baseline) = 'object'
);
