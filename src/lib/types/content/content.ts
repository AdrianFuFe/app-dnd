export type ContentSource = 'srd-5-1' | 'srd-5-2' | 'user-private' | 'homebrew';

export type ContentVisibility = 'private' | 'campaign' | 'shared' | 'public';

export type ContentType =
	| 'species'
	| 'subspecies'
	| 'character-class'
	| 'subclass'
	| 'background'
	| 'spell'
	| 'equipment'
	| 'condition'
	| 'feat'
	| 'monster';

export interface ContentAuditFields {
	createdAt: string;
	updatedAt: string;
}

export interface ContentReference {
	id: string;
	slug: string;
	name: string;
}
