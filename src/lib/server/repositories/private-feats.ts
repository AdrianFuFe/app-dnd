import type { SupabaseClient } from '@supabase/supabase-js';
import {
	createE2EPrivateFeatForUser,
	getE2EFeatCatalogEntry,
	isE2EMockSupabaseClient,
	listE2EPrivateFeatsForUser
} from '$lib/server/e2e/mock-app';
import type { Database } from '$lib/types/database/supabase';
import type { GameMechanic } from '$lib/types/domain/game-mechanics';

type FeatRow = Database['public']['Tables']['feats']['Row'];
type FeatInsert = Database['public']['Tables']['feats']['Insert'];
type ContentSourceCode = 'user-private' | 'homebrew' | 'srd-5-1' | 'srd-5-2';
type PrivateFeatSourceCode = 'user-private' | 'homebrew';

export type PrivateFeatDerivation = {
	source: ContentSourceCode;
	contentType: 'feat';
	slug: string;
	name: string;
};

export type PrivateFeatRecord = {
	id: string;
	sourceCode: PrivateFeatSourceCode;
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

type PrivateFeatRow = Pick<
	FeatRow,
	| 'id'
	| 'source_id'
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
	| 'source_id'
	| 'visibility'
	| 'slug'
	| 'name'
	| 'prerequisites'
	| 'summary'
	| 'description'
	| 'mechanics'
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
			'id, source_id, slug, name, prerequisites, summary, description, mechanics, created_at, updated_at'
		)
		.eq('owner_user_id', userId)
		.in('source_id', [sourceIds['user-private'], sourceIds.homebrew])
		.eq('is_system_content', false)
		.order('updated_at', { ascending: false });

	if (error) {
		throw new Error(`Failed to load private feats for user ${userId}`);
	}

	return data.map((feat) => mapPrivateFeatRecord(feat, sourceIds));
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

	const insert: FeatInsert = {
		owner_user_id: userId,
		source_id: sourceIds['user-private'],
		visibility: 'private',
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
			'id, source_id, slug, name, prerequisites, summary, description, mechanics, created_at, updated_at'
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

	const sharedSourceCode =
		findSourceCodeById(allSourceIds, sharedFeat.source_id) === 'srd-5-2' ? 'srd-5-2' : 'srd-5-1';
	const insert: FeatInsert = {
		owner_user_id: userId,
		source_id: privateSourceIds.homebrew,
		visibility: 'private',
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
			'id, source_id, slug, name, prerequisites, summary, description, mechanics, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to derive private feat for user ${userId}`);
	}

	return mapPrivateFeatRecord(data, privateSourceIds);
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
	const { data, error } = await supabase.from('content_sources').select('id, code').in('code', codes);

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
		.select('id, source_id, visibility, slug, name, prerequisites, summary, description, mechanics')
		.eq('id', featId)
		.single();

	if (error || !data || data.visibility === 'private' || data.visibility === 'campaign') {
		throw new Error('Please choose a valid shared feat to copy.');
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
		.select('id')
		.eq('owner_user_id', userId)
		.eq('slug', slug)
		.in('source_id', [sourceIds['user-private'], sourceIds.homebrew])
		.limit(1);

	if (error) {
		throw new Error(`Failed to check private feat slug "${slug}"`);
	}

	if (data.length > 0) {
		throw new Error('You already have a private feat with that slug. Try a different name.');
	}
}

function mapPrivateFeatRecord(
	feat: PrivateFeatRow,
	sourceIds: Record<PrivateFeatSourceCode, string>
): PrivateFeatRecord {
	return {
		id: feat.id,
		sourceCode: feat.source_id === sourceIds.homebrew ? 'homebrew' : 'user-private',
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

function normalizeMechanics(mechanics: unknown): GameMechanic[] {
	return Array.isArray(mechanics) ? (mechanics as GameMechanic[]) : [];
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
