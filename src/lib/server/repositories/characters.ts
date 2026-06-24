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
		strength: input.strength,
		dexterity: input.dexterity,
		constitution: input.constitution,
		intelligence: input.intelligence,
		wisdom: input.wisdom,
		charisma: input.charisma
	};

	const combatStatsInsert: CharacterCombatStatsInsert = {
		character_id: character.id,
		max_hp: input.maxHp,
		current_hp: input.currentHp,
		temporary_hp: input.temporaryHp,
		armor_class: input.armorClass,
		initiative: input.initiative,
		speed: input.speed,
		hit_dice: input.hitDice ?? null
	};

	const textSectionsInsert: CharacterTextSectionsInsert = {
		character_id: character.id,
		attacks: input.attacks ?? null,
		spells: input.spells ?? null,
		inventory: input.inventory ?? null,
		notes: input.notes ?? null
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
