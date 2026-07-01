import type { SupabaseClient } from '@supabase/supabase-js';
import {
	createE2ECharacterForUser,
	deleteE2ECharacterForUser,
	getE2ECharacterForUser,
	isE2EMockSupabaseClient,
	listE2ECharactersForUser,
	updateE2ECharacterForUser
} from '$lib/server/e2e/mock-app';
import type { Database } from '$lib/types/database/supabase';
import type {
	CharacterAttackItem,
	CharacterCreateInput,
	CharacterFeatItem,
	CharacterInventoryItem,
	CharacterSpellItem
} from '$lib/types/domain/character';

type CharactersInsert = Database['public']['Tables']['characters']['Insert'];
type CharacterStatsInsert = Database['public']['Tables']['character_stats']['Insert'];
type CharacterCombatStatsInsert = Database['public']['Tables']['character_combat_stats']['Insert'];
type CharacterTextSectionsInsert =
	Database['public']['Tables']['character_text_sections']['Insert'];
type CharacterAttackInsert = Database['public']['Tables']['character_attacks']['Insert'];
type CharacterAttackRow = Database['public']['Tables']['character_attacks']['Row'];
type CharacterSpellInsert = Database['public']['Tables']['character_spells']['Insert'];
type CharacterSpellRow = Database['public']['Tables']['character_spells']['Row'];
type CharacterFeatInsert = Database['public']['Tables']['character_feats']['Insert'];
type CharacterFeatRow = Database['public']['Tables']['character_feats']['Row'];
type CharacterInventoryItemInsert =
	Database['public']['Tables']['character_inventory_items']['Insert'];

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
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2ECharactersForUser(userId);
	}

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
	if (isE2EMockSupabaseClient(supabase)) {
		return createE2ECharacterForUser(userId, input);
	}

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

	const [
		statsResult,
		combatResult,
		textResult,
		attacksResult,
		spellsResult,
		featsResult,
		inventoryResult
	] =
		await Promise.all([
			supabase.from('character_stats').insert(statsInsert),
			supabase.from('character_combat_stats').insert(combatStatsInsert),
			supabase.from('character_text_sections').insert(textSectionsInsert),
			insertCharacterAttackItems(supabase, character.id, input.attackItems),
			insertCharacterSpellItems(supabase, character.id, input.spellItems),
			insertCharacterFeatItems(supabase, character.id, input.featItems),
			insertCharacterInventoryItems(supabase, character.id, input.inventoryItems)
		]);

	const childError =
		statsResult.error ??
		combatResult.error ??
		textResult.error ??
		attacksResult.error ??
		spellsResult.error ??
		featsResult.error ??
		inventoryResult.error;

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
	if (isE2EMockSupabaseClient(supabase)) {
		return getE2ECharacterForUser(userId, characterId);
	}

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

	const [
		statsResult,
		combatResult,
		textResult,
		attacksResult,
		spellsResult,
		featsResult,
		inventoryResult
	] =
		await Promise.all([
			supabase
				.from('character_stats')
				.select('strength, dexterity, constitution, intelligence, wisdom, charisma')
				.eq('character_id', characterId)
				.maybeSingle(),
			supabase
				.from('character_combat_stats')
				.select(
					'max_hp, current_hp, temporary_hp, armor_class, initiative, speed, hit_dice'
				)
				.eq('character_id', characterId)
				.maybeSingle(),
			supabase
				.from('character_text_sections')
				.select('attacks, spells, inventory, notes')
				.eq('character_id', characterId)
				.maybeSingle(),
			supabase
				.from('character_attacks')
				.select('name, attack_bonus, damage, damage_type, range, description')
				.eq('character_id', characterId),
			supabase
				.from('character_spells')
				.select(
					'spell_id, name, level, school, casting_time, range, components, duration, description, is_prepared'
				)
				.eq('character_id', characterId),
			supabase
				.from('character_feats')
				.select('feat_id, name, description')
				.eq('character_id', characterId),
			supabase
				.from('character_inventory_items')
				.select('name, quantity, description, weight, value, is_equipped')
				.eq('character_id', characterId)
		]);

	const childError =
		statsResult.error ??
		combatResult.error ??
		textResult.error ??
		attacksResult.error ??
		spellsResult.error ??
		featsResult.error ??
		inventoryResult.error;

	if (
		childError ||
		!statsResult.data ||
		!combatResult.data ||
		!textResult.data ||
		!attacksResult.data ||
		!spellsResult.data ||
		!featsResult.data ||
		!inventoryResult.data
	) {
		throw new Error(`Failed to load character details for user ${userId}`);
	}

	const attackItems =
		attacksResult.data.length > 0
			? attacksResult.data.map((item) => ({
					name: item.name,
					attackBonus: item.attack_bonus ?? undefined,
					damage: item.damage ?? undefined,
					damageType: item.damage_type ?? undefined,
					range: item.range ?? undefined,
					description: item.description ?? undefined
				}))
			: parseLegacyAttackItems(textResult.data.attacks);

	const inventoryItems =
		inventoryResult.data.length > 0
			? inventoryResult.data.map((item) => ({
					name: item.name,
					quantity: item.quantity,
					description: item.description ?? undefined,
					weight: item.weight ?? undefined,
					value: item.value ?? undefined,
					isEquipped: item.is_equipped
				}))
			: parseLegacyInventoryItems(textResult.data.inventory);

	const spellItems =
		spellsResult.data.length > 0
			? spellsResult.data.map((item) => ({
					spellId: item.spell_id ?? undefined,
					name: item.name,
					level: item.level ?? undefined,
					school: item.school ?? undefined,
					castingTime: item.casting_time ?? undefined,
					range: item.range ?? undefined,
					components: item.components ?? undefined,
					duration: item.duration ?? undefined,
					description: item.description ?? undefined,
					isPrepared: item.is_prepared
				}))
			: parseLegacySpellItems(textResult.data.spells);

	const featItems = featsResult.data.map((item) => ({
		featId: item.feat_id ?? undefined,
		name: item.name,
		description: item.description ?? undefined
	}));

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
		attackItems,
		spellItems,
		featItems,
		inventoryItems,
		attacks: textResult.data.attacks ?? undefined,
		spells: textResult.data.spells ?? undefined,
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
	if (isE2EMockSupabaseClient(supabase)) {
		const character = updateE2ECharacterForUser(userId, characterId, input);

		if (!character) {
			throw new Error(`Character ${characterId} was not found for user ${userId}`);
		}

		return character;
	}

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

	const [
		statsResult,
		combatResult,
		textResult,
		attacksResult,
		spellsResult,
		featsResult,
		inventoryResult
	] =
		await Promise.all([
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
				.eq('character_id', characterId),
			replaceCharacterAttackItems(supabase, characterId, input.attackItems),
			replaceCharacterSpellItems(supabase, characterId, input.spellItems),
			replaceCharacterFeatItems(supabase, characterId, input.featItems),
			replaceCharacterInventoryItems(supabase, characterId, input.inventoryItems)
		]);

	const childError =
		statsResult.error ??
		combatResult.error ??
		textResult.error ??
		attacksResult.error ??
		spellsResult.error ??
		featsResult.error ??
		inventoryResult.error;

	if (childError) {
		throw new Error(`Failed to update character details for user ${userId}`);
	}

	return character;
}

