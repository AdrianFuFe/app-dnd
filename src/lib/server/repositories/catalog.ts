import type { SupabaseClient } from '@supabase/supabase-js';
import {
	getE2EBackgroundOption,
	getE2EClassOption,
	getE2EFeatCatalogEntry,
	getE2ESpellCatalogEntry,
	listE2EExpandedContentCatalog,
	getE2ESpeciesOption,
	getE2ESubclassOption,
	getE2ESubspeciesOption,
	isE2EMockSupabaseClient,
	listE2ECatalog
} from '$lib/server/e2e/mock-app';
import type { Database } from '$lib/types/database/supabase';
import type {
	CharacterBackgroundOption,
	CharacterClassOption,
	CharacterCreationCatalog,
	CharacterSpeciesOption,
	CharacterSubclassOption,
	CharacterSubspeciesOption
} from '$lib/types/content/character-catalog';
import type {
	ExpandedContentCatalog,
	FeatCatalogEntry,
	SpellCatalogEntry
} from '$lib/types/content/expanded-content-catalog';
import type { CharacterFeatItem, CharacterSpellItem } from '$lib/types/domain/character';

type SpeciesRow = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	base_speed: number | null;
};

type SubspeciesRow = {
	id: string;
	slug: string;
	species_slug: string;
	name: string;
	summary: string | null;
};

type CharacterClassRow = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	hit_die: number;
};

type SubclassRow = {
	id: string;
	slug: string;
	class_slug: string;
	name: string;
	summary: string | null;
};

type BackgroundRow = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
};

type SpellRow = {
	id: string;
	slug: string;
	name: string;
	level: number;
	school: string;
	casting_time: string | null;
	range_text: string | null;
	components: string | null;
	duration: string | null;
	class_slugs: string[];
	summary: string | null;
	description: string | null;
	concentration: boolean;
	ritual: boolean;
};

type FeatRow = {
	id: string;
	slug: string;
	name: string;
	prerequisites: string[];
	summary: string | null;
	description: string | null;
};

export async function listCharacterCreationCatalog(
	supabase: SupabaseClient<Database>
): Promise<CharacterCreationCatalog> {
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2ECatalog();
	}

	const [speciesOptions, subspeciesOptions, classOptions, subclassOptions, backgroundOptions] =
		await Promise.all([
			listSpeciesOptions(supabase),
			listSubspeciesOptions(supabase),
			listCharacterClassOptions(supabase),
			listSubclassOptions(supabase),
			listBackgroundOptions(supabase)
		]);

	return {
		speciesOptions,
		subspeciesOptions,
		classOptions,
		subclassOptions,
		backgroundOptions
	};
}

export async function listExpandedContentCatalog(
	supabase: SupabaseClient<Database>
): Promise<ExpandedContentCatalog> {
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2EExpandedContentCatalog();
	}

	const [spells, feats] = await Promise.all([
		listSpellCatalogEntries(supabase),
		listFeatCatalogEntries(supabase)
	]);

	return {
		spells,
		feats
	};
}

