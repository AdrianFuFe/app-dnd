import {
	knownArmorProficiencySlugs,
	knownDamageTypes,
	knownIndividualWeaponProficiencySlugs,
	knownLanguageSlugs,
	knownSavingThrowProficiencySlugs,
	knownSkillProficiencySlugs,
	knownSpellSchoolSlugs,
	knownToolProficiencySlugs,
	knownWeaponProficiencySlugs
} from '$lib/schemas/content/catalog-vocabularies.schema';
import type {
	ProficiencyVocabularyEntry,
	RulesVocabularyEntry,
	SharedRulesVocabularyCatalog
} from '$lib/types/content/expanded-content-catalog';
import type { Ability } from '$lib/types/domain/game-mechanics';

const knownAbilitySlugs: Ability[] = [
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma'
];

export function listSharedRulesVocabularies(): SharedRulesVocabularyCatalog {
	return {
		abilities: mapVocabularyEntries(knownAbilitySlugs),
		languages: mapVocabularyEntries(knownLanguageSlugs),
		damageTypes: mapVocabularyEntries(knownDamageTypes),
		spellSchools: mapVocabularyEntries(knownSpellSchoolSlugs),
		skillProficiencies: mapProficiencyEntries('skill', knownSkillProficiencySlugs),
		armorProficiencies: mapProficiencyEntries('armor', knownArmorProficiencySlugs),
		weaponProficiencies: mapProficiencyEntries('weapon', [
			...knownWeaponProficiencySlugs,
			...knownIndividualWeaponProficiencySlugs
		]),
		toolProficiencies: mapProficiencyEntries('tool', knownToolProficiencySlugs),
		savingThrowProficiencies: mapProficiencyEntries(
			'saving_throw',
			knownSavingThrowProficiencySlugs
		)
	};
}

function mapVocabularyEntries(values: readonly string[]): RulesVocabularyEntry[] {
	return values.map((slug) => ({
		slug,
		name: formatCatalogVocabularyLabel(slug)
	}));
}

function mapProficiencyEntries(
	proficiencyType: ProficiencyVocabularyEntry['proficiencyType'],
	values: readonly string[]
): ProficiencyVocabularyEntry[] {
	return values.map((slug) => ({
		slug,
		name: formatCatalogVocabularyLabel(slug),
		proficiencyType
	}));
}

function formatCatalogVocabularyLabel(value: string): string {
	return value
		.split('-')
		.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join(' ');
}
