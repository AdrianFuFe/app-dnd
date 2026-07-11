import type {
	CharacterCreateInput,
	CharacterSpellItem,
	CharacterFeatItem,
	CharacterAttackItem,
	CharacterInventoryItem
} from '$lib/types/domain/character';
import type {
	FeatCatalogEntry,
	SpellCatalogEntry
} from '$lib/types/content/expanded-content-catalog';
import type { GuidedCharacterCatalog } from './guided-character';
import {
	createCharacterManualOverride,
	deriveCharacterContentProfile,
	summarizeCharacterCustomizationReasons,
	type CharacterContentProfile,
	type CharacterLinkedContentSelection
} from './character-content-profile';

type ExistingCharacterProfile = Pick<
	CharacterCreateInput,
	| 'contentMode'
	| 'maxHp'
	| 'currentHp'
	| 'temporaryHp'
	| 'armorClass'
	| 'initiative'
	| 'speed'
	| 'hitDice'
>;

export type ManualCharacterContentProfileResult = {
	profile: CharacterContentProfile;
	reasonLines: string[];
};

export function deriveManualCharacterContentProfile(
	input: CharacterCreateInput,
	context: {
		guidedCatalog: GuidedCharacterCatalog;
		spellCatalog: SpellCatalogEntry[];
		featCatalog: FeatCatalogEntry[];
		existingCharacter?: ExistingCharacterProfile;
	}
): ManualCharacterContentProfileResult {
	const linkedContentSelections = [
		...summarizeLinkedIdentitySelections(input, context.guidedCatalog),
		...summarizeLinkedSpellSelections(input.spellItems, context.spellCatalog),
		...summarizeLinkedFeatSelections(input.featItems, context.featCatalog)
	];
	const manualOverrides = [
		...summarizeFreeformRowOverrides(input.attackItems, input.spellItems, input.featItems, input.inventoryItems),
		...summarizeCombatDiffOverrides(input, context.existingCharacter)
	];
	const derivedProfile = deriveCharacterContentProfile({
		baseRulesetCode: input.rulesetCode,
		linkedContentSelections,
		manualOverrides
	});

	if (
		derivedProfile.contentMode === 'canon' &&
		context.existingCharacter?.contentMode === 'custom'
	) {
		return {
			profile: {
				...derivedProfile,
				contentMode: 'custom',
				customizationReasons: [
					{
						type: 'manual-override',
						field: 'existing_custom_state'
					}
				]
			},
			reasonLines: ['Existing custom draft retained']
		};
	}

	return {
		profile: derivedProfile,
		reasonLines: summarizeCharacterCustomizationReasons(derivedProfile.customizationReasons)
	};
}

function summarizeLinkedIdentitySelections(
	input: CharacterCreateInput,
	guidedCatalog: GuidedCharacterCatalog
): CharacterLinkedContentSelection[] {
	const selections: CharacterLinkedContentSelection[] = [];

	const species = input.speciesId
		? guidedCatalog.speciesOptions.find((entry) => entry.id === input.speciesId)
		: undefined;
	if (species) {
		selections.push({
			entityType: 'species',
			entityId: species.id,
			entityName: species.name,
			rulesetCode: species.rulesetCode,
			contentMode: species.contentMode
		});
	}

	const subspecies = input.subspeciesId
		? guidedCatalog.subspeciesOptions.find((entry) => entry.id === input.subspeciesId)
		: undefined;
	if (subspecies) {
		selections.push({
			entityType: 'subspecies',
			entityId: subspecies.id,
			entityName: subspecies.name,
			rulesetCode: subspecies.rulesetCode,
			contentMode: subspecies.contentMode
		});
	}

	const characterClass = input.classId
		? guidedCatalog.classOptions.find((entry) => entry.id === input.classId)
		: undefined;
	if (characterClass) {
		selections.push({
			entityType: 'class',
			entityId: characterClass.id,
			entityName: characterClass.name,
			rulesetCode: characterClass.rulesetCode,
			contentMode: characterClass.contentMode
		});
	}

	const subclass = input.subclassId
		? guidedCatalog.subclassOptions.find((entry) => entry.id === input.subclassId)
		: undefined;
	if (subclass) {
		selections.push({
			entityType: 'subclass',
			entityId: subclass.id,
			entityName: subclass.name,
			rulesetCode: subclass.rulesetCode,
			contentMode: subclass.contentMode
		});
	}

	const background = input.backgroundId
		? guidedCatalog.backgroundOptions.find((entry) => entry.id === input.backgroundId)
		: undefined;
	if (background) {
		selections.push({
			entityType: 'background',
			entityId: background.id,
			entityName: background.name,
			rulesetCode: background.rulesetCode,
			contentMode: background.contentMode
		});
	}

	return selections;
}

