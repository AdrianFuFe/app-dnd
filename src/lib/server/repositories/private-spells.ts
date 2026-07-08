import type { SupabaseClient } from '@supabase/supabase-js';
import {
	createE2ESharedSpellForUser,
	isE2EMockSupabaseClient,
	createE2EPrivateSpellForUser,
	getE2ESpellCatalogEntry,
	listE2EPrivateSpellsForUser
} from '$lib/server/e2e/mock-app';
import type { Database } from '$lib/types/database/supabase';
import type { GameMechanic } from '$lib/types/domain/game-mechanics';

type SpellRow = Database['public']['Tables']['spells']['Row'];
type SpellInsert = Database['public']['Tables']['spells']['Insert'];
type ContentSourceCode = 'user-private' | 'homebrew' | 'srd-5-1' | 'srd-5-2';
type PrivateSpellSourceCode = 'user-private' | 'homebrew';
type SharedSpellSourceCode = 'homebrew';
type ManagedSpellVisibility = 'shared' | 'public';

export type PrivateSpellDerivation = {
	source: ContentSourceCode;
	contentType: 'spell';
	slug: string;
	name: string;
};

export type PrivateSpellRecord = {
	id: string;
	sourceCode: PrivateSpellSourceCode;
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
	derivation: PrivateSpellDerivation | null;
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

export type DerivePrivateSpellInput = {
	sharedSpellId: string;
};

export type CreateSharedSpellInput = CreatePrivateSpellInput & {
	sourceCode?: SharedSpellSourceCode;
	visibility: ManagedSpellVisibility;
	isSystemContent: boolean;
};

export type SharedSpellRecord = {
	id: string;
	sourceCode: SharedSpellSourceCode;
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
	visibility: ManagedSpellVisibility;
	isSystemContent: boolean;
	concentration: boolean;
	ritual: boolean;
	createdAt: string;
	updatedAt: string;
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
	| 'mechanics'
	| 'concentration'
	| 'ritual'
	| 'created_at'
	| 'updated_at'
>;

type SharedSpellRow = Pick<
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
	| 'visibility'
	| 'concentration'
	| 'ritual'
	| 'is_system_content'
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
			'id, source_id, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, mechanics, concentration, ritual, created_at, updated_at'
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
			'id, source_id, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, mechanics, concentration, ritual, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to create private spell for user ${userId}`);
	}

	return mapPrivateSpellRecord(data, sourceIds);
}

export async function derivePrivateSpellFromSharedCatalog(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: DerivePrivateSpellInput
): Promise<PrivateSpellRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		const sharedSpell = getE2ESpellCatalogEntry(input.sharedSpellId);

		if (!sharedSpell) {
			throw new Error('Please choose a valid shared spell to copy.');
		}

		return createE2EPrivateSpellForUser(userId, {
			sourceCode: 'homebrew',
			slug: sharedSpell.slug,
			name: sharedSpell.name,
			level: sharedSpell.level,
			school: sharedSpell.school,
			castingTime: sharedSpell.castingTime ?? undefined,
			range: sharedSpell.range ?? undefined,
			components: sharedSpell.components ?? undefined,
			materials: undefined,
			duration: sharedSpell.duration ?? undefined,
			classSlugs: [...sharedSpell.classSlugs],
			summary: sharedSpell.summary ?? undefined,
			description: sharedSpell.description ?? undefined,
			derivation: {
				source: 'srd-5-1',
				contentType: 'spell',
				slug: sharedSpell.slug,
				name: sharedSpell.name
			},
			concentration: sharedSpell.concentration,
			ritual: sharedSpell.ritual
		});
	}

	const [privateSourceIds, allSourceIds, sharedSpell] = await Promise.all([
		loadContentSourceIds(supabase, ['user-private', 'homebrew']),
		loadContentSourceIds(supabase, ['user-private', 'homebrew', 'srd-5-1', 'srd-5-2']),
		loadSharedSpellForDerivation(supabase, input.sharedSpellId)
	]);

	await assertNoExistingPrivateSpellSlug(supabase, userId, sharedSpell.slug, privateSourceIds);

	const sharedSourceCode =
		findSourceCodeById(allSourceIds, sharedSpell.source_id) === 'srd-5-2' ? 'srd-5-2' : 'srd-5-1';
	const insert: SpellInsert = {
		owner_user_id: userId,
		source_id: privateSourceIds.homebrew,
		visibility: 'private',
		slug: sharedSpell.slug,
		name: sharedSpell.name,
		level: sharedSpell.level,
		school: sharedSpell.school,
		casting_time: sharedSpell.casting_time,
		range_text: sharedSpell.range_text,
		components: sharedSpell.components,
		materials: sharedSpell.materials,
		duration: sharedSpell.duration,
		class_slugs: sharedSpell.class_slugs,
		summary: sharedSpell.summary,
		description: sharedSpell.description,
		mechanics: [
			...normalizeMechanics(sharedSpell.mechanics),
			buildPrivateSpellDerivationMechanic({
				source: sharedSourceCode,
				slug: sharedSpell.slug,
				name: sharedSpell.name
			})
		],
		concentration: sharedSpell.concentration,
		ritual: sharedSpell.ritual,
		is_system_content: false
	};

	const { data, error } = await supabase
		.from('spells')
		.insert(insert)
		.select(
			'id, source_id, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, mechanics, concentration, ritual, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to derive private spell for user ${userId}`);
	}

	return mapPrivateSpellRecord(data, privateSourceIds);
}

