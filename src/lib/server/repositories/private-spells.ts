import type { SupabaseClient } from '@supabase/supabase-js';
import { error as httpError } from '@sveltejs/kit';
import {
	createE2ESharedSpellForUser,
	deleteE2EManagedSharedSpellForUser,
	isE2EMockSupabaseClient,
	createE2EPrivateSpellForUser,
	getE2EManagedSharedSpellById,
	getE2ESpellCatalogEntry,
	listE2EManagedSharedSpellsForUser,
	listE2EPrivateSpellsForUser,
	retireE2EManagedSharedSpellForUser,
	updateE2EManagedSharedSpellForUser
} from '$lib/server/e2e/mock-app';
import {
	isPrivateOwnedContent,
	isPublishedSharedContent,
	resolvePrivateDraftState,
	resolveRetiredState,
	resolveSharedPublicationState
} from '$lib/server/content/editorial';
import type { Database } from '$lib/types/database/supabase';
import type { GameMechanic } from '$lib/types/domain/game-mechanics';
import type { AuthorizationContext } from '$lib/types/permissions/permissions';

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
	rulesetCode: string;
	contentMode: 'canon' | 'custom';
	editorialStatus: 'private_draft' | 'shared_draft' | 'in_review' | 'published' | 'retired';
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
	rulesetCode: string;
	contentMode: 'canon' | 'custom';
	editorialStatus: 'private_draft' | 'shared_draft' | 'in_review' | 'published' | 'retired';
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

export type ManagedSharedSpellRecord = SharedSpellRecord & {
	ownerUserId: string | null;
};

export type ManagedSharedSpellLifecycleResult = {
	id: string;
	name: string;
};