export async function resolveCharacterCreationCatalogSelections(
	supabase: SupabaseClient<Database>,
	selection: {
		speciesId?: string;
		subspeciesId?: string;
		classId?: string;
		subclassId?: string;
		backgroundId?: string;
	}
): Promise<{
	speciesId?: string;
	race?: string;
	subspeciesId?: string;
	subrace?: string;
	classId?: string;
	className?: string;
	subclassId?: string;
	subclass?: string;
	backgroundId?: string;
	background?: string;
}> {
	if (isE2EMockSupabaseClient(supabase)) {
		const species = selection.speciesId ? getE2ESpeciesOption(selection.speciesId) : undefined;
		const subspecies = selection.subspeciesId
			? getE2ESubspeciesOption(selection.subspeciesId)
			: undefined;
		const characterClass = selection.classId ? getE2EClassOption(selection.classId) : undefined;
		const subclass = selection.subclassId
			? getE2ESubclassOption(selection.subclassId)
			: undefined;
		const background = selection.backgroundId
			? getE2EBackgroundOption(selection.backgroundId)
			: undefined;

		if (selection.speciesId && !species) {
			throw new Error('Please choose a valid species from the catalog.');
		}

		if (selection.subspeciesId && !subspecies) {
			throw new Error('Please choose a valid subspecies from the catalog.');
		}

		if (subspecies && (!species || subspecies.speciesSlug !== species.slug)) {
			throw new Error('Please choose a valid subspecies for the selected species.');
		}

		if (selection.classId && !characterClass) {
			throw new Error('Please choose a valid class from the catalog.');
		}

		if (selection.subclassId && !subclass) {
			throw new Error('Please choose a valid subclass from the catalog.');
		}

		if (subclass && (!characterClass || subclass.classSlug !== characterClass.slug)) {
			throw new Error('Please choose a valid subclass for the selected class.');
		}

		if (selection.backgroundId && !background) {
			throw new Error('Please choose a valid background from the catalog.');
		}

		return {
			speciesId: species?.id,
			race: species?.name,
			subspeciesId: subspecies?.id,
			subrace: subspecies?.name,
			classId: characterClass?.id,
			className: characterClass?.name,
			subclassId: subclass?.id,
			subclass: subclass?.name,
			backgroundId: background?.id,
			background: background?.name
		};
	}

	const [species, subspecies, characterClass, subclass, background] = await Promise.all([
		loadSelectedSpecies(supabase, selection.speciesId),
		loadSelectedSubspecies(supabase, selection.subspeciesId),
		loadSelectedCharacterClass(supabase, selection.classId),
		loadSelectedSubclass(supabase, selection.subclassId),
		loadSelectedBackground(supabase, selection.backgroundId)
	]);

	if (subspecies && (!species || subspecies.species_slug !== species.slug)) {
		throw new Error('Please choose a valid subspecies for the selected species.');
	}

	if (subclass && (!characterClass || subclass.class_slug !== characterClass.slug)) {
		throw new Error('Please choose a valid subclass for the selected class.');
	}

	return {
		speciesId: species?.id,
		race: species?.name,
		subspeciesId: subspecies?.id,
		subrace: subspecies?.name,
		classId: characterClass?.id,
		className: characterClass?.name,
		subclassId: subclass?.id,
		subclass: subclass?.name,
		backgroundId: background?.id,
		background: background?.name
	};
}

export async function resolveCharacterSpellCatalogSelections(
	supabase: SupabaseClient<Database>,
	selection: {
		classId?: string;
		spellItems: CharacterSpellItem[];
	}
): Promise<CharacterSpellItem[]> {
	const linkedSpellIds = selection.spellItems
		.map((item) => item.spellId)
		.filter((spellId): spellId is string => typeof spellId === 'string' && spellId.length > 0);

	if (linkedSpellIds.length === 0) {
		return selection.spellItems;
	}

	if (isE2EMockSupabaseClient(supabase)) {
		const classSlug = selection.classId
			? getE2EClassOption(selection.classId)?.slug
			: undefined;

		return selection.spellItems.map((item) =>
			normalizeCharacterSpellItem(
				item,
				item.spellId ? getE2ESpellCatalogEntry(item.spellId) : undefined,
				classSlug
			)
		);
	}

	const [characterClass, spellEntries] = await Promise.all([
		loadSelectedCharacterClass(supabase, selection.classId),
		loadSelectedSpellCatalogEntries(supabase, linkedSpellIds)
	]);
	const spellEntriesById = new Map(spellEntries.map((entry) => [entry.id, entry]));

	return selection.spellItems.map((item) =>
		normalizeCharacterSpellItem(
			item,
			item.spellId ? spellEntriesById.get(item.spellId) : undefined,
			characterClass?.slug
		)
	);
}

