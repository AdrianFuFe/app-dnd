export type CharacterSpeciesOption = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	baseSpeed: number | null;
};

export type CharacterClassOption = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	hitDie: number;
};

export type CharacterCreationCatalog = {
	speciesOptions: CharacterSpeciesOption[];
	classOptions: CharacterClassOption[];
};
