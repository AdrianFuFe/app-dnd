import type { SupabaseClient } from '@supabase/supabase-js';
import {
	getE2EClassOption,
	getE2ESpeciesOption,
	isE2EMockSupabaseClient,
	listE2ECatalog
} from '$lib/server/e2e/mock-app';
import type { Database } from '$lib/types/database/supabase';
import type {
	CharacterClassOption,
	CharacterCreationCatalog,
	CharacterSpeciesOption
} from '$lib/types/content/character-catalog';

type SpeciesRow = Database['public']['Tables']['species']['Row'];
type CharacterClassRow = Database['public']['Tables']['character_classes']['Row'];

export async function listCharacterCreationCatalog(
	supabase: SupabaseClient<Database>
): Promise<CharacterCreationCatalog> {
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2ECatalog();
	}

	const [speciesOptions, classOptions] = await Promise.all([
		listSpeciesOptions(supabase),
		listCharacterClassOptions(supabase)
	]);

	return {
		speciesOptions,
		classOptions
	};
}

export async function resolveCharacterCreationCatalogSelections(
	supabase: SupabaseClient<Database>,
	selection: {
		speciesId?: string;
		classId?: string;
	}
): Promise<{
		speciesId?: string;
		race?: string;
		classId?: string;
		className?: string;
	}> {
	if (isE2EMockSupabaseClient(supabase)) {
		const species = selection.speciesId ? getE2ESpeciesOption(selection.speciesId) : undefined;
		const characterClass = selection.classId
			? getE2EClassOption(selection.classId)
			: undefined;

		if (selection.speciesId && !species) {
			throw new Error('Please choose a valid species from the catalog.');
		}

		if (selection.classId && !characterClass) {
			throw new Error('Please choose a valid class from the catalog.');
		}

		return {
			speciesId: species?.id,
			race: species?.name,
			classId: characterClass?.id,
			className: characterClass?.name
		};
	}

	const [species, characterClass] = await Promise.all([
		loadSelectedSpecies(supabase, selection.speciesId),
		loadSelectedCharacterClass(supabase, selection.classId)
	]);

	return {
		speciesId: species?.id,
		race: species?.name,
		classId: characterClass?.id,
		className: characterClass?.name
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

async function loadSelectedSpecies(
	supabase: SupabaseClient<Database>,
	speciesId?: string
): Promise<Pick<SpeciesRow, 'id' | 'name'> | undefined> {
	if (!speciesId) {
		return undefined;
	}

	const { data, error } = await supabase.from('species').select('id, name').eq('id', speciesId).single();

	if (error || !data) {
		throw new Error('Please choose a valid species from the catalog.');
	}

	return data;
}

async function loadSelectedCharacterClass(
	supabase: SupabaseClient<Database>,
	classId?: string
): Promise<Pick<CharacterClassRow, 'id' | 'name'> | undefined> {
	if (!classId) {
		return undefined;
	}

	const { data, error } = await supabase
		.from('character_classes')
		.select('id, name')
		.eq('id', classId)
		.single();

	if (error || !data) {
		throw new Error('Please choose a valid class from the catalog.');
	}

	return data;
}

function mapSpeciesOption(species: Pick<SpeciesRow, 'id' | 'slug' | 'name' | 'summary' | 'base_speed'>): CharacterSpeciesOption {
	return {
		id: species.id,
		slug: species.slug,
		name: species.name,
		summary: species.summary,
		baseSpeed: species.base_speed
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
