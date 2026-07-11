import type { SupabaseClient } from '@supabase/supabase-js';
import { error as httpError } from '@sveltejs/kit';
import {
	createE2EPrivateFeatForUser,
	createE2ESharedFeatForUser,
	deleteE2EManagedSharedFeatForUser,
	getE2EFeatCatalogEntry,
	getE2EManagedSharedFeatById,
	isE2EMockSupabaseClient,
	listE2EManagedSharedFeatsForUser,
	listE2EPrivateFeatsForUser,
	retireE2EManagedSharedFeatForUser,
	returnE2EReviewableSharedFeatToPrivateForUser,
	updateE2EManagedSharedFeatForUser
} from '$lib/server/e2e/mock-app';
import {
	isPrivateOwnedContent,
	isPublishedSharedContent,
	isReviewableSharedContent,
	resolvePrivateDraftState,
	resolveRetiredState,
	resolveSharedReviewState,
	resolveSharedPublicationState
} from '$lib/server/content/editorial';
import type { Database } from '$lib/types/database/supabase';
import type { GameMechanic } from '$lib/types/domain/game-mechanics';
import type { AuthorizationContext } from '$lib/types/permissions/permissions';

type FeatRow = Database['public']['Tables']['feats']['Row'];
type FeatInsert = Database['public']['Tables']['feats']['Insert'];
type ContentSourceCode = 'user-private' | 'homebrew' | 'srd-5-1' | 'srd-5-2';
type PrivateFeatSourceCode = 'user-private' | 'homebrew';
type SharedFeatSourceCode = 'homebrew';
type ManagedFeatVisibility = 'shared' | 'public';

export type PrivateFeatDerivation = {
	source: ContentSourceCode;
	contentType: 'feat';
	slug: string;
	name: string;
};

export type PrivateFeatRecord = {
	id: string;
	sourceCode: PrivateFeatSourceCode;
	rulesetCode: string;
	contentMode: 'canon' | 'custom';
	editorialStatus: 'private_draft' | 'shared_draft' | 'in_review' | 'published' | 'retired';
	slug: string;
	name: string;
	prerequisites: string[];
	summary: string | null;
	description: string | null;
	derivation: PrivateFeatDerivation | null;
	createdAt: string;
	updatedAt: string;
};

export type CreatePrivateFeatInput = {
	slug: string;
	name: string;
	prerequisites: string[];
	summary?: string;
	description?: string;
};

export type DerivePrivateFeatInput = {
	sharedFeatId: string;
};

export type CreateSharedFeatInput = CreatePrivateFeatInput & {
	sourceCode?: SharedFeatSourceCode;
	visibility: ManagedFeatVisibility;
	isSystemContent: boolean;
	editorialStatus?: 'in_review' | 'published';
};