export async function resolveCharacterFeatCatalogSelections(
	supabase: SupabaseClient<Database>,
	selection: {
		featItems: CharacterFeatItem[];
	}
): Promise<CharacterFeatItem[]> {
	const linkedFeatIds = selection.featItems
		.map((item) => item.featId)
		.filter((featId): featId is string => typeof featId === 'string' && featId.length > 0);

	if (linkedFeatIds.length === 0) {
		return selection.featItems;
	}

	if (isE2EMockSupabaseClient(supabase)) {
		return selection.featItems.map((item) =>
			normalizeCharacterFeatItem(
				item,
				item.featId ? getE2EFeatCatalogEntry(item.featId) : undefined
			)
		);
	}

	const featEntries = await loadSelectedFeatCatalogEntries(supabase, linkedFeatIds);
	const featEntriesById = new Map(featEntries.map((entry) => [entry.id, entry]));

	return selection.featItems.map((item) =>
		normalizeCharacterFeatItem(
			item,
			item.featId ? featEntriesById.get(item.featId) : undefined
		)
	);
}

async function listSpeciesOptions(
	supabase: SupabaseClient<Database>
): Promise<CharacterSpeciesOption[]> {
	const { data, error } = await supabase
		.from('species')
		.select('id, slug, name, summary, base_speed')
		.order('name', { ascending: true });

	if (error) {
		throw new Error('Failed to load species catalog options.');
	}

	return data.map(mapSpeciesOption);
}

async function listSubspeciesOptions(
	supabase: SupabaseClient<Database>
): Promise<CharacterSubspeciesOption[]> {
	const { data, error } = await supabase
		.from('subspecies')
		.select('id, slug, species_slug, name, summary')
		.order('name', { ascending: true });

	if (error) {
		throw new Error('Failed to load subspecies catalog options.');
	}

	return data.map(mapSubspeciesOption);
}

async function listCharacterClassOptions(
	supabase: SupabaseClient<Database>
): Promise<CharacterClassOption[]> {
	const { data, error } = await supabase
		.from('character_classes')
		.select('id, slug, name, summary, hit_die')
		.order('name', { ascending: true });

	if (error) {
		throw new Error('Failed to load class catalog options.');
	}

	return data.map(mapCharacterClassOption);
}

async function listSubclassOptions(
	supabase: SupabaseClient<Database>
): Promise<CharacterSubclassOption[]> {
	const { data, error } = await supabase
		.from('subclasses')
		.select('id, slug, class_slug, name, summary')
		.order('name', { ascending: true });

	if (error) {
		throw new Error('Failed to load subclass catalog options.');
	}

	return data.map(mapSubclassOption);
}

async function listBackgroundOptions(
	supabase: SupabaseClient<Database>
): Promise<CharacterBackgroundOption[]> {
	const { data, error } = await supabase
		.from('backgrounds')
		.select('id, slug, name, summary')
		.order('name', { ascending: true });

	if (error) {
		throw new Error('Failed to load background catalog options.');
	}

	return data.map(mapBackgroundOption);
}

async function loadSelectedSpecies(
	supabase: SupabaseClient<Database>,
	speciesId?: string
): Promise<Pick<SpeciesRow, 'id' | 'slug' | 'name'> | undefined> {
	if (!speciesId) {
		return undefined;
	}

	const { data, error } = await supabase
		.from('species')
		.select('id, slug, name')
		.eq('id', speciesId)
		.single();

	if (error || !data) {
		throw new Error('Please choose a valid species from the catalog.');
	}

	return data;
}

async function loadSelectedSubspecies(
	supabase: SupabaseClient<Database>,
	subspeciesId?: string
): Promise<Pick<SubspeciesRow, 'id' | 'species_slug' | 'name'> | undefined> {
	if (!subspeciesId) {
		return undefined;
	}

	const { data, error } = await supabase
		.from('subspecies')
		.select('id, species_slug, name')
		.eq('id', subspeciesId)
		.single();

	if (error || !data) {
		throw new Error('Please choose a valid subspecies from the catalog.');
	}

	return data;
}

