import type {
	CharacterAttackItem,
	CharacterGuidedBaselineSnapshot,
	CharacterInventoryItem,
	CharacterNoteItem,
	CharacterSpellItem
} from '$lib/types/domain/character';

export function createCharacterGuidedBaselineSnapshot(input: {
	attackItems: CharacterAttackItem[];
	spellItems: CharacterSpellItem[];
	inventoryItems: CharacterInventoryItem[];
	noteItems: CharacterNoteItem[];
}): CharacterGuidedBaselineSnapshot {
	return {
		attackItems: input.attackItems.map((item) => ({ ...item })),
		spellItems: input.spellItems.map((item) => ({ ...item })),
		inventoryItems: input.inventoryItems.map((item) => ({ ...item })),
		noteItems: input.noteItems.map((item) => ({ ...item }))
	};
}