export type SharedFeatRecord = {
	id: string;
	sourceCode: SharedFeatSourceCode;
	rulesetCode: string;
	contentMode: 'canon' | 'custom';
	editorialStatus: 'private_draft' | 'shared_draft' | 'in_review' | 'published' | 'retired';
	slug: string;
	name: string;
	prerequisites: string[];
	summary: string | null;
	description: string | null;
	visibility: ManagedFeatVisibility;
	isSystemContent: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ManagedSharedFeatRecord = SharedFeatRecord & {
	ownerUserId: string | null;
};

export type ManagedSharedFeatLifecycleResult = {
	id: string;
	name: string;
};

type PrivateFeatRow = Pick<
	FeatRow,
	| 'id'
	| 'source_id'
	| 'ruleset_code'
	| 'content_mode'
	| 'editorial_status'
	| 'slug'
	| 'name'
	| 'prerequisites'
	| 'summary'
	| 'description'
	| 'mechanics'
	| 'created_at'
	| 'updated_at'
>;

type SharedFeatRow = Pick<
	FeatRow,
	| 'id'
	| 'owner_user_id'
	| 'source_id'
	| 'ruleset_code'
	| 'content_mode'
	| 'editorial_status'
	| 'visibility'
	| 'slug'
	| 'name'
	| 'prerequisites'
	| 'summary'
	| 'description'
	| 'mechanics'
	| 'is_system_content'
>;

export async function listPrivateFeatsForUser(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<PrivateFeatRecord[]> {
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2EPrivateFeatsForUser(userId);
	}

	const sourceIds = await loadContentSourceIds(supabase, ['user-private', 'homebrew']);
	const { data, error } = await supabase
		.from('feats')
		.select(
			'id, source_id, ruleset_code, content_mode, editorial_status, slug, name, prerequisites, summary, description, mechanics, created_at, updated_at'
		)
		.eq('owner_user_id', userId)
		.in('source_id', [sourceIds['user-private'], sourceIds.homebrew])
		.eq('is_system_content', false)
		.order('updated_at', { ascending: false });

	if (error) {
		throw new Error(`Failed to load private feats for user ${userId}`);
	}

	return data
		.filter((feat) =>
			isPrivateOwnedContent({
				editorialStatus: feat.editorial_status,
				visibility: 'private'
			})
		)
		.map((feat) => mapPrivateFeatRecord(feat, sourceIds));
}

export async function createPrivateFeat(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: CreatePrivateFeatInput
): Promise<PrivateFeatRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		return createE2EPrivateFeatForUser(userId, input);
	}

	const sourceIds = await loadContentSourceIds(supabase, ['user-private', 'homebrew']);
	await assertNoExistingPrivateFeatSlug(supabase, userId, input.slug, sourceIds);
	const privateDraftState = resolvePrivateDraftState();

	const insert: FeatInsert = {
		owner_user_id: userId,
		source_id: sourceIds['user-private'],
		ruleset_code: 'dnd-2014-srd',
		content_mode: privateDraftState.contentMode,
		editorial_status: privateDraftState.editorialStatus,
		visibility: privateDraftState.visibility,
		slug: input.slug,
		name: input.name,
		prerequisites: input.prerequisites,
		summary: input.summary ?? null,
		description: input.description ?? null,
		mechanics: [],
		is_system_content: false
	};

	const { data, error } = await supabase
		.from('feats')
		.insert(insert)
		.select(
			'id, source_id, ruleset_code, content_mode, editorial_status, slug, name, prerequisites, summary, description, mechanics, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to create private feat for user ${userId}`);
	}

	return mapPrivateFeatRecord(data, sourceIds);
}

export async function derivePrivateFeatFromSharedCatalog(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: DerivePrivateFeatInput
): Promise<PrivateFeatRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		const sharedFeat = getE2EFeatCatalogEntry(input.sharedFeatId);

		if (!sharedFeat) {
			throw new Error('Please choose a valid shared feat to copy.');
		}

		return createE2EPrivateFeatForUser(userId, {
			sourceCode: 'homebrew',
			slug: sharedFeat.slug,
			name: sharedFeat.name,
			prerequisites: [...sharedFeat.prerequisites],
			summary: sharedFeat.summary ?? undefined,
			description: sharedFeat.description ?? undefined,
			derivation: {
				source: 'srd-5-1',
				contentType: 'feat',
				slug: sharedFeat.slug,
				name: sharedFeat.name
			}
		});
	}

	const [privateSourceIds, allSourceIds, sharedFeat] = await Promise.all([
		loadContentSourceIds(supabase, ['user-private', 'homebrew']),
		loadContentSourceIds(supabase, ['user-private', 'homebrew', 'srd-5-1', 'srd-5-2']),
		loadSharedFeatForDerivation(supabase, input.sharedFeatId)
	]);

	await assertNoExistingPrivateFeatSlug(supabase, userId, sharedFeat.slug, privateSourceIds);
	const privateDraftState = resolvePrivateDraftState();

	const sharedSourceCode =
		findSourceCodeById(allSourceIds, sharedFeat.source_id) === 'srd-5-2'
			? 'srd-5-2'
			: 'srd-5-1';
	const insert: FeatInsert = {
		owner_user_id: userId,
		source_id: privateSourceIds.homebrew,
		ruleset_code: 'dnd-2014-srd',
		content_mode: privateDraftState.contentMode,
		editorial_status: privateDraftState.editorialStatus,
		visibility: privateDraftState.visibility,
		slug: sharedFeat.slug,
		name: sharedFeat.name,
		prerequisites: sharedFeat.prerequisites,
		summary: sharedFeat.summary,
		description: sharedFeat.description,
		mechanics: [
			...normalizeMechanics(sharedFeat.mechanics),
			buildPrivateFeatDerivationMechanic({
				source: sharedSourceCode,
				slug: sharedFeat.slug,
				name: sharedFeat.name
			})
		],
		is_system_content: false
	};

	const { data, error } = await supabase
		.from('feats')
		.insert(insert)
		.select(
			'id, source_id, ruleset_code, content_mode, editorial_status, slug, name, prerequisites, summary, description, mechanics, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to derive private feat for user ${userId}`);
	}

	return mapPrivateFeatRecord(data, privateSourceIds);
}

