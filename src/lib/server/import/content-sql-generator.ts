import { readFileSync } from 'node:fs';
import path from 'node:path';

type Visibility = 'private' | 'campaign' | 'shared' | 'public';

interface SpeciesItem {
	slug: string;
	name: string;
	summary?: string | null;
	description?: string | null;
	size?: string;
	baseSpeed?: number;
	languages?: string[];
	subspeciesSlugs?: string[];
	visibility?: Visibility;
	mechanics?: unknown[];
}

interface SubspeciesItem {
	slug: string;
	name: string;
	speciesSlug: string;
	summary?: string | null;
	description?: string | null;
	visibility?: Visibility;
	mechanics?: unknown[];
}

interface CharacterClassItem {
	slug: string;
	name: string;
	hitDie: number;
	primaryAbilities: string[];
	savingThrowProficiencies: string[];
	armorProficiencies?: string[];
	weaponProficiencies?: string[];
	toolProficiencies?: string[];
	skillChoices?: unknown;
	startingEquipment?: unknown[];
	spellcastingAbility?: string | null;
	progression?: unknown[];
	summary?: string | null;
	description?: string | null;
	visibility?: Visibility;
	mechanics?: unknown[];
}

interface SubclassItem {
	slug: string;
	name: string;
	classSlug: string;
	summary?: string | null;
	description?: string | null;
	visibility?: Visibility;
	grantedSpellsByLevel?: unknown[];
	features?: unknown[];
	mechanics?: unknown[];
}

interface BackgroundItem {
	slug: string;
	name: string;
	skillProficiencies?: string[];
	toolProficiencies?: string[];
	languages?: string[];
	equipment?: string[];
	featureName?: string | null;
	summary?: string | null;
	description?: string | null;
	visibility?: Visibility;
	mechanics?: unknown[];
}

interface SpellItem {
	slug: string;
	name: string;
	level: number;
	school: string;
	castingTime?: string;
	range?: string;
	components?: string;
	materials?: string | null;
	duration?: string;
	concentration?: boolean;
	ritual?: boolean;
	classSlugs?: string[];
	summary?: string | null;
	description?: string | null;
	visibility?: Visibility;
	mechanics?: unknown[];
}

interface ContentFile<T> {
	items: T[];
}

function readJsonFile<T>(relativePath: string): T {
	const filePath = path.resolve(process.cwd(), relativePath);
	return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
}

function sqlString(value: string | null | undefined): string {
	if (value == null) {
		return 'null';
	}

	return `'${value.replaceAll("'", "''")}'`;
}

function sqlTextArray(values: string[] | undefined): string {
	const safeValues = values ?? [];

	if (safeValues.length === 0) {
		return "'{}'::text[]";
	}

	return `array[${safeValues.map((value) => sqlString(value)).join(', ')}]::text[]`;
}

function sqlJson(value: unknown): string {
	return `${sqlString(JSON.stringify(value ?? []))}::jsonb`;
}

function sqlVisibility(value: Visibility | undefined): string {
	return sqlString(value ?? 'public');
}

function sourceIdSql(code: string): string {
	return `(select id from content_sources where code = ${sqlString(code)})`;
}

function buildInsert(tableName: string, columns: string[], rows: string[]): string {
	if (rows.length === 0) {
		return `-- No rows for ${tableName}`;
	}

	return [
		`insert into ${tableName} (${columns.join(', ')})`,
		'values',
		rows
			.map(
				(row, index) =>
					`${index === rows.length - 1 ? '\t' : '\t'}(${row})${index === rows.length - 1 ? '' : ','}`
			)
			.join('\n'),
		'on conflict do nothing;',
		''
	].join('\n');
}

