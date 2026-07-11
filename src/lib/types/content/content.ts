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

export function isContentSource(value: string): value is ContentSource {
	return (CONTENT_SOURCES as readonly string[]).includes(value);
}

export function isContentVisibility(value: string): value is ContentVisibility {
	return (CONTENT_VISIBILITIES as readonly string[]).includes(value);
}

export function isSharedContentVisibility(value: string): value is SharedContentVisibility {
	return value === 'shared' || value === 'public';
}

export function isReviewableContentVisibility(value: string): value is ReviewableContentVisibility {
	return value === 'shared';
}

export function isRulesetCode(value: string): value is RulesetCode {
	return (RULESET_CODES as readonly string[]).includes(value);
}

export function isContentMode(value: string): value is ContentMode {
	return (CONTENT_MODES as readonly string[]).includes(value);
}

export function isEditorialStatus(value: string): value is EditorialStatus {
	return (EDITORIAL_STATUSES as readonly string[]).includes(value);
}

export function normalizeRulesetCode(value: string): RulesetCode {
	return isRulesetCode(value) ? value : 'dnd-2014-srd';
}

export function normalizeContentMode(value: string): ContentMode {
	return isContentMode(value) ? value : 'custom';
}

export function normalizeEditorialStatus(value: string): EditorialStatus {
	return isEditorialStatus(value) ? value : 'private_draft';
}

export function normalizeContentVisibility(value: string): ContentVisibility {
	return isContentVisibility(value) ? value : 'private';
}

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