export async function createSharedFeat(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: CreateSharedFeatInput
): Promise<SharedFeatRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		const created = createE2ESharedFeatForUser(userId, input);

		return {
			id: created.id,
			sourceCode: created.sourceCode,
			rulesetCode: created.rulesetCode,
			contentMode: created.contentMode,
			editorialStatus: created.editorialStatus,
			slug: created.slug,
			name: created.name,
			prerequisites: [...created.prerequisites],
			summary: created.summary,
			description: created.description,
			visibility: created.visibility === 'public' ? 'public' : 'shared',
			isSystemContent: created.isSystemContent,
			createdAt: created.createdAt,
			updatedAt: created.updatedAt
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	await assertNoExistingSharedFeatSlug(supabase, input.slug, sourceIds);
	const publicationState =
		input.editorialStatus === 'in_review'
			? resolveSharedReviewState({ visibility: 'shared' })
			: resolveSharedPublicationState({
					isSystemContent: input.isSystemContent,
					visibility: input.visibility
				});

	const insert: FeatInsert = {
		owner_user_id: input.isSystemContent ? null : userId,
		source_id: sourceIds.homebrew,
		ruleset_code: 'dnd-2014-srd',
		content_mode: publicationState.contentMode,
		editorial_status: publicationState.editorialStatus,
		visibility: publicationState.visibility,
		slug: input.slug,
		name: input.name,
		prerequisites: input.prerequisites,
		summary: input.summary ?? null,
		description: input.description ?? null,
		mechanics: [],
		is_system_content: input.isSystemContent
	};

	const { data, error } = await supabase
		.from('feats')
		.insert(insert)
		.select(
			'id, source_id, ruleset_code, content_mode, editorial_status, slug, name, prerequisites, summary, description, visibility, is_system_content, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(
			input.isSystemContent
				? `Failed to create system feat for user ${userId}`
				: `Failed to create shared feat for user ${userId}`
		);
	}

	return mapSharedFeatRecord(data, sourceIds);
}

export async function listManagedSharedFeats(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext
): Promise<ManagedSharedFeatRecord[]> {
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2EManagedSharedFeatsForUser(
			authorization.userId,
			authorization.globalRole === 'admin'
		).map((feat) => ({
			id: feat.id,
			sourceCode: feat.sourceCode,
			rulesetCode: feat.rulesetCode,
			contentMode: feat.contentMode,
			editorialStatus: feat.editorialStatus,
			slug: feat.slug,
			name: feat.name,
			prerequisites: [...feat.prerequisites],
			summary: feat.summary,
			description: feat.description,
			visibility: feat.visibility === 'public' ? 'public' : 'shared',
			isSystemContent: feat.isSystemContent,
			createdAt: feat.createdAt,
			updatedAt: feat.updatedAt,
			ownerUserId: feat.userId
		}));
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const query = supabase
		.from('feats')
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, slug, name, prerequisites, summary, description, visibility, is_system_content, created_at, updated_at'
		)
		.eq('source_id', sourceIds.homebrew)
		.not('visibility', 'in', '(private,campaign)')
		.order('updated_at', { ascending: false });

	const { data, error } =
		authorization.globalRole === 'admin'
			? await query
			: await query.eq('owner_user_id', authorization.userId).eq('is_system_content', false);

	if (error) {
		throw new Error(`Failed to load managed shared feats for user ${authorization.userId}`);
	}

	return data
		.filter((feat) =>
			isPublishedSharedContent({
				editorialStatus: feat.editorial_status,
				visibility: feat.visibility
			})
		)
		.map((feat) => mapManagedSharedFeatRecord(feat, sourceIds));
}

