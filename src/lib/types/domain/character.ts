import type { Ability } from './game-mechanics';

export const abilityNames = [
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma'
] as const satisfies readonly Ability[];

export type CharacterAbility = (typeof abilityNames)[number];

export type CharacterAbilityScores = Record<CharacterAbility, number>;

export type CharacterCatalogRefs = {
	speciesId?: string;
	subspeciesId?: string;
	classId?: string;
	subclassId?: string;
	backgroundId?: string;
};

export type CharacterIdentity = CharacterCatalogRefs & {
	name: string;
	race?: string;
	subrace?: string;
	className?: string;
	subclass?: string;
	level: number;
	background?: string;
	story?: string;
};

export type CharacterCombatStats = {
	maxHp: number;
	currentHp: number;
	temporaryHp: number;
	armorClass: number;
	initiative: number;
	speed: number;
	hitDice?: string;
};

export type CharacterInventoryItem = {
	name: string;
	quantity: number;
	description?: string;
	weight?: number;
	value?: string;
	isEquipped: boolean;
};

export type CharacterAttackItem = {
	name: string;
	attackBonus?: string;
	damage?: string;
	damageType?: string;
	range?: string;
	description?: string;
};

export type CharacterTextSections = {
	attacks?: string;
	spells?: string;
	notes?: string;
};

export type CharacterCreateInput = CharacterIdentity &
	CharacterAbilityScores &
	CharacterCombatStats &
	CharacterTextSections & {
		attackItems: CharacterAttackItem[];
		inventoryItems: CharacterInventoryItem[];
	};
