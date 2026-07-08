import type { SupabaseClient } from '@supabase/supabase-js';
import {
	createE2EPrivateSpellForUser,
	isE2EMockSupabaseClient,
	listE2EPrivateSpellsForUser
} from '$lib/server/e2e/mock-app';
import type { Database } from '$lib/types/database/supabase';

type SpellRow = Database['public']['Tables']['spells']['Row'];
type SpellInsert = Database['public']['Tables']['spells']['Insert'];
type ContentSourceCode = 'user-private' | 'homebrew';

export type PrivateSpellRecord = {
	id: string;
	sourceCode: ContentSourceCode;
	slug: string;
	name: string;
	level: number;
	school: string;
	castingTime: string | null;
	range: string | null;
	components: string | null;
	materials: string | null;
	duration: string | null;
	classSlugs: string[];
	summary: string | null;
	description: string | null;
	concentration: boolean;
	ritual: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CreatePrivateSpellInput = {
	slug: string;
	name: string;
	level: number;
	school: string;
	castingTime?: string;
	range?: string;
	components?: string;
	materials?: string;
	duration?: string;
	classSlugs: string[];
	summary?: string;
	description?: string;
	concentration: boolean;
	ritual: boolean;
};

type PrivateSpellRow = Pick<
	SpellRow,
	| 'id'
	| 'source_id'
	| 'slug'
	| 'name'
	| 'level'
	| 'school'
	| 'casting_time'
	| 'range_text'
	| 'components'
	| 'materials'
	| 'duration'
	| 'class_slugs'
	| 'summary'
	| 'description'
	| 'concentration'
	| 'ritual'
	| 'created_at'
	| 'updated_at'
>;

export async function listPrivateSpellsForUser(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<PrivateSpellRecord[]> {
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2EPrivateSpellsForUser(userId);
	}

	const sourceIds = await loadContentSourceIds(supabase, ['user-private', 'homebrew']);
	const { data, error } = await supabase
		.from('spells')
		.select(
			'id, source_id, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, concentration, ritual, created_at, updated_at'
		)
		.eq('owner_user_id', userId)
		.in('source_id', [sourceIds['user-private'], sourceIds.homebrew])
		.eq('is_system_content', false)
		.eq('visibility', 'private')
		.order('updated_at', { ascending: false });

	if (error) {
		throw new Error(`Failed to load private spells for user ${userId}`);
	}

	return data.map((spell) => mapPrivateSpellRecord(spell, sourceIds));
}

export async function createPrivateSpell(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: CreatePrivateSpellInput
): Promise<PrivateSpellRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		return createE2EPrivateSpellForUser(userId, input);
	}

	const sourceIds = await loadContentSourceIds(supabase, ['user-private', 'homebrew']);
	await assertNoExistingPrivateSpellSlug(supabase, userId, input.slug, sourceIds);

	const insert: SpellInsert = {
		owner_user_id: userId,
		source_id: sourceIds['user-private'],
		visibility: 'private',
		slug: input.slug,
		name: input.name,
		level: input.level,
		school: input.school,
		casting_time: input.castingTime ?? null,
		range_text: input.range ?? null,
		components: input.components ?? null,
		materials: input.materials ?? null,
		duration: input.duration ?? null,
		class_slugs: input.classSlugs,
		summary: input.summary ?? null,
		description: input.description ?? null,
		concentration: input.concentration,
		ritual: input.ritual,
		mechanics: [],
		is_system_content: false
	};

	const { data, error } = await supabase
		.from('spells')
		.insert(insert)
		.select(
			'id, source_id, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, concentration, ritual, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to create private spell for user ${userId}`);
	}

	return mapPrivateSpellRecord(data, sourceIds);
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

async function assertNoExistingPrivateSpellSlug(
	supabase: SupabaseClient<Database>,
	userId: string,
	slug: string,
	sourceIds: Record<ContentSourceCode, string>
) {
	const { data, error } = await supabase
		.from('spells')
		.select('id')
		.eq('owner_user_id', userId)
		.eq('slug', slug)
		.in('source_id', [sourceIds['user-private'], sourceIds.homebrew])
		.limit(1);

	if (error) {
		throw new Error(`Failed to check private spell slug "${slug}"`);
	}

	if (data.length > 0) {
		throw new Error('You already have a private spell with that slug. Try a different name.');
	}
}

function mapPrivateSpellRecord(
	spell: PrivateSpellRow,
	sourceIds: Record<ContentSourceCode, string>
): PrivateSpellRecord {
	return {
		id: spell.id,
		sourceCode: spell.source_id === sourceIds.homebrew ? 'homebrew' : 'user-private',
		slug: spell.slug,
		name: spell.name,
		level: spell.level,
		school: spell.school,
		castingTime: spell.casting_time,
		range: spell.range_text,
		components: spell.components,
		materials: spell.materials,
		duration: spell.duration,
		classSlugs: spell.class_slugs,
		summary: spell.summary,
		description: spell.description,
		concentration: spell.concentration,
		ritual: spell.ritual,
		createdAt: spell.created_at,
		updatedAt: spell.updated_at
	};
}