async function loadSelectedCharacterClass(
	supabase: SupabaseClient<Database>,
	classId?: string
): Promise<Pick<CharacterClassRow, 'id' | 'slug' | 'name'> | undefined> {
	if (!classId) {
		return undefined;
	}

	const { data, error } = await supabase
		.from('character_classes')
		.select('id, slug, name')
		.eq('id', classId)
		.single();

	if (error || !data) {
		throw new Error('Please choose a valid class from the catalog.');
	}

	return data;
}

async function loadSelectedSubclass(
	supabase: SupabaseClient<Database>,
	subclassId?: string
): Promise<Pick<SubclassRow, 'id' | 'class_slug' | 'name'> | undefined> {
	if (!subclassId) {
		return undefined;
	}

	const { data, error } = await supabase
		.from('subclasses')
		.select('id, class_slug, name')
		.eq('id', subclassId)
		.single();

	if (error || !data) {
		throw new Error('Please choose a valid subclass from the catalog.');
	}

	return data;
}

async function loadSelectedBackground(
	supabase: SupabaseClient<Database>,
	backgroundId?: string
): Promise<Pick<BackgroundRow, 'id' | 'name'> | undefined> {
	if (!backgroundId) {
		return undefined;
	}

	const { data, error } = await supabase
		.from('backgrounds')
		.select('id, name')
		.eq('id', backgroundId)
		.single();

	if (error || !data) {
		throw new Error('Please choose a valid background from the catalog.');
	}

	return data;
}

function mapSpeciesOption(
	species: Pick<SpeciesRow, 'id' | 'slug' | 'name' | 'summary' | 'base_speed'>
): CharacterSpeciesOption {
	return {
		id: species.id,
		slug: species.slug,
		name: species.name,
		summary: species.summary,
		baseSpeed: species.base_speed
	};
}

function mapSubspeciesOption(
	subspecies: Pick<SubspeciesRow, 'id' | 'slug' | 'species_slug' | 'name' | 'summary'>
): CharacterSubspeciesOption {
	return {
		id: subspecies.id,
		slug: subspecies.slug,
		speciesSlug: subspecies.species_slug,
		name: subspecies.name,
		summary: subspecies.summary
	};
}

function mapCharacterClassOption(
	characterClass: Pick<CharacterClassRow, 'id' | 'slug' | 'name' | 'summary' | 'hit_die'>
): CharacterClassOption {
	return {
		id: characterClass.id,
		slug: characterClass.slug,
		name: characterClass.name,
		summary: characterClass.summary,
		hitDie: characterClass.hit_die
	};
}

function mapSubclassOption(
	subclass: Pick<SubclassRow, 'id' | 'slug' | 'class_slug' | 'name' | 'summary'>
): CharacterSubclassOption {
	return {
		id: subclass.id,
		slug: subclass.slug,
		classSlug: subclass.class_slug,
		name: subclass.name,
		summary: subclass.summary
	};
}

function mapBackgroundOption(
	background: Pick<BackgroundRow, 'id' | 'slug' | 'name' | 'summary'>
): CharacterBackgroundOption {
	return {
		id: background.id,
		slug: background.slug,
		name: background.name,
		summary: background.summary
	};
}

async function listSpellCatalogEntries(
	supabase: SupabaseClient<Database>
): Promise<SpellCatalogEntry[]> {
	const { data, error } = await supabase
		.from('spells')
		.select(
			'id, slug, name, level, school, casting_time, range_text, components, duration, class_slugs, summary, description, concentration, ritual'
		)
		.order('level', { ascending: true })
		.order('name', { ascending: true });

	if (error) {
		throw new Error('Failed to load spell catalog entries.');
	}

	return data.map(mapSpellCatalogEntry);
}

