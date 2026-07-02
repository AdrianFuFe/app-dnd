import type { Ability, ProficiencyType } from '$lib/types/domain/game-mechanics';

export type LanguageGrantSummary =
	| { kind: 'fixed'; language: string }
	| { kind: 'choice'; count: number };

export type ProficiencyGrantSummary = {
	proficiencyType: ProficiencyType;
	value: string;
};

export type ProficiencyChoiceSummary = {
	proficiencyType: 'skill' | 'tool';
	count: number;
	options: string[];
};

export type ContentMechanicSummary = {
	spellcastingAbilities: Ability[];
	languageGrants: LanguageGrantSummary[];
	proficiencyGrants: ProficiencyGrantSummary[];
	proficiencyChoices: ProficiencyChoiceSummary[];
};