export async function listReviewableSharedFeats(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext
): Promise<ManagedSharedFeatRecord[]> {
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2EManagedSharedFeatsForUser(
			authorization.userId,
			authorization.globalRole === 'admin',
			'in_review'
		).map((feat) => ({
			id: feat.id,
			sourceCode: feat.sourceCode,
			rulesetCode: feat.rulesetCode,
			contentMode: feat.contentMode,
			editorialStatus: feat.editorialStatus,
			slug: feat.slug,
			name: feat.name,
			prerequisites: [...feat.prerequisites],
			summary: feat.summary,
			description: feat.description,
			visibility: feat.visibility === 'public' ? 'public' : 'shared',
			isSystemContent: feat.isSystemContent,
			createdAt: feat.createdAt,
			updatedAt: feat.updatedAt,
			ownerUserId: feat.userId
		}));
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const query = supabase
		.from('feats')
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, slug, name, prerequisites, summary, description, visibility, is_system_content, created_at, updated_at'
		)
		.eq('source_id', sourceIds.homebrew)
		.eq('editorial_status', 'in_review')
		.eq('visibility', 'shared')
		.order('updated_at', { ascending: false });

	const { data, error } =
		authorization.globalRole === 'admin'
			? await query
			: await query.eq('is_system_content', false);

	if (error) {
		throw new Error(`Failed to load reviewable shared feats for user ${authorization.userId}`);
	}

	return data
		.filter((feat) =>
			isReviewableSharedContent({
				editorialStatus: feat.editorial_status,
				visibility: feat.visibility
			})
		)
		.map((feat) => mapManagedSharedFeatRecord(feat, sourceIds));
}