export async function deleteCharacter(
	supabase: SupabaseClient<Database>,
	userId: string,
	characterId: string
): Promise<{ id: string; name: string }> {
	if (isE2EMockSupabaseClient(supabase)) {
		const character = deleteE2ECharacterForUser(userId, characterId);

		if (!character) {
			throw new Error(`Character ${characterId} was not found for user ${userId}`);
		}

		return character;
	}

	const { data: character, error: characterError } = await supabase
		.from('characters')
		.delete()
		.eq('id', characterId)
		.eq('user_id', userId)
		.select('id, name')
		.maybeSingle();

	if (characterError) {
		throw new Error(`Failed to delete character ${characterId} for user ${userId}`);
	}

	if (!character) {
		throw new Error(`Character ${characterId} was not found for user ${userId}`);
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
		attacks: toLegacyAttackText(input.attackItems, input.attacks),
		spells: toLegacySpellText(input.spellItems, input.spells),
		inventory: toLegacyInventoryText(input.inventoryItems),
		notes: input.notes ?? null
	};
}

async function insertCharacterAttackItems(
	supabase: SupabaseClient<Database>,
	characterId: string,
	items: CharacterAttackItem[]
) {
	if (items.length === 0) {
		return { error: null };
	}

	return supabase
		.from('character_attacks')
		.insert(items.map((item) => toCharacterAttackItemInsert(characterId, item)));
}

async function replaceCharacterAttackItems(
	supabase: SupabaseClient<Database>,
	characterId: string,
	items: CharacterAttackItem[]
) {
	const { data: existingItems, error: selectError } = await supabase
		.from('character_attacks')
		.select('name, attack_bonus, damage, damage_type, range, description')
		.eq('character_id', characterId);

	if (selectError || !existingItems) {
		return { error: selectError ?? new Error('Failed to load current character attacks') };
	}

	const deleteResult = await supabase
		.from('character_attacks')
		.delete()
		.eq('character_id', characterId);

	if (deleteResult.error || items.length === 0) {
		return deleteResult;
	}

	const insertResult = await insertCharacterAttackItems(supabase, characterId, items);

	if (!insertResult.error) {
		return insertResult;
	}

	if (existingItems.length === 0) {
		return insertResult;
	}

	const restoreResult = await supabase
		.from('character_attacks')
		.insert(
			existingItems.map((item) =>
				toCharacterAttackItemInsert(characterId, mapAttackRow(item))
			)
		);

	return {
		error: restoreResult.error ?? insertResult.error
	};
}