function summarizeLinkedSpellSelections(
	spellItems: CharacterSpellItem[],
	spellCatalog: SpellCatalogEntry[]
): CharacterLinkedContentSelection[] {
	return spellItems.flatMap((item) => {
		if (!item.spellId) {
			return [];
		}

		const spell = spellCatalog.find((entry) => entry.id === item.spellId);
		if (!spell) {
			return [];
		}

		return [
			{
				entityType: 'spell' as const,
				entityId: spell.id,
				entityName: spell.name,
				rulesetCode: spell.rulesetCode ?? 'dnd-2014-srd',
				contentMode: spell.contentMode ?? 'canon'
			}
		];
	});
}

function summarizeLinkedFeatSelections(
	featItems: CharacterFeatItem[],
	featCatalog: FeatCatalogEntry[]
): CharacterLinkedContentSelection[] {
	return featItems.flatMap((item) => {
		if (!item.featId) {
			return [];
		}

		const feat = featCatalog.find((entry) => entry.id === item.featId);
		if (!feat) {
			return [];
		}

		return [
			{
				entityType: 'feat' as const,
				entityId: feat.id,
				entityName: feat.name,
				rulesetCode: feat.rulesetCode ?? 'dnd-2014-srd',
				contentMode: feat.contentMode ?? 'canon'
			}
		];
	});
}

function summarizeFreeformRowOverrides(
	attackItems: CharacterAttackItem[],
	spellItems: CharacterSpellItem[],
	featItems: CharacterFeatItem[],
	inventoryItems: CharacterInventoryItem[]
) {
	const manualOverrides: Array<{ field: string }> = [];

	if (attackItems.some((item) => !item.equipmentId && item.name.trim().length > 0)) {
		manualOverrides.push(createCharacterManualOverride('attack_items'));
	}

	if (spellItems.some((item) => !item.spellId && item.name.trim().length > 0)) {
		manualOverrides.push(createCharacterManualOverride('spell_items'));
	}

	if (featItems.some((item) => !item.featId && item.name.trim().length > 0)) {
		manualOverrides.push(createCharacterManualOverride('feat_items'));
	}

	if (inventoryItems.some((item) => !item.equipmentId && item.name.trim().length > 0)) {
		manualOverrides.push(createCharacterManualOverride('inventory_items'));
	}

	return manualOverrides;
}

function summarizeCombatDiffOverrides(
	input: CharacterCreateInput,
	existingCharacter?: ExistingCharacterProfile
) {
	if (!existingCharacter) {
		return [];
	}

	const manualOverrides: Array<{ field: string }> = [];

	if (input.maxHp !== existingCharacter.maxHp) {
		manualOverrides.push(createCharacterManualOverride('max_hp'));
	}

	if (input.currentHp !== existingCharacter.currentHp) {
		manualOverrides.push(createCharacterManualOverride('current_hp'));
	}

	if (input.temporaryHp !== existingCharacter.temporaryHp) {
		manualOverrides.push(createCharacterManualOverride('temporary_hp'));
	}

	if (input.armorClass !== existingCharacter.armorClass) {
		manualOverrides.push(createCharacterManualOverride('armor_class'));
	}

	if (input.initiative !== existingCharacter.initiative) {
		manualOverrides.push(createCharacterManualOverride('initiative'));
	}

	if (input.speed !== existingCharacter.speed) {
		manualOverrides.push(createCharacterManualOverride('speed'));
	}

	if ((input.hitDice ?? '') !== (existingCharacter.hitDice ?? '')) {
		manualOverrides.push(createCharacterManualOverride('hit_dice'));
	}

	return manualOverrides;
}