export async function publishReviewableSharedFeat(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext,
	featId: string
): Promise<ManagedSharedFeatRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		const feat = loadE2EReviewableSharedFeatById(featId);
		assertManagedSharedFeatAccess(authorization, feat, 'update');
		const updated = updateE2EManagedSharedFeatForUser(authorization.userId, {
			featId,
			name: feat.name,
			slug: feat.slug,
			prerequisites: feat.prerequisites,
			summary: feat.summary ?? undefined,
			description: feat.description ?? undefined,
			includeSystemContent: authorization.globalRole === 'admin',
			editorialStatus: 'published'
		});

		return {
			id: updated.id,
			sourceCode: updated.sourceCode,
			rulesetCode: updated.rulesetCode,
			contentMode: updated.contentMode,
			editorialStatus: updated.editorialStatus,
			slug: updated.slug,
			name: updated.name,
			prerequisites: [...updated.prerequisites],
			summary: updated.summary,
			description: updated.description,
			visibility: updated.visibility === 'public' ? 'public' : 'shared',
			isSystemContent: updated.isSystemContent,
			createdAt: updated.createdAt,
			updatedAt: updated.updatedAt,
			ownerUserId: updated.userId
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const feat = await loadReviewableSharedFeatById(supabase, featId, sourceIds);
	assertManagedSharedFeatAccess(authorization, feat, 'update');
	await assertNoExistingSharedFeatSlug(supabase, feat.slug, sourceIds, feat.id);

	const { data, error } = await supabase
		.from('feats')
		.update({ editorial_status: 'published' })
		.eq('id', feat.id)
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, slug, name, prerequisites, summary, description, visibility, is_system_content, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to publish reviewed feat ${feat.id}`);
	}

	return mapManagedSharedFeatRecord(data, sourceIds);
}

export async function returnReviewableSharedFeatToPrivate(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext,
	featId: string
): Promise<ManagedSharedFeatLifecycleResult> {
	if (isE2EMockSupabaseClient(supabase)) {
		const feat = loadE2EReviewableSharedFeatById(featId);
		assertManagedSharedFeatAccess(authorization, feat, 'update');
		const returned = returnE2EReviewableSharedFeatToPrivateForUser(authorization.userId, {
			featId,
			includeSystemContent: authorization.globalRole === 'admin'
		});

		return {
			id: returned.id,
			name: returned.name
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const feat = await loadReviewableSharedFeatById(supabase, featId, sourceIds);
	assertManagedSharedFeatAccess(authorization, feat, 'update');
	const privateDraftState = resolvePrivateDraftState();

	const { error } = await supabase
		.from('feats')
		.update({
			visibility: privateDraftState.visibility,
			editorial_status: privateDraftState.editorialStatus
		})
		.eq('id', feat.id);

	if (error) {
		throw new Error(`Failed to return reviewed feat ${feat.id} to private draft`);
	}

	return {
		id: feat.id,
		name: feat.name
	};
}

export async function updateReviewableSharedFeat(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext,
	input: CreatePrivateFeatInput & {
		featId: string;
	}
): Promise<ManagedSharedFeatRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		const feat = loadE2EReviewableSharedFeatById(input.featId);
		assertManagedSharedFeatAccess(authorization, feat, 'update');
		const updated = updateE2EManagedSharedFeatForUser(authorization.userId, {
			featId: input.featId,
			name: input.name,
			slug: input.slug,
			prerequisites: input.prerequisites,
			summary: input.summary,
			description: input.description,
			includeSystemContent: authorization.globalRole === 'admin',
			editorialStatus: 'in_review'
		});

		return {
			id: updated.id,
			sourceCode: updated.sourceCode,
			rulesetCode: updated.rulesetCode,
			contentMode: updated.contentMode,
			editorialStatus: updated.editorialStatus,
			slug: updated.slug,
			name: updated.name,
			prerequisites: [...updated.prerequisites],
			summary: updated.summary,
			description: updated.description,
			visibility: updated.visibility === 'public' ? 'public' : 'shared',
			isSystemContent: updated.isSystemContent,
			createdAt: updated.createdAt,
			updatedAt: updated.updatedAt,
			ownerUserId: updated.userId
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const feat = await loadReviewableSharedFeatById(supabase, input.featId, sourceIds);
	assertManagedSharedFeatAccess(authorization, feat, 'update');
	await assertNoExistingSharedFeatSlug(supabase, input.slug, sourceIds, feat.id);

	const { data, error } = await supabase
		.from('feats')
		.update({
			slug: input.slug,
			name: input.name,
			prerequisites: input.prerequisites,
			summary: input.summary ?? null,
			description: input.description ?? null
		})
		.eq('id', feat.id)
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, slug, name, prerequisites, summary, description, visibility, is_system_content, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to update shared feat in review ${feat.id}`);
	}

	return mapManagedSharedFeatRecord(data, sourceIds);
}