async function insertCharacterInventoryItems(
	supabase: SupabaseClient<Database>,
	characterId: string,
	items: CharacterInventoryItem[]
) {
	if (items.length === 0) {
		return { error: null };
	}

	return supabase
		.from('character_inventory_items')
		.insert(items.map((item) => toCharacterInventoryItemInsert(characterId, item)));
}

async function replaceCharacterInventoryItems(
	supabase: SupabaseClient<Database>,
	characterId: string,
	items: CharacterInventoryItem[]
) {
	const deleteResult = await supabase
		.from('character_inventory_items')
		.delete()
		.eq('character_id', characterId);

	if (deleteResult.error || items.length === 0) {
		return deleteResult;
	}

	return insertCharacterInventoryItems(supabase, characterId, items);
}

async function insertCharacterSpellItems(
	supabase: SupabaseClient<Database>,
	characterId: string,
	items: CharacterSpellItem[]
) {
	if (items.length === 0) {
		return { error: null };
	}

	return supabase
		.from('character_spells')
		.insert(items.map((item) => toCharacterSpellItemInsert(characterId, item)));
}

async function insertCharacterFeatItems(
	supabase: SupabaseClient<Database>,
	characterId: string,
	items: CharacterFeatItem[]
) {
	if (items.length === 0) {
		return { error: null };
	}

	return supabase
		.from('character_feats')
		.insert(items.map((item) => toCharacterFeatItemInsert(characterId, item)));
}

async function replaceCharacterSpellItems(
	supabase: SupabaseClient<Database>,
	characterId: string,
	items: CharacterSpellItem[]
) {
	const { data: existingItems, error: selectError } = await supabase
		.from('character_spells')
		.select(
			'spell_id, name, level, school, casting_time, range, components, duration, description, is_prepared'
		)
		.eq('character_id', characterId);

	if (selectError || !existingItems) {
		return { error: selectError ?? new Error('Failed to load current character spells') };
	}

	const deleteResult = await supabase
		.from('character_spells')
		.delete()
		.eq('character_id', characterId);

	if (deleteResult.error || items.length === 0) {
		return deleteResult;
	}

	const insertResult = await insertCharacterSpellItems(supabase, characterId, items);

	if (!insertResult.error) {
		return insertResult;
	}

	if (existingItems.length === 0) {
		return insertResult;
	}

	const restoreResult = await supabase
		.from('character_spells')
		.insert(
			existingItems.map((item) =>
				toCharacterSpellItemInsert(characterId, mapSpellRow(item))
			)
		);

	return {
		error: restoreResult.error ?? insertResult.error
	};
}

async function replaceCharacterFeatItems(
	supabase: SupabaseClient<Database>,
	characterId: string,
	items: CharacterFeatItem[]
) {
	const { data: existingItems, error: selectError } = await supabase
		.from('character_feats')
		.select('feat_id, name, description')
		.eq('character_id', characterId);

	if (selectError || !existingItems) {
		return { error: selectError ?? new Error('Failed to load current character feats') };
	}

	const deleteResult = await supabase.from('character_feats').delete().eq('character_id', characterId);

	if (deleteResult.error || items.length === 0) {
		return deleteResult;
	}

	const insertResult = await insertCharacterFeatItems(supabase, characterId, items);

	if (!insertResult.error) {
		return insertResult;
	}

	if (existingItems.length === 0) {
		return insertResult;
	}

	const restoreResult = await supabase
		.from('character_feats')
		.insert(existingItems.map((item) => toCharacterFeatItemInsert(characterId, mapFeatRow(item))));

	return {
		error: restoreResult.error ?? insertResult.error
	};
}

function toCharacterInventoryItemInsert(
	characterId: string,
	item: CharacterInventoryItem
): CharacterInventoryItemInsert {
	return {
		character_id: characterId,
		name: item.name,
		quantity: item.quantity,
		description: item.description ?? null,
		weight: item.weight ?? null,
		value: item.value ?? null,
		is_equipped: item.isEquipped
	};
}

function toCharacterAttackItemInsert(
	characterId: string,
	item: CharacterAttackItem
): CharacterAttackInsert {
	return {
		character_id: characterId,
		name: item.name,
		attack_bonus: item.attackBonus ?? null,
		damage: item.damage ?? null,
		damage_type: item.damageType ?? null,
		range: item.range ?? null,
		description: item.description ?? null
	};
}

