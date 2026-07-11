import type { ContentMode, ContentVisibility, EditorialStatus } from '$lib/types/content/content';

type SharedPublicationStateInput = {
	isSystemContent: boolean;
	visibility: 'shared' | 'public';
};

type SharedReviewStateInput = {
	visibility: 'shared';
};

export function resolvePrivateDraftState(): {
	contentMode: ContentMode;
	editorialStatus: EditorialStatus;
	visibility: ContentVisibility;
} {
	return {
		contentMode: 'custom',
		editorialStatus: 'private_draft',
		visibility: 'private'
	};
}

export function resolveSharedPublicationState(input: SharedPublicationStateInput): {
	contentMode: ContentMode;
	editorialStatus: EditorialStatus;
	visibility: ContentVisibility;
} {
	return {
		contentMode: input.isSystemContent ? 'canon' : 'custom',
		editorialStatus: 'published',
		visibility: input.visibility
	};
}

export function resolveSharedReviewState(input: SharedReviewStateInput): {
	contentMode: ContentMode;
	editorialStatus: EditorialStatus;
	visibility: ContentVisibility;
} {
	return {
		contentMode: 'custom',
		editorialStatus: 'in_review',
		visibility: input.visibility
	};
}

export function resolveRetiredState(): {
	editorialStatus: EditorialStatus;
	visibility: ContentVisibility;
} {
	return {
		editorialStatus: 'retired',
		visibility: 'private'
	};
}

export function isPublishedSharedContent(input: {
	editorialStatus: string;
	visibility: string;
}): boolean {
	return (
		input.editorialStatus === 'published' &&
		(input.visibility === 'shared' || input.visibility === 'public')
	);
}

export function isPrivateOwnedContent(input: {
	editorialStatus: string;
	visibility: string;
}): boolean {
	return (
		input.visibility === 'private' &&
		(input.editorialStatus === 'private_draft' || input.editorialStatus === 'retired')
	);
}

export function isReviewableSharedContent(input: {
	editorialStatus: string;
	visibility: string;
}): boolean {
	return (
		input.editorialStatus === 'in_review' &&
		input.visibility === 'shared'
	);
}