export function generateSrdCatalogSeedSql(): string {
	const speciesFile = readJsonFile<ContentFile<SpeciesItem>>('data/srd-5-1/species.json');
	const subspeciesFile = readJsonFile<ContentFile<SubspeciesItem>>(
		'data/srd-5-1/subspecies.json'
	);
	const classesFile = readJsonFile<ContentFile<CharacterClassItem>>('data/srd-5-1/classes.json');
	const subclassesFile = readJsonFile<ContentFile<SubclassItem>>('data/srd-5-1/subclasses.json');
	const backgroundsFile = readJsonFile<ContentFile<BackgroundItem>>('data/srd-5-1/backgrounds.json');
	const spellsFile = readJsonFile<ContentFile<SpellItem>>('data/srd-5-1/spells.json');

	const sourceId = sourceIdSql('srd-5-1');

	const speciesSql = buildInsert(
		'species',
		[
			'owner_user_id',
			'source_id',
			'visibility',
			'slug',
			'name',
			'summary',
			'description',
			'size',
			'base_speed',
			'languages',
			'subspecies_slugs',
			'mechanics',
			'is_system_content'
		],
		speciesFile.items.map((item) =>
			[
				'null',
				sourceId,
				sqlVisibility(item.visibility),
				sqlString(item.slug),
				sqlString(item.name),
				sqlString(item.summary ?? null),
				sqlString(item.description ?? null),
				sqlString(item.size ?? null),
				item.baseSpeed ?? 'null',
				sqlTextArray(item.languages),
				sqlTextArray(item.subspeciesSlugs),
				sqlJson(item.mechanics ?? []),
				'true'
			].join(', ')
		)
	);

	const subspeciesSql = buildInsert(
		'subspecies',
		[
			'owner_user_id',
			'source_id',
			'visibility',
			'species_slug',
			'slug',
			'name',
			'summary',
			'description',
			'mechanics',
			'is_system_content'
		],
		subspeciesFile.items.map((item) =>
			[
				'null',
				sourceId,
				sqlVisibility(item.visibility),
				sqlString(item.speciesSlug),
				sqlString(item.slug),
				sqlString(item.name),
				sqlString(item.summary ?? null),
				sqlString(item.description ?? null),
				sqlJson(item.mechanics ?? []),
				'true'
			].join(', ')
		)
	);

	const classesSql = buildInsert(
		'character_classes',
		[
			'owner_user_id',
			'source_id',
			'visibility',
			'slug',
			'name',
			'hit_die',
			'primary_abilities',
			'saving_throw_proficiencies',
			'armor_proficiencies',
			'weapon_proficiencies',
			'tool_proficiencies',
			'skill_choices',
			'starting_equipment',
			'spellcasting_ability',
			'progression',
			'summary',
			'description',
			'mechanics',
			'is_system_content'
		],
		classesFile.items.map((item) =>
			[
				'null',
				sourceId,
				sqlVisibility(item.visibility),
				sqlString(item.slug),
				sqlString(item.name),
				item.hitDie,
				sqlTextArray(item.primaryAbilities),
				sqlTextArray(item.savingThrowProficiencies),
				sqlTextArray(item.armorProficiencies),
				sqlTextArray(item.weaponProficiencies),
				sqlTextArray(item.toolProficiencies),
				sqlJson(item.skillChoices ?? {}),
				sqlJson(item.startingEquipment ?? []),
				sqlString(item.spellcastingAbility ?? null),
				sqlJson(item.progression ?? []),
				sqlString(item.summary ?? null),
				sqlString(item.description ?? null),
				sqlJson(item.mechanics ?? []),
				'true'
			].join(', ')
		)
	);

	const subclassesSql = buildInsert(
		'subclasses',
		[
			'owner_user_id',
			'source_id',
			'visibility',
			'class_slug',
			'slug',
			'name',
			'summary',
			'description',
			'granted_spells_by_level',
			'features',
			'mechanics',
			'is_system_content'
		],
		subclassesFile.items.map((item) =>
			[
				'null',
				sourceId,
				sqlVisibility(item.visibility),
				sqlString(item.classSlug),
				sqlString(item.slug),
				sqlString(item.name),
				sqlString(item.summary ?? null),
				sqlString(item.description ?? null),
				sqlJson(item.grantedSpellsByLevel ?? []),
				sqlJson(item.features ?? []),
				sqlJson(item.mechanics ?? []),
				'true'
			].join(', ')
		)
	);

	const backgroundsSql = buildInsert(
		'backgrounds',
		[
			'owner_user_id',
			'source_id',
			'visibility',
			'slug',
			'name',
			'skill_proficiencies',
			'tool_proficiencies',
			'languages',
			'equipment',
			'feature_name',
			'summary',
			'description',
			'mechanics',
			'is_system_content'
		],
		backgroundsFile.items.map((item) =>
			[
				'null',
				sourceId,
				sqlVisibility(item.visibility),
				sqlString(item.slug),
				sqlString(item.name),
				sqlTextArray(item.skillProficiencies),
				sqlTextArray(item.toolProficiencies),
				sqlTextArray(item.languages),
				sqlTextArray(item.equipment),
				sqlString(item.featureName ?? null),
				sqlString(item.summary ?? null),
				sqlString(item.description ?? null),
				sqlJson(item.mechanics ?? []),
				'true'
			].join(', ')
		)
	);

	const spellsSql = buildInsert(
		'spells',
		[
			'owner_user_id',
			'source_id',
			'visibility',
			'slug',
			'name',
			'level',
			'school',
			'casting_time',
			'range_text',
			'components',
			'materials',
			'duration',
			'concentration',
			'ritual',
			'class_slugs',
			'summary',
			'description',
			'mechanics',
			'is_system_content'
		],
		spellsFile.items.map((item) =>
			[
				'null',
				sourceId,
				sqlVisibility(item.visibility),
				sqlString(item.slug),
				sqlString(item.name),
				item.level,
				sqlString(item.school),
				sqlString(item.castingTime ?? null),
				sqlString(item.range ?? null),
				sqlString(item.components ?? null),
				sqlString(item.materials ?? null),
				sqlString(item.duration ?? null),
				item.concentration ?? false,
				item.ritual ?? false,
				sqlTextArray(item.classSlugs),
				sqlString(item.summary ?? null),
				sqlString(item.description ?? null),
				sqlJson(item.mechanics ?? []),
				'true'
			].join(', ')
		)
	);

	return [
		'-- Generated from data/srd-5-1/*.json',
		'-- Run after 001_initial_schema.sql and 003_content_sources_seed.sql',
		'',
		speciesSql,
		subspeciesSql,
		classesSql,
		subclassesSql,
		backgroundsSql,
		spellsSql
	].join('\n');
}