function toCharacterSpellItemInsert(
	characterId: string,
	item: CharacterSpellItem
): CharacterSpellInsert {
	return {
		character_id: characterId,
		spell_id: item.spellId ?? null,
		name: item.name,
		level: item.level ?? null,
		school: item.school ?? null,
		casting_time: item.castingTime ?? null,
		range: item.range ?? null,
		components: item.components ?? null,
		duration: item.duration ?? null,
		description: item.description ?? null,
		is_prepared: item.isPrepared
	};
}

function toCharacterFeatItemInsert(
	characterId: string,
	item: CharacterFeatItem
): CharacterFeatInsert {
	return {
		character_id: characterId,
		feat_id: item.featId ?? null,
		name: item.name,
		description: item.description ?? null
	};
}

function toLegacyAttackText(items: CharacterAttackItem[], fallback?: string): string | null {
	if (items.length === 0) {
		return fallback?.trim() ? fallback : null;
	}

	return items
		.map((item) => {
			const segments = [item.name];

			if (item.attackBonus) {
				segments.push(item.attackBonus);
			}

			if (item.damage) {
				segments.push(item.damageType ? `${item.damage} ${item.damageType}` : item.damage);
			}

			if (item.range) {
				segments.push(item.range);
			}

			return segments.join(' | ');
		})
		.join('\n');
}

function toLegacyInventoryText(items: CharacterInventoryItem[]): string | null {
	if (items.length === 0) {
		return null;
	}

	return items
		.map((item) => {
			const base = item.quantity === 1 ? item.name : `${item.quantity} x ${item.name}`;
			return item.isEquipped ? `${base} (equipped)` : base;
		})
		.join('\n');
}

function toLegacySpellText(items: CharacterSpellItem[], fallback?: string): string | null {
	if (items.length === 0) {
		return fallback?.trim() ? fallback : null;
	}

	return items
		.map((item) => {
			const segments = [item.name];

			if (item.level !== undefined) {
				segments.push(item.level === 0 ? 'Cantrip' : `Level ${item.level}`);
			}

			if (item.school) {
				segments.push(item.school);
			}

			if (item.isPrepared) {
				segments.push('Prepared');
			}

			return segments.join(' | ');
		})
		.join('\n');
}

function parseLegacyAttackItems(value: string | null): CharacterAttackItem[] {
	if (!value?.trim()) {
		return [];
	}

	return splitLegacyAttackEntries(value)
		.map((item) => item.trim())
		.filter((item) => item.length > 0)
		.map((name) => ({
			name
		}));
}

function parseLegacySpellItems(value: string | null): CharacterSpellItem[] {
	if (!value?.trim()) {
		return [];
	}

	return value
		.split(/\r?\n|,/)
		.map((item) => item.trim())
		.filter((item) => item.length > 0)
		.map((name) => ({
			name,
			isPrepared: false
		}));
}

function splitLegacyAttackEntries(value: string): string[] {
	if (value.includes('\n') || value.includes('\r')) {
		return value.split(/\r?\n/);
	}

	return [value];
}

function mapAttackRow(
	item: Pick<
		CharacterAttackRow,
		'name' | 'attack_bonus' | 'damage' | 'damage_type' | 'range' | 'description'
	>
): CharacterAttackItem {
	return {
		name: item.name,
		attackBonus: item.attack_bonus ?? undefined,
		damage: item.damage ?? undefined,
		damageType: item.damage_type ?? undefined,
		range: item.range ?? undefined,
		description: item.description ?? undefined
	};
}

function mapSpellRow(
	item: Pick<
		CharacterSpellRow,
		| 'spell_id'
		| 'name'
		| 'level'
		| 'school'
		| 'casting_time'
		| 'range'
		| 'components'
		| 'duration'
		| 'description'
		| 'is_prepared'
	>
): CharacterSpellItem {
	return {
		spellId: item.spell_id ?? undefined,
		name: item.name,
		level: item.level ?? undefined,
		school: item.school ?? undefined,
		castingTime: item.casting_time ?? undefined,
		range: item.range ?? undefined,
		components: item.components ?? undefined,
		duration: item.duration ?? undefined,
		description: item.description ?? undefined,
		isPrepared: item.is_prepared
	};
}

function mapFeatRow(
	item: Pick<CharacterFeatRow, 'feat_id' | 'name' | 'description'>
): CharacterFeatItem {
	return {
		featId: item.feat_id ?? undefined,
		name: item.name,
		description: item.description ?? undefined
	};
}

function parseLegacyInventoryItems(value: string | null): CharacterInventoryItem[] {
	if (!value?.trim()) {
		return [];
	}

	return value
		.split(/\r?\n|,/)
		.map((item) => item.trim())
		.filter((item) => item.length > 0)
		.map((name) => ({
			name,
			quantity: 1,
			isEquipped: false
		}));
}
