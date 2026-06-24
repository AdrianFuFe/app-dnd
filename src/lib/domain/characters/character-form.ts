import type { CharacterCreateInput } from '$lib/types/domain/character';

export const characterCreateFormFieldNames = [
	'name',
	'race',
	'subrace',
	'className',
	'subclass',
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
	'attacks',
	'spells',
	'inventory',
	'notes'
] as const;

export type CharacterCreateFormFieldName = (typeof characterCreateFormFieldNames)[number];

export type CharacterCreateFormValues = Record<CharacterCreateFormFieldName, string>;

type CharacterCreateFormValueSource = Partial<
	Record<CharacterCreateFormFieldName, FormDataEntryValue | string | number | undefined>
>;

export function createCharacterFormValues(
	source: CharacterCreateFormValueSource = {}
): CharacterCreateFormValues {
	return {
		name: toFormString(source.name),
		race: toFormString(source.race),
		subrace: toFormString(source.subrace),
		className: toFormString(source.className),
		subclass: toFormString(source.subclass),
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
		attacks: toFormString(source.attacks),
		spells: toFormString(source.spells),
		inventory: toFormString(source.inventory),
		notes: toFormString(source.notes)
	};
}

export function createCharacterFormValuesFromInput(
	input: CharacterCreateInput
): CharacterCreateFormValues {
	return createCharacterFormValues(input);
}

function toFormString(value: FormDataEntryValue | string | number | undefined): string {
	if (typeof value === 'number') {
		return String(value);
	}

	if (typeof value === 'string') {
		return value;
	}

	return '';
}