export async function updateManagedSharedFeat(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext,
	input: CreatePrivateFeatInput & {
		featId: string;
	}
): Promise<ManagedSharedFeatRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		const feat = loadE2EManagedSharedFeatById(input.featId);
		assertManagedSharedFeatAccess(authorization, feat, 'update');
		const updated = updateE2EManagedSharedFeatForUser(authorization.userId, {
			featId: input.featId,
			name: input.name,
			slug: input.slug,
			prerequisites: input.prerequisites,
			summary: input.summary,
			description: input.description,
			includeSystemContent: authorization.globalRole === 'admin'
		});

		return {
			id: updated.id,
			sourceCode: updated.sourceCode,
			rulesetCode: updated.rulesetCode,
			contentMode: updated.contentMode,
			editorialStatus: updated.editorialStatus,
			slug: updated.slug,
			name: updated.name,
			prerequisites: [...updated.prerequisites],
			summary: updated.summary,
			description: updated.description,
			visibility: updated.visibility === 'public' ? 'public' : 'shared',
			isSystemContent: updated.isSystemContent,
			createdAt: updated.createdAt,
			updatedAt: updated.updatedAt,
			ownerUserId: updated.userId
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const feat = await loadManagedSharedFeatById(supabase, input.featId, sourceIds);
	assertManagedSharedFeatAccess(authorization, feat, 'update');

	await assertNoExistingSharedFeatSlug(supabase, input.slug, sourceIds, feat.id);

	const { data, error } = await supabase
		.from('feats')
		.update({
			slug: input.slug,
			name: input.name,
			prerequisites: input.prerequisites,
			summary: input.summary ?? null,
			description: input.description ?? null
		})
		.eq('id', feat.id)
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, slug, name, prerequisites, summary, description, visibility, is_system_content, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to update shared feat ${feat.id}`);
	}

	return mapManagedSharedFeatRecord(data, sourceIds);
}

export async function retireManagedSharedFeat(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext,
	featId: string
): Promise<ManagedSharedFeatLifecycleResult> {
	if (isE2EMockSupabaseClient(supabase)) {
		const feat = loadE2EManagedSharedFeatById(featId);
		assertManagedSharedFeatAccess(authorization, feat, 'retire');
		const retired = retireE2EManagedSharedFeatForUser(authorization.userId, {
			featId,
			includeSystemContent: authorization.globalRole === 'admin'
		});

		return {
			id: retired.id,
			name: retired.name
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const feat = await loadManagedSharedFeatById(supabase, featId, sourceIds);
	assertManagedSharedFeatAccess(authorization, feat, 'retire');
	const retiredState = resolveRetiredState();

	const { error } = await supabase
		.from('feats')
		.update({
			visibility: retiredState.visibility,
			editorial_status: retiredState.editorialStatus
		})
		.eq('id', feat.id);

	if (error) {
		throw new Error(`Failed to retire shared feat ${feat.id}`);
	}

	return {
		id: feat.id,
		name: feat.name
	};
}

export async function deleteManagedSharedFeat(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext,
	featId: string
): Promise<ManagedSharedFeatLifecycleResult> {
	if (isE2EMockSupabaseClient(supabase)) {
		const feat = loadE2EManagedSharedFeatById(featId);
		assertManagedSharedFeatAccess(authorization, feat, 'delete');
		const deleted = deleteE2EManagedSharedFeatForUser(authorization.userId, {
			featId,
			includeSystemContent: authorization.globalRole === 'admin'
		});

		return {
			id: deleted.id,
			name: deleted.name
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const feat = await loadManagedSharedFeatById(supabase, featId, sourceIds);
	assertManagedSharedFeatAccess(authorization, feat, 'delete');

	const { error } = await supabase.from('feats').delete().eq('id', feat.id);

	if (error) {
		throw new Error(`Failed to delete shared feat ${feat.id}`);
	}

	return {
		id: feat.id,
		name: feat.name
	};
}

export function buildPrivateFeatDerivationMechanic(input: {
	source: ContentSourceCode;
	slug: string;
	name: string;
}): GameMechanic {
	return {
		type: 'source_derivation',
		source: input.source,
		contentType: 'feat',
		slug: input.slug,
		name: input.name
	};
}

export function extractPrivateFeatDerivation(mechanics: unknown): PrivateFeatDerivation | null {
	for (const mechanic of normalizeMechanics(mechanics)) {
		if (mechanic.type === 'source_derivation' && mechanic.contentType === 'feat') {
			return {
				source: mechanic.source,
				contentType: mechanic.contentType,
				slug: mechanic.slug,
				name: mechanic.name
			};
		}
	}

	return null;
}

async function loadContentSourceIds<TCode extends ContentSourceCode>(
	supabase: SupabaseClient<Database>,
	codes: readonly TCode[]
): Promise<Record<TCode, string>> {
	const { data, error } = await supabase
		.from('content_sources')
		.select('id, code')
		.in('code', codes);

	if (error || !data) {
		throw new Error('Failed to resolve required content sources.');
	}

	const ids = {} as Record<TCode, string>;

	for (const code of codes) {
		const entry = data.find((row) => row.code === code);

		if (!entry) {
			throw new Error(`Failed to resolve content source "${code}"`);
		}

		ids[code] = entry.id;
	}

	return ids;
}

async function loadSharedFeatForDerivation(
	supabase: SupabaseClient<Database>,
	featId: string
): Promise<SharedFeatRow> {
	const { data, error } = await supabase
		.from('feats')
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, visibility, slug, name, prerequisites, summary, description, mechanics, is_system_content'
		)
		.eq('id', featId)
		.single();

	if (
		error ||
		!data ||
		!isPublishedSharedContent({
			editorialStatus: data.editorial_status,
			visibility: data.visibility
		})
	) {
		throw new Error('Please choose a valid shared feat to copy.');
	}

	return data;
}

async function loadManagedSharedFeatById(
	supabase: SupabaseClient<Database>,
	featId: string,
	sourceIds: Record<SharedFeatSourceCode, string>
): Promise<SharedFeatRow> {
	const { data, error } = await supabase
		.from('feats')
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, visibility, slug, name, prerequisites, summary, description, mechanics, is_system_content'
		)
		.eq('id', featId)
		.eq('source_id', sourceIds.homebrew)
		.single();

	if (
		error ||
		!data ||
		!isPublishedSharedContent({
			editorialStatus: data.editorial_status,
			visibility: data.visibility
		})
	) {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	return data;
}

async function loadReviewableSharedFeatById(
	supabase: SupabaseClient<Database>,
	featId: string,
	sourceIds: Record<SharedFeatSourceCode, string>
): Promise<SharedFeatRow> {
	const { data, error } = await supabase
		.from('feats')
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, visibility, slug, name, prerequisites, summary, description, mechanics, is_system_content'
		)
		.eq('id', featId)
		.eq('source_id', sourceIds.homebrew)
		.single();

	if (
		error ||
		!data ||
		!isReviewableSharedContent({
			editorialStatus: data.editorial_status,
			visibility: data.visibility
		})
	) {
		throw new Error('Please choose a valid shared feat to review.');
	}

	return data;
}

async function assertNoExistingPrivateFeatSlug(
	supabase: SupabaseClient<Database>,
	userId: string,
	slug: string,
	sourceIds: Record<PrivateFeatSourceCode, string>
) {
	const { data, error } = await supabase
		.from('feats')
		.select('id, editorial_status, visibility')
		.eq('owner_user_id', userId)
		.eq('slug', slug)
		.in('source_id', [sourceIds['user-private'], sourceIds.homebrew])
		.limit(1);

	if (error) {
		throw new Error(`Failed to check private feat slug "${slug}"`);
	}

	if (
		data.some((feat) =>
			isPrivateOwnedContent({
				editorialStatus: feat.editorial_status ?? 'private_draft',
				visibility: feat.visibility ?? 'private'
			})
		)
	) {
		throw new Error('You already have a private feat with that slug. Try a different name.');
	}
}

async function assertNoExistingSharedFeatSlug(
	supabase: SupabaseClient<Database>,
	slug: string,
	sourceIds: Record<SharedFeatSourceCode, string>,
	excludeFeatId?: string
) {
	const query = supabase
		.from('feats')
		.select('id, editorial_status, visibility')
		.eq('slug', slug)
		.eq('source_id', sourceIds.homebrew)
		.limit(2);

	const { data, error } = excludeFeatId ? await query.neq('id', excludeFeatId) : await query;

	if (error) {
		throw new Error(`Failed to check shared feat slug "${slug}"`);
	}

	if (
		data.some((feat) =>
			isPublishedSharedContent({
				editorialStatus: feat.editorial_status,
				visibility: feat.visibility
			})
		)
	) {
		throw new Error('A shared feat with that slug already exists. Try a different name.');
	}
}

function mapPrivateFeatRecord(
	feat: PrivateFeatRow,
	sourceIds: Record<PrivateFeatSourceCode, string>
): PrivateFeatRecord {
	return {
		id: feat.id,
		sourceCode: feat.source_id === sourceIds.homebrew ? 'homebrew' : 'user-private',
		rulesetCode: feat.ruleset_code,
		contentMode: feat.content_mode,
		editorialStatus: feat.editorial_status,
		slug: feat.slug,
		name: feat.name,
		prerequisites: feat.prerequisites,
		summary: feat.summary,
		description: feat.description,
		derivation: extractPrivateFeatDerivation(feat.mechanics),
		createdAt: feat.created_at,
		updatedAt: feat.updated_at
	};
}

function mapSharedFeatRecord(
	feat: Pick<
		FeatRow,
		| 'id'
		| 'source_id'
		| 'ruleset_code'
		| 'content_mode'
		| 'editorial_status'
		| 'slug'
		| 'name'
		| 'prerequisites'
		| 'summary'
		| 'description'
		| 'visibility'
		| 'is_system_content'
		| 'created_at'
		| 'updated_at'
	>,
	sourceIds: Record<SharedFeatSourceCode, string>
): SharedFeatRecord {
	return {
		id: feat.id,
		sourceCode: feat.source_id === sourceIds.homebrew ? 'homebrew' : 'homebrew',
		rulesetCode: feat.ruleset_code,
		contentMode: feat.content_mode,
		editorialStatus: feat.editorial_status,
		slug: feat.slug,
		name: feat.name,
		prerequisites: feat.prerequisites,
		summary: feat.summary,
		description: feat.description,
		visibility: feat.visibility === 'public' ? 'public' : 'shared',
		isSystemContent: feat.is_system_content,
		createdAt: feat.created_at,
		updatedAt: feat.updated_at
	};
}

function mapManagedSharedFeatRecord(
	feat: Pick<
		FeatRow,
		| 'id'
		| 'owner_user_id'
		| 'source_id'
		| 'ruleset_code'
		| 'content_mode'
		| 'editorial_status'
		| 'slug'
		| 'name'
		| 'prerequisites'
		| 'summary'
		| 'description'
		| 'visibility'
		| 'is_system_content'
		| 'created_at'
		| 'updated_at'
	>,
	sourceIds: Record<SharedFeatSourceCode, string>
): ManagedSharedFeatRecord {
	return {
		...mapSharedFeatRecord(feat, sourceIds),
		ownerUserId: feat.owner_user_id
	};
}

function normalizeMechanics(mechanics: unknown): GameMechanic[] {
	return Array.isArray(mechanics) ? (mechanics as GameMechanic[]) : [];
}

function loadE2EManagedSharedFeatById(featId: string) {
	const feat = getE2EManagedSharedFeatById(featId);

	if (
		!feat ||
		!isPublishedSharedContent({
			editorialStatus: feat.editorialStatus,
			visibility: feat.visibility
		})
	) {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	return {
		...feat,
		owner_user_id: feat.userId,
		is_system_content: feat.isSystemContent
	};
}

function loadE2EReviewableSharedFeatById(featId: string) {
	const feat = getE2EManagedSharedFeatById(featId);

	if (
		!feat ||
		!isReviewableSharedContent({
			editorialStatus: feat.editorialStatus,
			visibility: feat.visibility
		})
	) {
		throw new Error('Please choose a valid shared feat to review.');
	}

	return {
		...feat,
		owner_user_id: feat.userId,
		is_system_content: feat.isSystemContent
	};
}

function assertManagedSharedFeatAccess(
	authorization: AuthorizationContext,
	feat: Pick<SharedFeatRow, 'owner_user_id' | 'is_system_content'>,
	operation: 'update' | 'retire' | 'delete'
) {
	if (feat.is_system_content) {
		if (authorization.globalRole !== 'admin') {
			throw httpError(403, `Admin role required to ${operation} system-owned feats.`);
		}

		return;
	}

	if (authorization.globalRole !== 'admin' && feat.owner_user_id !== authorization.userId) {
		throw httpError(403, `You can only ${operation} your own shared feats.`);
	}
}

function findSourceCodeById(
	sourceIds: Partial<Record<ContentSourceCode, string>>,
	sourceId: string
): ContentSourceCode | null {
	for (const [code, id] of Object.entries(sourceIds)) {
		if (id === sourceId) {
			return code as ContentSourceCode;
		}
	}

	return null;
}
