import type { ContentMode, RulesetCode } from '$lib/types/content/content';

export type CharacterLinkedContentType =
	| 'species'
	| 'subspecies'
	| 'class'
	| 'subclass'
	| 'background';

export type CharacterLinkedContentSelection = {
	entityType: CharacterLinkedContentType;
	entityId: string;
	entityName: string;
	rulesetCode: RulesetCode;
	contentMode: ContentMode;
};

export type CharacterCustomizationReason =
	| {
			type: 'linked-custom-content';
			entityType: CharacterLinkedContentType;
			entityId: string;
			entityName: string;
	  }
	| {
			type: 'manual-override';
			field: string;
	  }
	| {
			type: 'custom-ruleset';
			rulesetCode: RulesetCode;
	  };

export type CharacterContentProfile = {
	rulesetCode: RulesetCode;
	contentMode: ContentMode;
	customizationReasons: CharacterCustomizationReason[];
};

export function deriveCharacterContentProfile(input: {
	baseRulesetCode: RulesetCode;
	linkedContentSelections: CharacterLinkedContentSelection[];
	manualOverrides?: Array<{ field: string }>;
}): CharacterContentProfile {
	const customizationReasons: CharacterCustomizationReason[] = [];
	const manualOverrides = input.manualOverrides ?? [];

	for (const selection of input.linkedContentSelections) {
		if (selection.rulesetCode !== input.baseRulesetCode) {
			throw new Error(
				`Selected ${selection.entityType} "${selection.entityName}" does not match the ${input.baseRulesetCode} ruleset.`
			);
		}

		if (selection.contentMode === 'custom') {
			customizationReasons.push({
				type: 'linked-custom-content',
				entityType: selection.entityType,
				entityId: selection.entityId,
				entityName: selection.entityName
			});
		}
	}

	for (const override of manualOverrides) {
		customizationReasons.push({
			type: 'manual-override',
			field: override.field
		});
	}

	if (input.baseRulesetCode === 'custom') {
		customizationReasons.push({
			type: 'custom-ruleset',
			rulesetCode: input.baseRulesetCode
		});
	}

	return {
		rulesetCode: input.baseRulesetCode,
		contentMode: customizationReasons.length > 0 ? 'custom' : 'canon',
		customizationReasons
	};
}
