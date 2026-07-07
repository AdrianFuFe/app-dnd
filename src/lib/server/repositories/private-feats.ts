import type { SupabaseClient } from '@supabase/supabase-js';
import {
	createE2EPrivateFeatForUser,
	isE2EMockSupabaseClient,
	listE2EPrivateFeatsForUser
} from '$lib/server/e2e/mock-app';
import type { Database } from '$lib/types/database/supabase';

type FeatRow = Database['public']['Tables']['feats']['Row'];
type FeatInsert = Database['public']['Tables']['feats']['Insert'];

export type PrivateFeatRecord = {
	id: string;
	slug: string;
	name: string;
	prerequisites: string[];
	summary: string | null;
	description: string | null;
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

export async function listPrivateFeatsForUser(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<PrivateFeatRecord[]> {
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2EPrivateFeatsForUser(userId);
	}

	const sourceId = await loadContentSourceId(supabase, 'user-private');
	const { data, error } = await supabase
		.from('feats')
		.select('id, slug, name, prerequisites, summary, description, created_at, updated_at')
		.eq('owner_user_id', userId)
		.eq('source_id', sourceId)
		.eq('is_system_content', false)
		.order('updated_at', { ascending: false });

	if (error) {
		throw new Error(`Failed to load private feats for user ${userId}`);
	}

	return data.map(mapPrivateFeatRecord);
}

export async function createPrivateFeat(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: CreatePrivateFeatInput
): Promise<PrivateFeatRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		return createE2EPrivateFeatForUser(userId, input);
	}

	const sourceId = await loadContentSourceId(supabase, 'user-private');
	const insert: FeatInsert = {
		owner_user_id: userId,
		source_id: sourceId,
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
		.select('id, slug, name, prerequisites, summary, description, created_at, updated_at')
		.single();

	if (error) {
		if (error.code === '23505') {
			throw new Error('You already have a private feat with that slug. Try a different name.');
		}

		throw new Error(`Failed to create private feat for user ${userId}`);
	}

	return mapPrivateFeatRecord(data);
}

async function loadContentSourceId(
	supabase: SupabaseClient<Database>,
	code: 'user-private'
): Promise<string> {
	const { data, error } = await supabase
		.from('content_sources')
		.select('id')
		.eq('code', code)
		.single();

	if (error || !data) {
		throw new Error(`Failed to resolve content source "${code}"`);
	}

	return data.id;
}

function mapPrivateFeatRecord(
	feat: Pick<
		FeatRow,
		'id' | 'slug' | 'name' | 'prerequisites' | 'summary' | 'description' | 'created_at' | 'updated_at'
	>
): PrivateFeatRecord {
	return {
		id: feat.id,
		slug: feat.slug,
		name: feat.name,
		prerequisites: feat.prerequisites,
		summary: feat.summary,
		description: feat.description,
		createdAt: feat.created_at,
		updatedAt: feat.updated_at
	};
}
