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

export type ExpandedContentCatalog = {
	spells: SpellCatalogEntry[];
	feats: FeatCatalogEntry[];
};
