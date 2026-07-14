import type {
	CharacterAttackItem,
	CharacterGuidedBaselineIdentitySnapshot,
	CharacterGuidedBaselineSnapshot,
	CharacterInventoryItem,
	CharacterNoteItem,
	CharacterSpellItem
} from '$lib/types/domain/character';

type AttackLike = {
	equipmentId?: string;
	name: string;
	attackBonus?: string;
	damage?: string;
	damageType?: string;
	range?: string;
	description?: string;
};

type SpellLike = {
	spellId?: string;
	name: string;
	level?: string | number;
	school?: string;
	castingTime?: string;
	range?: string;
	components?: string;
	duration?: string;
	description?: string;
	isPrepared: boolean;
};

type InventoryLike = {
	equipmentId?: string;
	name: string;
	quantity: string | number;
	description?: string;
	weight?: string | number;
	value?: string;
	isEquipped: boolean;
};

type NoteLike = {
	title: string;
	content: string;
};

export function createCharacterGuidedBaselineSnapshot(input: {
	identity?: CharacterGuidedBaselineIdentitySnapshot;
	attackItems: CharacterAttackItem[];
	spellItems: CharacterSpellItem[];
	inventoryItems: CharacterInventoryItem[];
	noteItems: CharacterNoteItem[];
}): CharacterGuidedBaselineSnapshot {
	return {
		identity: input.identity ? { ...input.identity } : undefined,
		attackItems: input.attackItems.map((item) => ({ ...item })),
		spellItems: input.spellItems.map((item) => ({ ...item })),
		inventoryItems: input.inventoryItems.map((item) => ({ ...item })),
		noteItems: input.noteItems.map((item) => ({ ...item }))
	};
}

export function normalizeGuidedBaselineName(value: string): string {
	return value.trim().toLowerCase();
}

export function normalizeGuidedBaselineValue(value: string | number | undefined): string {
	if (value === undefined) {
		return '';
	}

	return String(value).trim().toLowerCase();
}

export function attackBaselineSignature(item: AttackLike): string {
	return JSON.stringify([
		normalizeGuidedBaselineValue(item.equipmentId),
		normalizeGuidedBaselineValue(item.name),
		normalizeGuidedBaselineValue(item.attackBonus),
		normalizeGuidedBaselineValue(item.damage),
		normalizeGuidedBaselineValue(item.damageType),
		normalizeGuidedBaselineValue(item.range),
		normalizeGuidedBaselineValue(item.description)
	]);
}

export function spellBaselineSignature(item: SpellLike): string {
	return JSON.stringify([
		normalizeGuidedBaselineValue(item.spellId),
		normalizeGuidedBaselineValue(item.name),
		normalizeGuidedBaselineValue(item.level),
		normalizeGuidedBaselineValue(item.school),
		normalizeGuidedBaselineValue(item.castingTime),
		normalizeGuidedBaselineValue(item.range),
		normalizeGuidedBaselineValue(item.components),
		normalizeGuidedBaselineValue(item.duration),
		normalizeGuidedBaselineValue(item.description),
		item.isPrepared ? 'prepared' : 'unprepared'
	]);
}

export function inventoryBaselineSignature(item: InventoryLike): string {
	return JSON.stringify([
		normalizeGuidedBaselineValue(item.equipmentId),
		normalizeGuidedBaselineValue(item.name),
		normalizeGuidedBaselineValue(item.quantity),
		normalizeGuidedBaselineValue(item.description),
		normalizeGuidedBaselineValue(item.weight),
		normalizeGuidedBaselineValue(item.value),
		item.isEquipped ? 'equipped' : 'unequipped'
	]);
}

export function noteBaselineSignature(item: NoteLike): string {
	return JSON.stringify([
		normalizeGuidedBaselineValue(item.title),
		normalizeGuidedBaselineValue(item.content)
	]);
}

export function arraySignature(items: string[]): string {
	return JSON.stringify([...items].sort());
}

export function guidedBaselineIncludesAttack(
	guidedBaseline: CharacterGuidedBaselineSnapshot,
	item: AttackLike
): boolean {
	const signature = attackBaselineSignature(item);
	return guidedBaseline.attackItems.some(
		(baselineItem) => attackBaselineSignature(baselineItem) === signature
	);
}

