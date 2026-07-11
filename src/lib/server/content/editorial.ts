import {
	isReviewableContentVisibility,
	isSharedContentVisibility,
	normalizeContentVisibility,
	normalizeEditorialStatus,
	type ContentMode,
	type ContentVisibility,
	type EditorialStatus
} from '$lib/types/content/content';

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
		normalizeEditorialStatus(input.editorialStatus) === 'published' &&
		isSharedContentVisibility(normalizeContentVisibility(input.visibility))
	);
}

export function isPrivateOwnedContent(input: {
	editorialStatus: string;
	visibility: string;
}): boolean {
	const editorialStatus = normalizeEditorialStatus(input.editorialStatus);

	return (
		normalizeContentVisibility(input.visibility) === 'private' &&
		(editorialStatus === 'private_draft' || editorialStatus === 'retired')
	);
}

export function isReviewableSharedContent(input: {
	editorialStatus: string;
	visibility: string;
}): boolean {
	return (
		normalizeEditorialStatus(input.editorialStatus) === 'in_review' &&
		isReviewableContentVisibility(normalizeContentVisibility(input.visibility))
	);
}
