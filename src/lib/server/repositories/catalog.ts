import type { SupabaseClient } from '@supabase/supabase-js';
import {
	getE2EBackgroundOption,
	getE2EClassOption,
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
