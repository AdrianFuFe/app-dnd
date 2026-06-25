import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database/supabase';
import type { CharacterCreateInput } from '$lib/types/domain/character';

type CharactersInsert = Database['public']['Tables']['characters']['Insert'];
type CharacterStatsInsert = Database['public']['Tables']['character_stats']['Insert'];
type CharacterCombatStatsInsert = Database['public']['Tables']['character_combat_stats']['Insert'];
type CharacterTextSectionsInsert =
	Database['public']['Tables']['character_text_sections']['Insert'];

export type CharacterListItem = {
	id: string;
	name: string;
	level: number;
	race: string | null;
	className: string | null;
	updatedAt: string;
};

export type CharacterDetail = CharacterCreateInput & {
	id: string;
	updatedAt: string;
};

export async function listCharactersForUser(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<CharacterListItem[]> {
	const { data, error } = await supabase
		.from('characters')
		.select('id, name, level, race, class_name, updated_at')
		.eq('user_id', userId)
		.order('updated_at', { ascending: false });

	if (error) {
		throw new Error(`Failed to load characters for user ${userId}`);
	}

	return data.map((character) => ({
		id: character.id,
		name: character.name,
		level: character.level,
		race: character.race,
		className: character.class_name,
		updatedAt: character.updated_at
	}));
}

export async function createCharacter(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: CharacterCreateInput
): Promise<{ id: string; name: string }> {
	const characterInsert: CharactersInsert = {
		user_id: userId,
		...toCharacterRowFields(input)
	};

	const { data: character, error: characterError } = await supabase
		.from('characters')
		.insert(characterInsert)
		.select('id, name')
		.single();

	if (characterError || !character) {
		throw new Error(`Failed to create character for user ${userId}`);
	}

	const statsInsert: CharacterStatsInsert = {
		character_id: character.id,
		...toCharacterStatsFields(input)
	};

	const combatStatsInsert: CharacterCombatStatsInsert = {
		character_id: character.id,
		...toCharacterCombatStatsFields(input)
	};

	const textSectionsInsert: CharacterTextSectionsInsert = {
		character_id: character.id,
		...toCharacterTextSectionsFields(input)
	};

	const [statsResult, combatResult, textResult] = await Promise.all([
		supabase.from('character_stats').insert(statsInsert),
		supabase.from('character_combat_stats').insert(combatStatsInsert),
		supabase.from('character_text_sections').insert(textSectionsInsert)
	]);

	const childError = statsResult.error ?? combatResult.error ?? textResult.error;

	if (childError) {
		await supabase.from('characters').delete().eq('id', character.id).eq('user_id', userId);
		throw new Error(`Failed to create character details for user ${userId}`);
	}

	return character;
}

export async function getCharacterForUser(
	supabase: SupabaseClient<Database>,
	userId: string,
	characterId: string
): Promise<CharacterDetail | null> {
	const { data: character, error: characterError } = await supabase
		.from('characters')
		.select(
			'id, name, species_id, subspecies_id, class_id, subclass_id, background_id, race, subrace, class_name, subclass, level, background, story, updated_at'
		)
		.eq('id', characterId)
		.eq('user_id', userId)
		.maybeSingle();

	if (characterError) {
		throw new Error(`Failed to load character ${characterId} for user ${userId}`);
	}

	if (!character) {
		return null;
	}

	const [statsResult, combatResult, textResult] = await Promise.all([
		supabase
			.from('character_stats')
			.select('strength, dexterity, constitution, intelligence, wisdom, charisma')
			.eq('character_id', characterId)
			.maybeSingle(),
		supabase
			.from('character_combat_stats')
			.select('max_hp, current_hp, temporary_hp, armor_class, initiative, speed, hit_dice')
			.eq('character_id', characterId)
			.maybeSingle(),
		supabase
			.from('character_text_sections')
			.select('attacks, spells, inventory, notes')
			.eq('character_id', characterId)
			.maybeSingle()
	]);

	const childError = statsResult.error ?? combatResult.error ?? textResult.error;

	if (childError || !statsResult.data || !combatResult.data || !textResult.data) {
		throw new Error(`Failed to load character details for user ${userId}`);
	}

	return {
		id: character.id,
		name: character.name,
		speciesId: character.species_id ?? undefined,
		subspeciesId: character.subspecies_id ?? undefined,
		classId: character.class_id ?? undefined,
		subclassId: character.subclass_id ?? undefined,
		backgroundId: character.background_id ?? undefined,
		race: character.race ?? undefined,
		subrace: character.subrace ?? undefined,
		className: character.class_name ?? undefined,
		subclass: character.subclass ?? undefined,
		level: character.level,
		background: character.background ?? undefined,
		story: character.story ?? undefined,
		strength: statsResult.data.strength,
		dexterity: statsResult.data.dexterity,
		constitution: statsResult.data.constitution,
		intelligence: statsResult.data.intelligence,
		wisdom: statsResult.data.wisdom,
		charisma: statsResult.data.charisma,
		maxHp: combatResult.data.max_hp,
		currentHp: combatResult.data.current_hp,
		temporaryHp: combatResult.data.temporary_hp,
		armorClass: combatResult.data.armor_class,
		initiative: combatResult.data.initiative,
		speed: combatResult.data.speed,
		hitDice: combatResult.data.hit_dice ?? undefined,
		attacks: textResult.data.attacks ?? undefined,
		spells: textResult.data.spells ?? undefined,
		inventory: textResult.data.inventory ?? undefined,
		notes: textResult.data.notes ?? undefined,
		updatedAt: character.updated_at
	};
}

export async function updateCharacter(
	supabase: SupabaseClient<Database>,
	userId: string,
	characterId: string,
	input: CharacterCreateInput
): Promise<{ id: string; name: string }> {
	const { data: character, error: characterError } = await supabase
		.from('characters')
		.update(toCharacterRowFields(input))
		.eq('id', characterId)
		.eq('user_id', userId)
		.select('id, name')
		.maybeSingle();

	if (characterError) {
		throw new Error(`Failed to update character ${characterId} for user ${userId}`);
	}

	if (!character) {
		throw new Error(`Character ${characterId} was not found for user ${userId}`);
	}

	const [statsResult, combatResult, textResult] = await Promise.all([
		supabase
			.from('character_stats')
			.update(toCharacterStatsFields(input))
			.eq('character_id', characterId),
		supabase
			.from('character_combat_stats')
			.update(toCharacterCombatStatsFields(input))
			.eq('character_id', characterId),
		supabase
			.from('character_text_sections')
			.update(toCharacterTextSectionsFields(input))
			.eq('character_id', characterId)
	]);

	const childError = statsResult.error ?? combatResult.error ?? textResult.error;

	if (childError) {
		throw new Error(`Failed to update character details for user ${userId}`);
	}

	return character;
}

function toCharacterRowFields(input: CharacterCreateInput): Omit<CharactersInsert, 'user_id'> {
	return {
		name: input.name,
		species_id: input.speciesId ?? null,
		subspecies_id: input.subspeciesId ?? null,
		class_id: input.classId ?? null,
		subclass_id: input.subclassId ?? null,
		background_id: input.backgroundId ?? null,
		race: input.race ?? null,
		subrace: input.subrace ?? null,
		class_name: input.className ?? null,
		subclass: input.subclass ?? null,
		level: input.level,
		background: input.background ?? null,
		story: input.story ?? null
	};
}

function toCharacterStatsFields(
	input: CharacterCreateInput
): Omit<CharacterStatsInsert, 'character_id'> {
	return {
		strength: input.strength,
		dexterity: input.dexterity,
		constitution: input.constitution,
		intelligence: input.intelligence,
		wisdom: input.wisdom,
		charisma: input.charisma
	};
}

function toCharacterCombatStatsFields(
	input: CharacterCreateInput
): Omit<CharacterCombatStatsInsert, 'character_id'> {
	return {
		max_hp: input.maxHp,
		current_hp: input.currentHp,
		temporary_hp: input.temporaryHp,
		armor_class: input.armorClass,
		initiative: input.initiative,
		speed: input.speed,
		hit_dice: input.hitDice ?? null
	};
}

function toCharacterTextSectionsFields(
	input: CharacterCreateInput
): Omit<CharacterTextSectionsInsert, 'character_id'> {
	return {
		attacks: input.attacks ?? null,
		spells: input.spells ?? null,
		inventory: input.inventory ?? null,
		notes: input.notes ?? null
	};
}
