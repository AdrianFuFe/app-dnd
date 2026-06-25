import type { CharacterCreateInput } from '$lib/types/domain/character';

export const characterCreateFormFieldNames = [
	'name',
	'speciesId',
	'subspeciesId',
	'race',
	'subrace',
	'classId',
	'subclassId',
	'className',
	'subclass',
	'backgroundId',
	'level',
	'background',
	'story',
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma',
	'maxHp',
	'currentHp',
	'temporaryHp',
	'armorClass',
	'initiative',
	'speed',
	'hitDice',
	'inventoryItems',
	'attacks',
	'spells',
	'notes'
] as const;

export type CharacterCreateFormFieldName = (typeof characterCreateFormFieldNames)[number];

export type CharacterCreateFormValues = Record<CharacterCreateFormFieldName, string>;

type CharacterCreateFormValueSource = Partial<Record<CharacterCreateFormFieldName, unknown>>;

export function createCharacterFormValues(
	source: CharacterCreateFormValueSource = {}
): CharacterCreateFormValues {
	return {
		name: toFormString(source.name),
		speciesId: toFormString(source.speciesId),
		subspeciesId: toFormString(source.subspeciesId),
		race: toFormString(source.race),
		subrace: toFormString(source.subrace),
		classId: toFormString(source.classId),
		subclassId: toFormString(source.subclassId),
		className: toFormString(source.className),
		subclass: toFormString(source.subclass),
		backgroundId: toFormString(source.backgroundId),
		level: toFormString(source.level),
		background: toFormString(source.background),
		story: toFormString(source.story),
		strength: toFormString(source.strength),
		dexterity: toFormString(source.dexterity),
		constitution: toFormString(source.constitution),
		intelligence: toFormString(source.intelligence),
		wisdom: toFormString(source.wisdom),
		charisma: toFormString(source.charisma),
		maxHp: toFormString(source.maxHp),
		currentHp: toFormString(source.currentHp),
		temporaryHp: toFormString(source.temporaryHp),
		armorClass: toFormString(source.armorClass),
		initiative: toFormString(source.initiative),
		speed: toFormString(source.speed),
		hitDice: toFormString(source.hitDice),
		inventoryItems: toInventoryItemsFormString(source.inventoryItems),
		attacks: toFormString(source.attacks),
		spells: toFormString(source.spells),
		notes: toFormString(source.notes)
	};
}

export function createCharacterFormValuesFromInput(
	input: CharacterCreateInput
): CharacterCreateFormValues {
	return createCharacterFormValues(input);
}

function toFormString(value: unknown): string {
	if (typeof value === 'number') {
		return String(value);
	}

	if (typeof value === 'string') {
		return value;
	}

	return '';
}

function toInventoryItemsFormString(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (Array.isArray(value)) {
		return JSON.stringify(value);
	}

	return '[]';
}