type PrivateSpellRow = Pick<
	SpellRow,
	| 'id'
	| 'source_id'
	| 'ruleset_code'
	| 'content_mode'
	| 'editorial_status'
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
	| 'owner_user_id'
	| 'source_id'
	| 'ruleset_code'
	| 'content_mode'
	| 'editorial_status'
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
			'id, source_id, ruleset_code, content_mode, editorial_status, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, mechanics, concentration, ritual, created_at, updated_at'
		)
		.eq('owner_user_id', userId)
		.in('source_id', [sourceIds['user-private'], sourceIds.homebrew])
		.eq('is_system_content', false)
		.eq('visibility', 'private')
		.order('updated_at', { ascending: false });

	if (error) {
		throw new Error(`Failed to load private spells for user ${userId}`);
	}

	return data
		.filter((spell) =>
			isPrivateOwnedContent({
				editorialStatus: spell.editorial_status,
				visibility: 'private'
			})
		)
		.map((spell) => mapPrivateSpellRecord(spell, sourceIds));
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
	const privateDraftState = resolvePrivateDraftState();

	const insert: SpellInsert = {
		owner_user_id: userId,
		source_id: sourceIds['user-private'],
		ruleset_code: 'dnd-2014-srd',
		content_mode: privateDraftState.contentMode,
		editorial_status: privateDraftState.editorialStatus,
		visibility: privateDraftState.visibility,
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
			'id, source_id, ruleset_code, content_mode, editorial_status, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, mechanics, concentration, ritual, created_at, updated_at'
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
	const privateDraftState = resolvePrivateDraftState();

	const sharedSourceCode =
		findSourceCodeById(allSourceIds, sharedSpell.source_id) === 'srd-5-2'
			? 'srd-5-2'
			: 'srd-5-1';
	const insert: SpellInsert = {
		owner_user_id: userId,
		source_id: privateSourceIds.homebrew,
		ruleset_code: 'dnd-2014-srd',
		content_mode: privateDraftState.contentMode,
		editorial_status: privateDraftState.editorialStatus,
		visibility: privateDraftState.visibility,
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
			'id, source_id, ruleset_code, content_mode, editorial_status, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, mechanics, concentration, ritual, created_at, updated_at'
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
			rulesetCode: created.rulesetCode,
			contentMode: created.contentMode,
			editorialStatus: created.editorialStatus,
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
	const publicationState = resolveSharedPublicationState({
		isSystemContent: input.isSystemContent,
		visibility: input.visibility
	});

	const insert: SpellInsert = {
		owner_user_id: input.isSystemContent ? null : userId,
		source_id: sourceIds.homebrew,
		ruleset_code: 'dnd-2014-srd',
		content_mode: publicationState.contentMode,
		editorial_status: publicationState.editorialStatus,
		visibility: publicationState.visibility,
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
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, visibility, concentration, ritual, is_system_content, created_at, updated_at'
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

export async function listManagedSharedSpells(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext
): Promise<ManagedSharedSpellRecord[]> {
	if (isE2EMockSupabaseClient(supabase)) {
		return listE2EManagedSharedSpellsForUser(
			authorization.userId,
			authorization.globalRole === 'admin'
		).map((spell) => ({
			id: spell.id,
			sourceCode: spell.sourceCode,
			rulesetCode: spell.rulesetCode,
			contentMode: spell.contentMode,
			editorialStatus: spell.editorialStatus,
			slug: spell.slug,
			name: spell.name,
			level: spell.level,
			school: spell.school,
			castingTime: spell.castingTime,
			range: spell.range,
			components: spell.components,
			materials: spell.materials,
			duration: spell.duration,
			classSlugs: [...spell.classSlugs],
			summary: spell.summary,
			description: spell.description,
			visibility: spell.visibility === 'public' ? 'public' : 'shared',
			isSystemContent: spell.isSystemContent,
			concentration: spell.concentration,
			ritual: spell.ritual,
			createdAt: spell.createdAt,
			updatedAt: spell.updatedAt,
			ownerUserId: spell.userId
		}));
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const query = supabase
		.from('spells')
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, visibility, concentration, ritual, is_system_content, created_at, updated_at'
		)
		.eq('source_id', sourceIds.homebrew)
		.not('visibility', 'in', '(private,campaign)')
		.order('updated_at', { ascending: false });

	const { data, error } =
		authorization.globalRole === 'admin'
			? await query
			: await query.eq('owner_user_id', authorization.userId).eq('is_system_content', false);

	if (error) {
		throw new Error(`Failed to load managed shared spells for user ${authorization.userId}`);
	}

	return data
		.filter((spell) =>
			isPublishedSharedContent({
				editorialStatus: spell.editorial_status,
				visibility: spell.visibility
			})
		)
		.map((spell) => mapManagedSharedSpellRecord(spell, sourceIds));
}

export async function updateManagedSharedSpell(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext,
	input: CreatePrivateSpellInput & {
		spellId: string;
	}
): Promise<ManagedSharedSpellRecord> {
	if (isE2EMockSupabaseClient(supabase)) {
		const spell = loadE2EManagedSharedSpellById(input.spellId);
		assertManagedSharedSpellAccess(authorization, spell, 'update');
		const updated = updateE2EManagedSharedSpellForUser(authorization.userId, {
			spellId: input.spellId,
			name: input.name,
			slug: input.slug,
			level: input.level,
			school: input.school,
			castingTime: input.castingTime,
			range: input.range,
			components: input.components,
			materials: input.materials,
			duration: input.duration,
			classSlugs: input.classSlugs,
			summary: input.summary,
			description: input.description,
			concentration: input.concentration,
			ritual: input.ritual,
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
			level: updated.level,
			school: updated.school,
			castingTime: updated.castingTime,
			range: updated.range,
			components: updated.components,
			materials: updated.materials,
			duration: updated.duration,
			classSlugs: [...updated.classSlugs],
			summary: updated.summary,
			description: updated.description,
			visibility: updated.visibility === 'public' ? 'public' : 'shared',
			isSystemContent: updated.isSystemContent,
			concentration: updated.concentration,
			ritual: updated.ritual,
			createdAt: updated.createdAt,
			updatedAt: updated.updatedAt,
			ownerUserId: updated.userId
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const spell = await loadManagedSharedSpellById(supabase, input.spellId, sourceIds);
	assertManagedSharedSpellAccess(authorization, spell, 'update');

	await assertNoExistingSharedSpellSlug(supabase, input.slug, sourceIds, spell.id);

	const { data, error } = await supabase
		.from('spells')
		.update({
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
			ritual: input.ritual
		})
		.eq('id', spell.id)
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, visibility, concentration, ritual, is_system_content, created_at, updated_at'
		)
		.single();

	if (error) {
		throw new Error(`Failed to update shared spell ${spell.id}`);
	}

	return mapManagedSharedSpellRecord(data, sourceIds);
}

export async function retireManagedSharedSpell(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext,
	spellId: string
): Promise<ManagedSharedSpellLifecycleResult> {
	if (isE2EMockSupabaseClient(supabase)) {
		const spell = loadE2EManagedSharedSpellById(spellId);
		assertManagedSharedSpellAccess(authorization, spell, 'retire');
		const retired = retireE2EManagedSharedSpellForUser(authorization.userId, {
			spellId,
			includeSystemContent: authorization.globalRole === 'admin'
		});

		return {
			id: retired.id,
			name: retired.name
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const spell = await loadManagedSharedSpellById(supabase, spellId, sourceIds);
	assertManagedSharedSpellAccess(authorization, spell, 'retire');
	const retiredState = resolveRetiredState();

	const { error } = await supabase
		.from('spells')
		.update({
			visibility: retiredState.visibility,
			editorial_status: retiredState.editorialStatus
		})
		.eq('id', spell.id);

	if (error) {
		throw new Error(`Failed to retire shared spell ${spell.id}`);
	}

	return {
		id: spell.id,
		name: spell.name
	};
}

export async function deleteManagedSharedSpell(
	supabase: SupabaseClient<Database>,
	authorization: AuthorizationContext,
	spellId: string
): Promise<ManagedSharedSpellLifecycleResult> {
	if (isE2EMockSupabaseClient(supabase)) {
		const spell = loadE2EManagedSharedSpellById(spellId);
		assertManagedSharedSpellAccess(authorization, spell, 'delete');
		const deleted = deleteE2EManagedSharedSpellForUser(authorization.userId, {
			spellId,
			includeSystemContent: authorization.globalRole === 'admin'
		});

		return {
			id: deleted.id,
			name: deleted.name
		};
	}

	const sourceIds = await loadContentSourceIds(supabase, ['homebrew']);
	const spell = await loadManagedSharedSpellById(supabase, spellId, sourceIds);
	assertManagedSharedSpellAccess(authorization, spell, 'delete');

	const { error } = await supabase.from('spells').delete().eq('id', spell.id);

	if (error) {
		throw new Error(`Failed to delete shared spell ${spell.id}`);
	}

	return {
		id: spell.id,
		name: spell.name
	};
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

async function assertNoExistingPrivateSpellSlug(
	supabase: SupabaseClient<Database>,
	userId: string,
	slug: string,
	sourceIds: Record<PrivateSpellSourceCode, string>
) {
	const { data, error } = await supabase
		.from('spells')
		.select('id, editorial_status, visibility')
		.eq('owner_user_id', userId)
		.eq('slug', slug)
		.in('source_id', [sourceIds['user-private'], sourceIds.homebrew])
		.limit(1);

	if (error) {
		throw new Error(`Failed to check private spell slug "${slug}"`);
	}

	if (
		data.some((spell) =>
			isPrivateOwnedContent({
				editorialStatus: spell.editorial_status ?? 'private_draft',
				visibility: spell.visibility ?? 'private'
			})
		)
	) {
		throw new Error('You already have a private spell with that slug. Try a different name.');
	}
}

async function assertNoExistingSharedSpellSlug(
	supabase: SupabaseClient<Database>,
	slug: string,
	sourceIds: Record<SharedSpellSourceCode, string>,
	excludeSpellId?: string
) {
	const query = supabase
		.from('spells')
		.select('id, editorial_status, visibility')
		.eq('slug', slug)
		.eq('source_id', sourceIds.homebrew)
		.limit(2);

	const { data, error } = excludeSpellId ? await query.neq('id', excludeSpellId) : await query;

	if (error) {
		throw new Error(`Failed to check shared spell slug "${slug}"`);
	}

	if (
		data.some((spell) =>
			isPublishedSharedContent({
				editorialStatus: spell.editorial_status,
				visibility: spell.visibility
			})
		)
	) {
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
			'id, source_id, visibility, ruleset_code, content_mode, editorial_status, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, mechanics, concentration, ritual'
		)
		.eq('id', spellId)
		.single();

	if (
		error ||
		!data ||
		!isPublishedSharedContent({
			editorialStatus: data.editorial_status,
			visibility: data.visibility
		})
	) {
		throw new Error('Please choose a valid shared spell to copy.');
	}

	return data;
}

async function loadManagedSharedSpellById(
	supabase: SupabaseClient<Database>,
	spellId: string,
	sourceIds: Record<SharedSpellSourceCode, string>
): Promise<SharedSpellRow> {
	const { data, error } = await supabase
		.from('spells')
		.select(
			'id, owner_user_id, source_id, ruleset_code, content_mode, editorial_status, slug, name, level, school, casting_time, range_text, components, materials, duration, class_slugs, summary, description, visibility, concentration, ritual, is_system_content, created_at, updated_at'
		)
		.eq('id', spellId)
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
		throw new Error('Please choose a valid shared spell to maintain.');
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
		rulesetCode: spell.ruleset_code,
		contentMode: spell.content_mode as PrivateSpellRecord['contentMode'],
		editorialStatus: spell.editorial_status as PrivateSpellRecord['editorialStatus'],
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
		rulesetCode: spell.ruleset_code,
		contentMode: spell.content_mode as SharedSpellRecord['contentMode'],
		editorialStatus: spell.editorial_status as SharedSpellRecord['editorialStatus'],
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

function mapManagedSharedSpellRecord(
	spell: SharedSpellRow,
	sourceIds: Record<SharedSpellSourceCode, string>
): ManagedSharedSpellRecord {
	return {
		...mapSharedSpellRecord(spell, sourceIds),
		ownerUserId: spell.owner_user_id
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

function loadE2EManagedSharedSpellById(spellId: string) {
	const spell = getE2EManagedSharedSpellById(spellId);

	if (
		!spell ||
		!isPublishedSharedContent({
			editorialStatus: spell.editorialStatus,
			visibility: spell.visibility
		})
	) {
		throw new Error('Please choose a valid shared spell to maintain.');
	}

	return {
		...spell,
		owner_user_id: spell.userId,
		is_system_content: spell.isSystemContent
	};
}

function assertManagedSharedSpellAccess(
	authorization: AuthorizationContext,
	spell: Pick<SharedSpellRow, 'owner_user_id' | 'is_system_content'>,
	operation: 'update' | 'retire' | 'delete'
) {
	if (spell.is_system_content) {
		if (authorization.globalRole !== 'admin') {
			throw httpError(403, `Admin role required to ${operation} system-owned spells.`);
		}

		return;
	}

	if (authorization.globalRole !== 'admin' && spell.owner_user_id !== authorization.userId) {
		throw httpError(403, `You can only ${operation} your own shared spells.`);
	}
}
