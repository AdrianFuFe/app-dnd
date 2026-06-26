import type { CharacterCreateInput } from '$lib/types/domain/character';

export function createDefaultCharacterInput(): CharacterCreateInput {
	return {
		name: 'New Character',
		level: 1,
		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10,
		maxHp: 1,
		currentHp: 1,
		temporaryHp: 0,
		armorClass: 10,
		initiative: 0,
		speed: 30,
		attackItems: [],
		spellItems: [],
		inventoryItems: []
	};
}