export function guidedBaselineIncludesSpell(
	guidedBaseline: CharacterGuidedBaselineSnapshot,
	item: SpellLike
): boolean {
	const signature = spellBaselineSignature(item);
	return guidedBaseline.spellItems.some(
		(baselineItem) => spellBaselineSignature(baselineItem) === signature
	);
}

export function guidedBaselineIncludesInventoryItem(
	guidedBaseline: CharacterGuidedBaselineSnapshot,
	item: InventoryLike
): boolean {
	const signature = inventoryBaselineSignature(item);
	return guidedBaseline.inventoryItems.some(
		(baselineItem) => inventoryBaselineSignature(baselineItem) === signature
	);
}

export function guidedBaselineIncludesNote(
	guidedBaseline: CharacterGuidedBaselineSnapshot,
	item: NoteLike
): boolean {
	const signature = noteBaselineSignature(item);
	return guidedBaseline.noteItems.some(
		(baselineItem) => noteBaselineSignature(baselineItem) === signature
	);
}

export function guidedBaselineAttacksAreAligned(
	currentItems: AttackLike[],
	guidedBaseline: CharacterGuidedBaselineSnapshot
): boolean {
	return (
		arraySignature(currentItems.map(attackBaselineSignature)) ===
		arraySignature(guidedBaseline.attackItems.map(attackBaselineSignature))
	);
}

export function guidedBaselineSpellsAreAligned(
	currentItems: SpellLike[],
	guidedBaseline: CharacterGuidedBaselineSnapshot
): boolean {
	return (
		arraySignature(currentItems.map(spellBaselineSignature)) ===
		arraySignature(guidedBaseline.spellItems.map(spellBaselineSignature))
	);
}

export function guidedBaselineInventoryIsAligned(
	currentItems: InventoryLike[],
	guidedBaseline: CharacterGuidedBaselineSnapshot
): boolean {
	return (
		arraySignature(currentItems.map(inventoryBaselineSignature)) ===
		arraySignature(guidedBaseline.inventoryItems.map(inventoryBaselineSignature))
	);
}

export function guidedBaselineNotesAreAligned(
	currentItems: NoteLike[],
	guidedBaseline: CharacterGuidedBaselineSnapshot
): boolean {
	return (
		arraySignature(currentItems.map(noteBaselineSignature)) ===
		arraySignature(guidedBaseline.noteItems.map(noteBaselineSignature))
	);
}

export function extractGuidedEquipmentNamesFromNotes(
	noteItems: Array<Pick<CharacterNoteItem, 'content'>>
): Set<string> {
	const names = new Set<string>();

	for (const item of noteItems) {
		for (const rawLine of item.content.split('\n')) {
			const line = rawLine.trim();

			if (line.startsWith('Chosen equipment: ')) {
				for (const part of line.slice('Chosen equipment: '.length).split(',')) {
					const normalized = normalizeGuidedBaselineName(part);
					if (normalized) {
						names.add(normalized);
					}
				}
			}

			if (line.startsWith('Starting equipment: ')) {
				const content = line.slice('Starting equipment: '.length).trim();

				if (content.startsWith('Choose 1: ')) {
					for (const part of content.slice('Choose 1: '.length).split(',')) {
						const normalized = normalizeGuidedBaselineName(part);
						if (normalized) {
							names.add(normalized);
						}
					}
					continue;
				}

				const withoutQuantity = content.replace(/^\d+x\s+/i, '').trim();
				const normalized = normalizeGuidedBaselineName(withoutQuantity);
				if (normalized) {
					names.add(normalized);
				}
			}
		}
	}

	return names;
}

export function guidedBaselineEquipmentNames(
	guidedBaseline: CharacterGuidedBaselineSnapshot | null | undefined
): Set<string> {
	if (!guidedBaseline) {
		return new Set();
	}

	return new Set(
		guidedBaseline.inventoryItems
			.map((item) => normalizeGuidedBaselineName(item.name))
			.filter((name) => name.length > 0)
	);
}
