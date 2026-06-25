export type CharacterSpeciesOption = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	baseSpeed: number | null;
};

export type CharacterSubspeciesOption = {
	id: string;
	slug: string;
	speciesSlug: string;
	name: string;
	summary: string | null;
};

export type CharacterClassOption = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	hitDie: number;
};

export type CharacterSubclassOption = {
	id: string;
	slug: string;
	classSlug: string;
	name: string;
	summary: string | null;
};

export type CharacterBackgroundOption = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
};

export type CharacterCreationCatalog = {
	speciesOptions: CharacterSpeciesOption[];
	subspeciesOptions: CharacterSubspeciesOption[];
	classOptions: CharacterClassOption[];
	subclassOptions: CharacterSubclassOption[];
	backgroundOptions: CharacterBackgroundOption[];
};
