export type ContentSource = 'srd-5-1' | 'srd-5-2' | 'user-private' | 'homebrew';

export const CONTENT_SOURCES = ['srd-5-1', 'srd-5-2', 'user-private', 'homebrew'] as const;

export type ContentVisibility = 'private' | 'campaign' | 'shared' | 'public';

export const CONTENT_VISIBILITIES = ['private', 'campaign', 'shared', 'public'] as const;

export type SharedContentVisibility = Extract<ContentVisibility, 'shared' | 'public'>;

export type ReviewableContentVisibility = Extract<ContentVisibility, 'shared'>;

export type RulesetCode = 'dnd-2014-srd' | 'custom';

export const RULESET_CODES = ['dnd-2014-srd', 'custom'] as const;

export type ContentMode = 'canon' | 'custom';

export const CONTENT_MODES = ['canon', 'custom'] as const;

export type EditorialStatus =
	| 'private_draft'
	| 'shared_draft'
	| 'in_review'
	| 'published'
	| 'retired';

export const EDITORIAL_STATUSES = [
	'private_draft',
	'shared_draft',
	'in_review',
	'published',
	'retired'
] as const;

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