async function loadSelectedSpellCatalogEntries(
	supabase: SupabaseClient<Database>,
	spellIds: string[]
): Promise<SpellCatalogEntry[]> {
	const { data, error } = await supabase
		.from('spells')
		.select(
			'id, slug, name, level, school, casting_time, range_text, components, duration, class_slugs, summary, description, concentration, ritual'
		)
		.in('id', spellIds);

	if (error) {
		throw new Error('Failed to load selected spell catalog entries.');
	}

	return data.map(mapSpellCatalogEntry);
}

async function listFeatCatalogEntries(
	supabase: SupabaseClient<Database>
): Promise<FeatCatalogEntry[]> {
	const { data, error } = await supabase
		.from('feats')
		.select('id, slug, name, prerequisites, summary, description')
		.order('name', { ascending: true });

	if (error) {
		throw new Error('Failed to load feat catalog entries.');
	}

	return data.map(mapFeatCatalogEntry);
}

async function loadSelectedFeatCatalogEntries(
	supabase: SupabaseClient<Database>,
	featIds: string[]
): Promise<FeatCatalogEntry[]> {
	const { data, error } = await supabase
		.from('feats')
		.select('id, slug, name, prerequisites, summary, description')
		.in('id', featIds);

	if (error) {
		throw new Error('Failed to load selected feat catalog entries.');
	}

	return data.map(mapFeatCatalogEntry);
}

function mapSpellCatalogEntry(
	spell: Pick<
		SpellRow,
		| 'id'
		| 'slug'
		| 'name'
		| 'level'
		| 'school'
		| 'casting_time'
		| 'range_text'
		| 'components'
		| 'duration'
		| 'class_slugs'
		| 'summary'
		| 'description'
		| 'concentration'
		| 'ritual'
	>
): SpellCatalogEntry {
	return {
		id: spell.id,
		slug: spell.slug,
		name: spell.name,
		level: spell.level,
		school: spell.school,
		castingTime: spell.casting_time,
		range: spell.range_text,
		components: spell.components,
		duration: spell.duration,
		classSlugs: spell.class_slugs,
		summary: spell.summary,
		description: spell.description,
		concentration: spell.concentration,
		ritual: spell.ritual
	};
}

function mapFeatCatalogEntry(
	feat: Pick<FeatRow, 'id' | 'slug' | 'name' | 'prerequisites' | 'summary' | 'description'>
): FeatCatalogEntry {
	return {
		id: feat.id,
		slug: feat.slug,
		name: feat.name,
		prerequisites: feat.prerequisites,
		summary: feat.summary,
		description: feat.description
	};
}

function normalizeCharacterSpellItem(
	item: CharacterSpellItem,
	spell: SpellCatalogEntry | undefined,
	classSlug: string | undefined
): CharacterSpellItem {
	if (!item.spellId) {
		return item;
	}

	if (!spell) {
		throw new Error('Please choose a valid spell from the catalog.');
	}

	if (classSlug && spell.classSlugs.length > 0 && !spell.classSlugs.includes(classSlug)) {
		throw new Error('Please choose a valid spell for the selected class.');
	}

	return {
		...item,
		spellId: spell.id,
		name: spell.name,
		level: spell.level,
		school: spell.school,
		castingTime: spell.castingTime ?? undefined,
		range: spell.range ?? undefined,
		components: spell.components ?? undefined,
		duration: spell.duration ?? undefined,
		description: item.description ?? spell.description ?? spell.summary ?? undefined
	};
}

function normalizeCharacterFeatItem(
	item: CharacterFeatItem,
	feat: FeatCatalogEntry | undefined
): CharacterFeatItem {
	if (!item.featId) {
		return item;
	}

	if (!feat) {
		throw new Error('Please choose a valid feat from the catalog.');
	}

	return {
		...item,
		featId: feat.id,
		name: feat.name,
		description: item.description ?? feat.description ?? feat.summary ?? undefined
	};
}
