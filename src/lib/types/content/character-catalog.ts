import type { ContentMechanicSummary } from './mechanic-summary';

export type CharacterSpeciesOption = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	baseSpeed: number | null;
	mechanicSummary: ContentMechanicSummary;
};

export type CharacterSubspeciesOption = {
	id: string;
	slug: string;
	speciesSlug: string;
	name: string;
	summary: string | null;
	mechanicSummary: ContentMechanicSummary;
};

export type CharacterClassOption = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	hitDie: number;
	mechanicSummary: ContentMechanicSummary;
	grantedSpellSlugs: string[];
};

export type CharacterGrantedSpellLevelGroup = {
	level: number;
	spellSlugs: string[];
};

export type CharacterSubclassOption = {
	id: string;
	slug: string;
	classSlug: string;
	name: string;
	summary: string | null;
	mechanicSummary: ContentMechanicSummary;
	grantedSpellsByLevel: CharacterGrantedSpellLevelGroup[];
};

export type CharacterBackgroundOption = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	mechanicSummary: ContentMechanicSummary;
};

export type CharacterCreationCatalog = {
	speciesOptions: CharacterSpeciesOption[];
	subspeciesOptions: CharacterSubspeciesOption[];
	classOptions: CharacterClassOption[];
	subclassOptions: CharacterSubclassOption[];
	backgroundOptions: CharacterBackgroundOption[];
};
