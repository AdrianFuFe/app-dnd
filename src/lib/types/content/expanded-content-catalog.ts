import type {
	CharacterBackgroundOption,
	CharacterClassOption,
	CharacterSpeciesOption,
	CharacterSubclassOption,
	CharacterSubspeciesOption
} from './character-catalog';

export type SpellCatalogEntry = {
	id: string;
	slug: string;
	name: string;
	level: number;
	school: string;
	castingTime: string | null;
	range: string | null;
	components: string | null;
	duration: string | null;
	classSlugs: string[];
	summary: string | null;
	description: string | null;
	concentration: boolean;
	ritual: boolean;
};

export type FeatCatalogEntry = {
	id: string;
	slug: string;
	name: string;
	prerequisites: string[];
	summary: string | null;
	description: string | null;
};

export type EquipmentCatalogEntry = {
	id: string;
	slug: string;
	name: string;
	category: string;
	summary: string | null;
	description: string | null;
	weight: number | null;
	value: string | null;
	damage: string | null;
	damageType: string | null;
	range: string | null;
	properties: string[];
	isWeapon: boolean;
	isEquippable: boolean;
};

export type ExpandedContentCatalog = {
	species: CharacterSpeciesOption[];
	subspecies: CharacterSubspeciesOption[];
	classes: CharacterClassOption[];
	subclasses: CharacterSubclassOption[];
	backgrounds: CharacterBackgroundOption[];
	spells: SpellCatalogEntry[];
	feats: FeatCatalogEntry[];
	equipment: EquipmentCatalogEntry[];
};
