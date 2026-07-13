import { z } from 'zod';

export const knownLanguageSlugs = [
	'comun',
	'draconico',
	'dwarfico',
	'elfico',
	'gigante',
	'gnomico',
	'goblin',
	'halfling',
	'infernal',
	'orco'
] as const;

export const knownDamageTypes = [
	'acid',
	'bludgeoning',
	'cold',
	'fire',
	'force',
	'lightning',
	'necrotic',
	'piercing',
	'poison',
	'psychic',
	'radiant',
	'slashing',
	'thunder'
] as const;

export const knownSpellSchoolSlugs = [
	'abjuration',
	'conjuration',
	'divination',
	'enchantment',
	'evocation',
	'illusion',
	'necromancy',
	'transmutation'
] as const;

export const knownSkillProficiencySlugs = [
	'acrobatics',
	'animal-handling',
	'arcana',
	'athletics',
	'deception',
	'history',
	'insight',
	'intimidation',
	'investigation',
	'medicine',
	'nature',
	'perception',
	'performance',
	'persuasion',
	'religion',
	'sleight-of-hand',
	'stealth',
	'survival'
] as const;

export const knownArmorProficiencySlugs = [
	'light-armor',
	'medium-armor',
	'heavy-armor',
	'all-armor',
	'shields'
] as const;

export const knownWeaponProficiencySlugs = ['simple-weapons', 'martial-weapons'] as const;

export const knownIndividualWeaponProficiencySlugs = [
	'club',
	'dagger',
	'dart',
	'hand-crossbow',
	'handaxe',
	'javelin',
	'light-crossbow',
	'light-hammer',
	'longbow',
	'longsword',
	'mace',
	'quarterstaff',
	'rapier',
	'shortbow',
	'shortsword',
	'sickle',
	'sling',
	'spear',
	'warhammer'
] as const;

export const knownSavingThrowProficiencySlugs = [
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma'
] as const;

export const knownToolProficiencySlugs = [
	'artisan-tools',
	'gaming-set',
	'musical-instrument',
	'smith-tools',
	'thieves-tools',
	'vehicles-land',
	'vehicles-water'
] as const;

export const knownLanguageSlugSet = new Set<string>(knownLanguageSlugs);
export const knownDamageTypeSet = new Set<string>(knownDamageTypes);
export const knownSpellSchoolSlugSet = new Set<string>(knownSpellSchoolSlugs);
export const knownSkillProficiencySlugSet = new Set<string>(knownSkillProficiencySlugs);
export const knownArmorProficiencySlugSet = new Set<string>(knownArmorProficiencySlugs);
export const knownWeaponProficiencySlugSet = new Set<string>(knownWeaponProficiencySlugs);
export const knownIndividualWeaponProficiencySlugSet = new Set<string>(
	knownIndividualWeaponProficiencySlugs
);
export const knownSavingThrowProficiencySlugSet = new Set<string>(knownSavingThrowProficiencySlugs);
export const knownToolProficiencySlugSet = new Set<string>(knownToolProficiencySlugs);

export const languageSlugSchema = z.enum(knownLanguageSlugs);
export const damageTypeSchema = z.enum(knownDamageTypes);
export const spellSchoolSlugSchema = z.enum(knownSpellSchoolSlugs);
export const skillProficiencySlugSchema = z.enum(knownSkillProficiencySlugs);
export const armorProficiencySlugSchema = z.enum(knownArmorProficiencySlugs);
export const weaponGroupProficiencySlugSchema = z.enum(knownWeaponProficiencySlugs);
export const weaponItemProficiencySlugSchema = z.enum(knownIndividualWeaponProficiencySlugs);
export const weaponProficiencySlugSchema = z.union([
	weaponGroupProficiencySlugSchema,
	weaponItemProficiencySlugSchema
]);
export const savingThrowProficiencySlugSchema = z.enum(knownSavingThrowProficiencySlugs);
export const toolProficiencySlugSchema = z.enum(knownToolProficiencySlugs);

export function isKnownProficiencySlug(proficiencyType: string, slug: string): boolean {
	if (proficiencyType === 'skill') {
		return knownSkillProficiencySlugSet.has(slug);
	}

	if (proficiencyType === 'armor') {
		return knownArmorProficiencySlugSet.has(slug);
	}

	if (proficiencyType === 'weapon') {
		return (
			knownWeaponProficiencySlugSet.has(slug) ||
			knownIndividualWeaponProficiencySlugSet.has(slug)
		);
	}

	if (proficiencyType === 'tool') {
		return knownToolProficiencySlugSet.has(slug);
	}

	if (proficiencyType === 'saving_throw') {
		return knownSavingThrowProficiencySlugSet.has(slug);
	}

	return false;
}