export async function createSharedSpell(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: CreateSharedSpellInput
): Promise<SharedSpellRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		const created = createE2ESharedSpellForUser(userId, input);

		return {
			id: created.id,
			sourceCode: created.sourceCode,
			slug: created.slug,
			name: created.name,
			level: created.level,
			school: created.school,
			castingTime: created.castingTime,
			range: created.range,
			components: created.components,
			materials: created.materials,
			duration: created.duration,
			classSlugs: [...created.classSlugs],
			summary: created.summary,
			description: created.description,
			visibility: created.visibility === 'public' ? 'public' : 'shared',
			isSystemContent: created.isSystemContent,
			concentration: created.concentration,
			ritual: created.ritual,
			createdAt: created.createdAt,
			updatedAt: created.updatedAt
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	await assertNoExistingSharedSpellSlug(supabase, input.slug, sourceIds);

	const insert: SpellInsert = {
		owner_user_id: input.isSystemContent ? null : userId,
		source_id: sourceIds.homebrew,
		visibility: input.visibility,
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
		is_system_content: input.isSystemContent
	};

	const { data, error } = await supabase
		.from('spells')
		.insert(insert)
		.select(
			'id, source_id, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, visibility, concentration, ritual, is_system_content, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(
			input.isSystemContent
				? `Failed to create system spell for user ${userId}`
				: `Failed to create shared spell for user ${userId}`
		);
	}

	return mapSharedSpellRecord(data, sourceIds);
}

export function buildPrivateSpellDerivationMechanic(input: {
	source: ContentSourceCode;
	slug: string;
	name: string;
}): GameMechanic {
	return {
		type: 'source_derivation',
		source: input.source,
		contentType: 'spell',
		slug: input.slug,
		name: input.name
	};
}

export function extractPrivateSpellDerivation(mechanics: unknown): PrivateSpellDerivation | null {
	for (const mechanic of normalizeMechanics(mechanics)) {
		if (mechanic.type === 'source_derivation' && mechanic.contentType === 'spell') {
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

async function assertNoExistingPrivateSpellSlug(
	supabase: SupabaseClient<Database>,
	userId: string,
	slug: string,
	sourceIds: Record<PrivateSpellSourceCode, string>
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

async function assertNoExistingSharedSpellSlug(
	supabase: SupabaseClient<Database>,
	slug: string,
	sourceIds: Record<SharedSpellSourceCode, string>
) {
	const { data, error } = await supabase
		.from('spells')
		.select('id')
		.eq('slug', slug)
		.eq('source_id', sourceIds.homebrew)
		.not('visibility', 'in', '(private,campaign)')
		.limit(1);

	if (error) {
		throw new Error(`Failed to check shared spell slug "${slug}"`);
	}

	if (data.length > 0) {
		throw new Error('A shared spell with that slug already exists. Try a different name.');
	}
}

async function loadSharedSpellForDerivation(
	supabase: SupabaseClient<Database>,
	spellId: string
): Promise<
	Pick<
		SpellRow,
		| 'id'
		| 'source_id'
		| 'visibility'
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
		| 'mechanics'
		| 'concentration'
		| 'ritual'
	>
> {
	const { data, error } = await supabase
		.from('spells')
		.select(
			'id, source_id, visibility, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, mechanics, concentration, ritual'
		)
		.eq('id', spellId)
		.single();

	if (error || !data || data.visibility === 'private' || data.visibility === 'campaign') {
		throw new Error('Please choose a valid shared spell to copy.');
	}

	return data;
}

function mapPrivateSpellRecord(
	spell: PrivateSpellRow,
	sourceIds: Record<PrivateSpellSourceCode, string>
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
		derivation: extractPrivateSpellDerivation(spell.mechanics),
		concentration: spell.concentration,
		ritual: spell.ritual,
		createdAt: spell.created_at,
		updatedAt: spell.updated_at
	};
}

function mapSharedSpellRecord(
	spell: SharedSpellRow,
	sourceIds: Record<SharedSpellSourceCode, string>
): SharedSpellRecord {
	return {
		id: spell.id,
		sourceCode: spell.source_id === sourceIds.homebrew ? 'homebrew' : 'homebrew',
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
		visibility: spell.visibility === 'public' ? 'public' : 'shared',
		isSystemContent: spell.is_system_content,
		concentration: spell.concentration,
		ritual: spell.ritual,
		createdAt: spell.created_at,
		updatedAt: spell.updated_at
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
