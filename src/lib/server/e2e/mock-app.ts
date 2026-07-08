import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { summarizeCatalogMechanics } from '$lib/server/repositories/catalog-mechanic-summary';
import { listSharedRulesVocabularies } from '$lib/server/repositories/shared-rules-vocabularies';
import type { Database } from '$lib/types/database/supabase';
import type {
	CharacterBackgroundOption,
	CharacterClassOption,
	CharacterCreationCatalog,
	CharacterSpeciesOption,
	CharacterSubclassOption,
	CharacterSubspeciesOption
} from '$lib/types/content/character-catalog';
import type {
	ExpandedContentCatalog,
	EquipmentCatalogEntry,
	FeatCatalogEntry,
	SpellCatalogEntry
} from '$lib/types/content/expanded-content-catalog';
import type { CharacterCreateInput } from '$lib/types/domain/character';
import speciesFile from '../../../../data/srd-5-1/species.json';
import subspeciesFile from '../../../../data/srd-5-1/subspecies.json';
import classesFile from '../../../../data/srd-5-1/classes.json';
import subclassesFile from '../../../../data/srd-5-1/subclasses.json';
import backgroundsFile from '../../../../data/srd-5-1/backgrounds.json';
import spellsFile from '../../../../data/srd-5-1/spells.json';
import featsFile from '../../../../data/srd-5-1/feats.json';
import equipmentFile from '../../../../data/srd-5-1/equipment.json';

type E2EMockSupabaseClient = SupabaseClient<Database> & {
	__appE2E: true;
};

type E2ECharacterRecord = CharacterCreateInput & {
	id: string;
	updatedAt: string;
	userId: string;
};

type E2EPrivateFeatRecord = {
	id: string;
	userId: string;
	sourceCode: 'user-private' | 'homebrew';
	slug: string;
	name: string;
	prerequisites: string[];
	summary: string | null;
	description: string | null;
	derivation: {
		source: 'srd-5-1' | 'srd-5-2' | 'user-private' | 'homebrew';
		contentType: 'feat';
		slug: string;
		name: string;
	} | null;
	createdAt: string;
	updatedAt: string;
};

type E2EPrivateSpellRecord = {
	id: string;
	userId: string;
	sourceCode: 'user-private' | 'homebrew';
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
	derivation: {
		source: 'srd-5-1' | 'srd-5-2' | 'user-private' | 'homebrew';
		contentType: 'spell';
		slug: string;
		name: string;
	} | null;
	concentration: boolean;
	ritual: boolean;
	createdAt: string;
	updatedAt: string;
};

type E2ESharedSpellRecord = {
	id: string;
	userId: string | null;
	sourceCode: 'homebrew';
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
	visibility: 'private' | 'campaign' | 'shared' | 'public';
	isSystemContent: boolean;
	concentration: boolean;
	ritual: boolean;
	createdAt: string;
	updatedAt: string;
};

type E2ESharedFeatRecord = {
	id: string;
	userId: string | null;
	sourceCode: 'homebrew';
	slug: string;
	name: string;
	prerequisites: string[];
	summary: string | null;
	description: string | null;
	visibility: 'private' | 'campaign' | 'shared' | 'public';
	isSystemContent: boolean;
	createdAt: string;
	updatedAt: string;
};

type ContentFile<T> = {
	items: T[];
};

type SpeciesSourceItem = {
	slug: string;
	name: string;
	summary?: string | null;
	baseSpeed?: number | null;
	mechanics?: unknown[];
};

type SubspeciesSourceItem = {
	slug: string;
	speciesSlug: string;
	name: string;
	summary?: string | null;
	mechanics?: unknown[];
};

type ClassSourceItem = {
	slug: string;
	name: string;
	summary?: string | null;
	hitDie: number;
	mechanics?: unknown[];
};

type GrantedSpellLevelSourceItem = {
	level: number;
	spellSlugs: string[];
};

type SubclassSourceItem = {
	slug: string;
	classSlug: string;
	name: string;
	summary?: string | null;
	mechanics?: unknown[];
	grantedSpellsByLevel?: GrantedSpellLevelSourceItem[];
};

type BackgroundSourceItem = {
	slug: string;
	name: string;
	summary?: string | null;
	mechanics?: unknown[];
};

type SpellSourceItem = {
	slug: string;
	name: string;
	level: number;
	school: string;
	castingTime?: string | null;
	range?: string | null;
	components?: string | null;
	duration?: string | null;
	classSlugs?: string[];
	summary?: string | null;
	description?: string | null;
	concentration?: boolean;
	ritual?: boolean;
};

type FeatSourceItem = {
	slug: string;
	name: string;
	prerequisites?: string[];
	summary?: string | null;
	description?: string | null;
};

type EquipmentSourceItem = {
	slug: string;
	name: string;
	category: string;
	summary?: string | null;
	description?: string | null;
	weight?: number | null;
	value?: string | null;
	damage?: string | null;
	damageType?: string | null;
	range?: string | null;
	properties?: string[];
	isWeapon?: boolean;
	isEquippable?: boolean;
};

const E2E_USER_ID = 'e2e-user-1';
const E2E_USER_EMAIL = 'talia@example.test';

function asContentFile<T>(value: unknown): ContentFile<T> {
	return value as ContentFile<T>;
}

function buildCatalogId(kind: string, slug: string): string {
	const hex = Array.from(`${kind}:${slug}`)
		.map((character) => character.charCodeAt(0).toString(16).padStart(2, '0'))
		.join('')
		.slice(0, 32)
		.padEnd(32, '0')
		.split('');

	hex[12] = '4';
	hex[16] = '8';

	return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20, 32).join('')}`;
}

const e2eCatalog: CharacterCreationCatalog = {
	speciesOptions: asContentFile<SpeciesSourceItem>(speciesFile).items.map((item) => ({
		id: buildCatalogId('species', item.slug),
		slug: item.slug,
		name: item.name,
		summary: item.summary ?? null,
		baseSpeed: item.baseSpeed ?? null,
		mechanicSummary: summarizeCatalogMechanics(item.mechanics ?? [])
	})),
	subspeciesOptions: asContentFile<SubspeciesSourceItem>(subspeciesFile).items.map((item) => ({
		id: buildCatalogId('subspecies', item.slug),
		slug: item.slug,
		speciesSlug: item.speciesSlug,
		name: item.name,
		summary: item.summary ?? null,
		mechanicSummary: summarizeCatalogMechanics(item.mechanics ?? [])
	})),
	classOptions: asContentFile<ClassSourceItem>(classesFile).items.map((item) => ({
		id: buildCatalogId('class', item.slug),
		slug: item.slug,
		name: item.name,
		summary: item.summary ?? null,
		hitDie: item.hitDie,
		mechanicSummary: summarizeCatalogMechanics(item.mechanics ?? []),
		grantedSpellSlugs: (item.mechanics ?? []).flatMap((mechanic) =>
			typeof mechanic === 'object' &&
			mechanic !== null &&
			'type' in mechanic &&
			mechanic.type === 'spell_grant' &&
			'spellId' in mechanic &&
			typeof mechanic.spellId === 'string'
				? [mechanic.spellId]
				: []
		)
	})),
	subclassOptions: asContentFile<SubclassSourceItem>(subclassesFile).items.map((item) => ({
		id: buildCatalogId('subclass', item.slug),
		slug: item.slug,
		classSlug: item.classSlug,
		name: item.name,
		summary: item.summary ?? null,
		mechanicSummary: summarizeCatalogMechanics(item.mechanics ?? []),
		grantedSpellsByLevel: (item.grantedSpellsByLevel ?? []).map((group) => ({
			level: group.level,
			spellSlugs: [...group.spellSlugs]
		}))
	})),
	backgroundOptions: asContentFile<BackgroundSourceItem>(backgroundsFile).items.map((item) => ({
		id: buildCatalogId('background', item.slug),
		slug: item.slug,
		name: item.name,
		summary: item.summary ?? null,
		mechanicSummary: summarizeCatalogMechanics(item.mechanics ?? [])
	}))
};

const e2eExpandedContentCatalog: ExpandedContentCatalog = {
	species: e2eCatalog.speciesOptions.map((option) => ({ ...option })),
	subspecies: e2eCatalog.subspeciesOptions.map((option) => ({ ...option })),
	classes: e2eCatalog.classOptions.map((option) => ({ ...option })),
	subclasses: e2eCatalog.subclassOptions.map((option) => ({ ...option })),
	backgrounds: e2eCatalog.backgroundOptions.map((option) => ({ ...option })),
	spells: asContentFile<SpellSourceItem>(spellsFile).items.map((item) => ({
		id: buildCatalogId('spell', item.slug),
		slug: item.slug,
		name: item.name,
		level: item.level,
		school: item.school,
		castingTime: item.castingTime ?? null,
		range: item.range ?? null,
		components: item.components ?? null,
		duration: item.duration ?? null,
		classSlugs: item.classSlugs ?? [],
		summary: item.summary ?? null,
		description: item.description ?? null,
		concentration: item.concentration ?? false,
		ritual: item.ritual ?? false
	})),
	feats: asContentFile<FeatSourceItem>(featsFile).items.map((item) => ({
		id: buildCatalogId('feat', item.slug),
		slug: item.slug,
		name: item.name,
		prerequisites: item.prerequisites ?? [],
		summary: item.summary ?? null,
		description: item.description ?? null
	})),
	equipment: asContentFile<EquipmentSourceItem>(equipmentFile).items.map((item) => ({
		id: buildCatalogId('equipment', item.slug),
		slug: item.slug,
		name: item.name,
		category: item.category,
		summary: item.summary ?? null,
		description: item.description ?? null,
		weight: item.weight ?? null,
		value: item.value ?? null,
		damage: item.damage ?? null,
		damageType: item.damageType ?? null,
		range: item.range ?? null,
		properties: item.properties ?? [],
		isWeapon: item.isWeapon ?? false,
		isEquippable: item.isEquippable ?? false
	})),
	vocabularies: listSharedRulesVocabularies()
};

const initialCharacters: E2ECharacterRecord[] = [
	{
		id: 'char-e2e-1',
		userId: E2E_USER_ID,
		updatedAt: '2026-06-25T09:00:00.000Z',
		name: 'Talia Stormstep',
		speciesId: buildCatalogId('species', 'elfo'),
		subspeciesId: buildCatalogId('subspecies', 'high-elf'),
		classId: buildCatalogId('class', 'mago'),
		subclassId: buildCatalogId('subclass', 'school-of-evocation'),
		backgroundId: buildCatalogId('background', 'acolyte'),
		race: 'Elfo',
		subrace: 'High Elf',
		className: 'Mago',
		subclass: 'School of Evocation',
		level: 3,
		background: 'Acolyte',
		story: 'Archivist turned explorer.',
		strength: 8,
		dexterity: 14,
		constitution: 13,
		intelligence: 16,
		wisdom: 12,
		charisma: 10,
		maxHp: 20,
		currentHp: 18,
		temporaryHp: 0,
		armorClass: 13,
		initiative: 2,
		speed: 30,
		hitDice: '3d6',
		attackItems: [
			{
				equipmentId: buildCatalogId('equipment', 'quarterstaff'),
				name: 'Quarterstaff',
				attackBonus: '+4',
				damage: '1d6',
				damageType: 'bludgeoning',
				range: 'Melee'
			}
		],
		spellItems: [
			{
				spellId: buildCatalogId('spell', 'magic-missile'),
				name: 'Magic Missile',
				level: 1,
				school: 'evocation',
				castingTime: '1 action',
				range: '120 feet',
				components: 'V, S',
				duration: 'Instantaneous',
				isPrepared: true
			}
		],
		featItems: [],
		inventoryItems: [
			{
				equipmentId: buildCatalogId('equipment', 'spellbook'),
				name: 'Spellbook',
				quantity: 1,
				isEquipped: false
			}
		],
		noteItems: [
			{
				title: 'Research',
				content: 'Tracks ley lines.'
			}
		],
		attacks: 'Quarterstaff',
		spells: 'Magic Missile',
		notes: 'Tracks ley lines.'
	}
];

const state = {
	characters: [] as E2ECharacterRecord[],
	privateFeats: [] as E2EPrivateFeatRecord[],
	privateSpells: [] as E2EPrivateSpellRecord[],
	sharedSpells: [] as E2ESharedSpellRecord[],
	sharedFeats: [] as E2ESharedFeatRecord[],
	nextCharacterSequence: 2,
	nextPrivateFeatSequence: 1,
	nextPrivateSpellSequence: 1,
	nextUpdatedMinute: 0
};

resetE2EMockState();

export function isE2EMockSupabaseClient(value: unknown): value is E2EMockSupabaseClient {
	return typeof value === 'object' && value !== null && '__appE2E' in value;
}

export function createE2EMockSupabaseClient(): SupabaseClient<Database> {
	return {
		__appE2E: true,
		auth: {
			signOut: async () => ({ error: null })
		},
		from(table: string) {
			if (table === 'profiles') {
				return {
					upsert: async () => ({ error: null }),
					select() {
						return {
							eq() {
								return {
									maybeSingle: async () => ({
										data: {
											global_role: 'user'
										},
										error: null
									})
								};
							}
						};
					}
				};
			}

			throw new Error(`Unsupported E2E mock table: ${table}`);
		}
	} as unknown as E2EMockSupabaseClient;
}

export function getE2EMockSession(): Session {
	return {
		access_token: 'app-dnd-e2e-access-token',
		refresh_token: 'app-dnd-e2e-refresh-token',
		token_type: 'bearer',
		expires_in: 3600,
		expires_at: 1_900_000_000,
		user: {
			id: E2E_USER_ID,
			email: E2E_USER_EMAIL,
			aud: 'authenticated',
			app_metadata: {
				provider: 'email',
				providers: ['email']
			},
			user_metadata: {
				display_name: 'Talia Test'
			},
			created_at: '2026-06-25T09:00:00.000Z'
		}
	} as Session;
}

export function resetE2EMockState() {
	state.characters = initialCharacters.map((character) => ({ ...character }));
	state.privateFeats = [];
	state.privateSpells = [];
	state.sharedSpells = [];
	state.sharedFeats = [];
	state.nextCharacterSequence = 2;
	state.nextPrivateFeatSequence = 1;
	state.nextPrivateSpellSequence = 1;
	state.nextUpdatedMinute = 0;
}

export function listE2ECatalog(): CharacterCreationCatalog {
	return {
		speciesOptions: e2eCatalog.speciesOptions.map((option) => ({ ...option })),
		subspeciesOptions: e2eCatalog.subspeciesOptions.map((option) => ({ ...option })),
		classOptions: e2eCatalog.classOptions.map((option) => ({
			...option,
			grantedSpellSlugs: [...option.grantedSpellSlugs]
		})),
		subclassOptions: e2eCatalog.subclassOptions.map((option) => ({
			...option,
			grantedSpellsByLevel: option.grantedSpellsByLevel.map((group) => ({
				level: group.level,
				spellSlugs: [...group.spellSlugs]
			}))
		})),
		backgroundOptions: e2eCatalog.backgroundOptions.map((option) => ({ ...option }))
	};
}

export function listE2EExpandedContentCatalog(): ExpandedContentCatalog {
	return {
		species: e2eExpandedContentCatalog.species.map((option) => ({ ...option })),
		subspecies: e2eExpandedContentCatalog.subspecies.map((option) => ({ ...option })),
		classes: e2eExpandedContentCatalog.classes.map((option) => ({
			...option,
			grantedSpellSlugs: [...option.grantedSpellSlugs]
		})),
		subclasses: e2eExpandedContentCatalog.subclasses.map((option) => ({
			...option,
			grantedSpellsByLevel: option.grantedSpellsByLevel.map((group) => ({
				level: group.level,
				spellSlugs: [...group.spellSlugs]
			}))
		})),
		backgrounds: e2eExpandedContentCatalog.backgrounds.map((option) => ({ ...option })),
		spells: [
			...state.sharedSpells
				.filter(isSharedCatalogSpell)
				.sort((left, right) =>
					left.level === right.level
						? left.name.localeCompare(right.name)
						: left.level - right.level
				)
				.map((spell) =>
					cloneSpellCatalogEntry({
						id: spell.id,
						slug: spell.slug,
						name: spell.name,
						level: spell.level,
						school: spell.school,
						castingTime: spell.castingTime,
						range: spell.range,
						components: spell.components,
						duration: spell.duration,
						classSlugs: [...spell.classSlugs],
						summary: spell.summary,
						description: spell.description,
						concentration: spell.concentration,
						ritual: spell.ritual,
						visibility: spell.visibility,
						isSystemContent: spell.isSystemContent
					})
				),
			...e2eExpandedContentCatalog.spells.map(cloneSpellCatalogEntry)
		],
		feats: [
			...state.sharedFeats
				.filter(isSharedCatalogFeat)
				.sort((left, right) => left.name.localeCompare(right.name))
				.map((feat) =>
					cloneFeatCatalogEntry({
						id: feat.id,
						slug: feat.slug,
						name: feat.name,
						prerequisites: [...feat.prerequisites],
						summary: feat.summary,
						description: feat.description,
						visibility: feat.visibility
					})
				),
			...e2eExpandedContentCatalog.feats.map(cloneFeatCatalogEntry)
		],
		equipment: e2eExpandedContentCatalog.equipment.map(cloneEquipmentCatalogEntry),
		vocabularies: cloneSharedRulesVocabularyCatalog(e2eExpandedContentCatalog.vocabularies)
	};
}

export function getE2ESpeciesOption(speciesId: string): CharacterSpeciesOption | undefined {
	return e2eCatalog.speciesOptions.find((option) => option.id === speciesId);
}

export function getE2EClassOption(classId: string): CharacterClassOption | undefined {
	return e2eCatalog.classOptions.find((option) => option.id === classId);
}

export function getE2ESubspeciesOption(
	subspeciesId: string
): CharacterSubspeciesOption | undefined {
	return e2eCatalog.subspeciesOptions.find((option) => option.id === subspeciesId);
}

export function getE2ESubclassOption(subclassId: string): CharacterSubclassOption | undefined {
	return e2eCatalog.subclassOptions.find((option) => option.id === subclassId);
}

export function getE2ESubclassGrantedSpellSlugs(subclassId: string): string[] {
	const subclass = asContentFile<SubclassSourceItem>(subclassesFile).items.find(
		(item) => buildCatalogId('subclass', item.slug) === subclassId
	);

	return (subclass?.mechanics ?? []).flatMap((mechanic) =>
		typeof mechanic === 'object' &&
		mechanic !== null &&
		'type' in mechanic &&
		mechanic.type === 'spell_grant' &&
		'spellId' in mechanic &&
		typeof mechanic.spellId === 'string'
			? [mechanic.spellId]
			: []
	);
}

export function getE2EBackgroundOption(
	backgroundId: string
): CharacterBackgroundOption | undefined {
	return e2eCatalog.backgroundOptions.find((option) => option.id === backgroundId);
}

export function getE2ESpellCatalogEntry(spellId: string): SpellCatalogEntry | undefined {
	const sharedSpell = state.sharedSpells.find((entry) => entry.id === spellId);

	if (sharedSpell && isSharedCatalogSpell(sharedSpell)) {
		return {
			id: sharedSpell.id,
			slug: sharedSpell.slug,
			name: sharedSpell.name,
			level: sharedSpell.level,
			school: sharedSpell.school,
			castingTime: sharedSpell.castingTime,
			range: sharedSpell.range,
			components: sharedSpell.components,
			duration: sharedSpell.duration,
			classSlugs: [...sharedSpell.classSlugs],
			summary: sharedSpell.summary,
			description: sharedSpell.description,
			concentration: sharedSpell.concentration,
			ritual: sharedSpell.ritual,
			visibility: sharedSpell.visibility,
			isSystemContent: sharedSpell.isSystemContent
		};
	}

	return e2eExpandedContentCatalog.spells.find((entry) => entry.id === spellId);
}

export function getE2EFeatCatalogEntry(featId: string): FeatCatalogEntry | undefined {
	const sharedFeat = state.sharedFeats.find((entry) => entry.id === featId);

	if (sharedFeat && isSharedCatalogFeat(sharedFeat)) {
		return {
			id: sharedFeat.id,
			slug: sharedFeat.slug,
			name: sharedFeat.name,
			prerequisites: [...sharedFeat.prerequisites],
			summary: sharedFeat.summary,
			description: sharedFeat.description,
			visibility: sharedFeat.visibility
		};
	}

	return e2eExpandedContentCatalog.feats.find((entry) => entry.id === featId);
}

export function getE2EManagedSharedFeatById(featId: string) {
	const feat = state.sharedFeats.find((entry) => entry.id === featId);

	return feat ? { ...feat } : null;
}

export function getE2EEquipmentCatalogEntry(
	equipmentId: string
): EquipmentCatalogEntry | undefined {
	return e2eExpandedContentCatalog.equipment.find((entry) => entry.id === equipmentId);
}

export function listE2ECharactersForUser(userId: string) {
	return state.characters
		.filter((character) => character.userId === userId)
		.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
		.map((character) => ({
			id: character.id,
			name: character.name,
			level: character.level,
			race: character.race ?? null,
			className: character.className ?? null,
			updatedAt: character.updatedAt
		}));
}

export function getE2ECharacterForUser(userId: string, characterId: string) {
	const character = state.characters.find(
		(entry) => entry.userId === userId && entry.id === characterId
	);

	return character ? { ...character } : null;
}

export function createE2ECharacterForUser(userId: string, input: CharacterCreateInput) {
	const character: E2ECharacterRecord = {
		id: `char-e2e-${state.nextCharacterSequence}`,
		userId,
		updatedAt: nextUpdatedAt(),
		...input
	};

	state.nextCharacterSequence += 1;
	state.characters.unshift(character);

	return {
		id: character.id,
		name: character.name
	};
}

export function updateE2ECharacterForUser(
	userId: string,
	characterId: string,
	input: CharacterCreateInput
) {
	const character = state.characters.find(
		(entry) => entry.userId === userId && entry.id === characterId
	);

	if (!character) {
		return null;
	}

	Object.assign(character, input, {
		updatedAt: nextUpdatedAt()
	});

	return {
		id: character.id,
		name: character.name
	};
}

export function deleteE2ECharacterForUser(userId: string, characterId: string) {
	const index = state.characters.findIndex(
		(entry) => entry.userId === userId && entry.id === characterId
	);

	if (index === -1) {
		return null;
	}

	const [deletedCharacter] = state.characters.splice(index, 1);

	return {
		id: deletedCharacter.id,
		name: deletedCharacter.name
	};
}

export function listE2EPrivateFeatsForUser(userId: string) {
	return [
		...state.privateFeats.filter((feat) => feat.userId === userId),
		...state.sharedFeats
			.filter(
				(feat) =>
					feat.userId === userId && !feat.isSystemContent && feat.visibility === 'private'
			)
			.map((feat) => ({
				id: feat.id,
				userId,
				sourceCode: feat.sourceCode,
				slug: feat.slug,
				name: feat.name,
				prerequisites: [...feat.prerequisites],
				summary: feat.summary,
				description: feat.description,
				derivation: null,
				createdAt: feat.createdAt,
				updatedAt: feat.updatedAt
			}))
	]
		.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
		.map((feat) => ({ ...feat }));
}

export function listE2EPrivateSpellsForUser(userId: string) {
	return state.privateSpells
		.filter((spell) => spell.userId === userId)
		.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
		.map((spell) => ({
			...spell,
			classSlugs: [...spell.classSlugs]
		}));
}

export function createE2EPrivateFeatForUser(
	userId: string,
	input: {
		sourceCode?: 'user-private' | 'homebrew';
		slug: string;
		name: string;
		prerequisites: string[];
		summary?: string;
		description?: string;
		derivation?: E2EPrivateFeatRecord['derivation'];
	}
) {
	const duplicate = state.privateFeats.find(
		(feat) => feat.userId === userId && feat.slug === input.slug
	);

	if (duplicate) {
		throw new Error('You already have a private feat with that slug. Try a different name.');
	}

	const timestamp = nextUpdatedAt();
	const feat: E2EPrivateFeatRecord = {
		id: `private-feat-e2e-${state.nextPrivateFeatSequence}`,
		userId,
		sourceCode: input.sourceCode ?? 'user-private',
		slug: input.slug,
		name: input.name,
		prerequisites: [...input.prerequisites],
		summary: input.summary ?? null,
		description: input.description ?? null,
		derivation: input.derivation ?? null,
		createdAt: timestamp,
		updatedAt: timestamp
	};

	state.nextPrivateFeatSequence += 1;
	state.privateFeats.unshift(feat);

	return { ...feat };
}

export function createE2EPrivateSpellForUser(
	userId: string,
	input: {
		sourceCode?: 'user-private' | 'homebrew';
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
		derivation?: E2EPrivateSpellRecord['derivation'];
		concentration: boolean;
		ritual: boolean;
	}
) {
	const duplicate = state.privateSpells.find(
		(spell) => spell.userId === userId && spell.slug === input.slug
	);

	if (duplicate) {
		throw new Error('You already have a private spell with that slug. Try a different name.');
	}

	const timestamp = nextUpdatedAt();
	const spell: E2EPrivateSpellRecord = {
		id: `private-spell-e2e-${state.nextPrivateSpellSequence}`,
		userId,
		sourceCode: input.sourceCode ?? 'user-private',
		slug: input.slug,
		name: input.name,
		level: input.level,
		school: input.school,
		castingTime: input.castingTime ?? null,
		range: input.range ?? null,
		components: input.components ?? null,
		materials: input.materials ?? null,
		duration: input.duration ?? null,
		classSlugs: [...input.classSlugs],
		summary: input.summary ?? null,
		description: input.description ?? null,
		derivation: input.derivation ?? null,
		concentration: input.concentration,
		ritual: input.ritual,
		createdAt: timestamp,
		updatedAt: timestamp
	};

	state.nextPrivateSpellSequence += 1;
	state.privateSpells.unshift(spell);

	return {
		...spell,
		classSlugs: [...spell.classSlugs]
	};
}

export function createE2ESharedSpellForUser(
	userId: string,
	input: {
		sourceCode?: 'homebrew';
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
		visibility: 'shared' | 'public';
		isSystemContent: boolean;
		concentration: boolean;
		ritual: boolean;
	}
) {
	const duplicate =
		state.sharedSpells.find((spell) => spell.slug === input.slug) ??
		e2eExpandedContentCatalog.spells.find((spell) => spell.slug === input.slug);

	if (duplicate) {
		throw new Error('A shared spell with that slug already exists. Try a different name.');
	}

	const timestamp = nextUpdatedAt();
	const spell: E2ESharedSpellRecord = {
		id: `shared-spell-e2e-${state.nextPrivateSpellSequence}`,
		userId: input.isSystemContent ? null : userId,
		sourceCode: input.sourceCode ?? 'homebrew',
		slug: input.slug,
		name: input.name,
		level: input.level,
		school: input.school,
		castingTime: input.castingTime ?? null,
		range: input.range ?? null,
		components: input.components ?? null,
		materials: input.materials ?? null,
		duration: input.duration ?? null,
		classSlugs: [...input.classSlugs],
		summary: input.summary ?? null,
		description: input.description ?? null,
		visibility: input.visibility,
		isSystemContent: input.isSystemContent,
		concentration: input.concentration,
		ritual: input.ritual,
		createdAt: timestamp,
		updatedAt: timestamp
	};

	state.nextPrivateSpellSequence += 1;
	state.sharedSpells.unshift(spell);

	return {
		...spell,
		classSlugs: [...spell.classSlugs]
	};
}

export function createE2ESharedFeatForUser(
	userId: string,
	input: {
		sourceCode?: 'homebrew';
		slug: string;
		name: string;
		prerequisites: string[];
		summary?: string;
		description?: string;
		visibility: 'shared' | 'public';
		isSystemContent: boolean;
	}
) {
	const duplicate =
		state.sharedFeats.find((feat) => feat.slug === input.slug) ??
		e2eExpandedContentCatalog.feats.find((feat) => feat.slug === input.slug);

	if (duplicate) {
		throw new Error('A shared feat with that slug already exists. Try a different name.');
	}

	const timestamp = nextUpdatedAt();
	const feat: E2ESharedFeatRecord = {
		id: `shared-feat-e2e-${state.nextPrivateFeatSequence}`,
		userId: input.isSystemContent ? null : userId,
		sourceCode: input.sourceCode ?? 'homebrew',
		slug: input.slug,
		name: input.name,
		prerequisites: [...input.prerequisites],
		summary: input.summary ?? null,
		description: input.description ?? null,
		visibility: input.visibility,
		isSystemContent: input.isSystemContent,
		createdAt: timestamp,
		updatedAt: timestamp
	};

	state.nextPrivateFeatSequence += 1;
	state.sharedFeats.unshift(feat);

	return { ...feat };
}

export function listE2EManagedSharedFeatsForUser(userId: string, includeSystemContent: boolean) {
	return state.sharedFeats
		.filter((feat) => feat.visibility !== 'private' && feat.visibility !== 'campaign')
		.filter((feat) => (includeSystemContent ? true : !feat.isSystemContent))
		.filter((feat) => (includeSystemContent ? true : feat.userId === userId))
		.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
		.map((feat) => ({ ...feat }));
}

export function updateE2EManagedSharedFeatForUser(
	userId: string,
	input: {
		featId: string;
		name: string;
		slug: string;
		prerequisites: string[];
		summary?: string;
		description?: string;
		includeSystemContent: boolean;
	}
) {
	const feat = state.sharedFeats.find((entry) => entry.id === input.featId);

	if (!feat) {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	if (feat.visibility === 'private' || feat.visibility === 'campaign') {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	if (!input.includeSystemContent && (feat.isSystemContent || feat.userId !== userId)) {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	const duplicate = state.sharedFeats.find(
		(entry) => entry.id !== feat.id && entry.slug === input.slug
	);

	if (duplicate) {
		throw new Error('A shared feat with that slug already exists. Try a different name.');
	}

	Object.assign(feat, {
		name: input.name,
		slug: input.slug,
		prerequisites: [...input.prerequisites],
		summary: input.summary ?? null,
		description: input.description ?? null,
		updatedAt: nextUpdatedAt()
	});

	return { ...feat };
}

export function retireE2EManagedSharedFeatForUser(
	userId: string,
	input: {
		featId: string;
		includeSystemContent: boolean;
	}
) {
	const feat = state.sharedFeats.find((entry) => entry.id === input.featId);

	if (!feat || feat.visibility === 'private' || feat.visibility === 'campaign') {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	if (!input.includeSystemContent && (feat.isSystemContent || feat.userId !== userId)) {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	Object.assign(feat, {
		visibility: 'private',
		updatedAt: nextUpdatedAt()
	});

	return { ...feat };
}

export function deleteE2EManagedSharedFeatForUser(
	userId: string,
	input: {
		featId: string;
		includeSystemContent: boolean;
	}
) {
	const index = state.sharedFeats.findIndex((entry) => entry.id === input.featId);

	if (index === -1) {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	const feat = state.sharedFeats[index];

	if (feat.visibility === 'private' || feat.visibility === 'campaign') {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	if (!input.includeSystemContent && (feat.isSystemContent || feat.userId !== userId)) {
		throw new Error('Please choose a valid shared feat to maintain.');
	}

	state.sharedFeats.splice(index, 1);

	return { ...feat };
}

function nextUpdatedAt(): string {
	const updatedAt = new Date(Date.UTC(2026, 5, 25, 9, state.nextUpdatedMinute, 0)).toISOString();
	state.nextUpdatedMinute += 1;
	return updatedAt;
}

function cloneSpellCatalogEntry(spell: SpellCatalogEntry): SpellCatalogEntry {
	return {
		...spell,
		classSlugs: [...spell.classSlugs]
	};
}

function cloneFeatCatalogEntry(feat: FeatCatalogEntry): FeatCatalogEntry {
	return {
		...feat,
		prerequisites: [...feat.prerequisites]
	};
}

function cloneEquipmentCatalogEntry(equipment: EquipmentCatalogEntry): EquipmentCatalogEntry {
	return {
		...equipment,
		properties: [...equipment.properties]
	};
}

function cloneSharedRulesVocabularyCatalog(
	vocabularies: ExpandedContentCatalog['vocabularies']
): ExpandedContentCatalog['vocabularies'] {
	return {
		abilities: vocabularies.abilities.map((entry) => ({ ...entry })),
		languages: vocabularies.languages.map((entry) => ({ ...entry })),
		damageTypes: vocabularies.damageTypes.map((entry) => ({ ...entry })),
		spellSchools: vocabularies.spellSchools.map((entry) => ({ ...entry })),
		skillProficiencies: vocabularies.skillProficiencies.map((entry) => ({ ...entry })),
		armorProficiencies: vocabularies.armorProficiencies.map((entry) => ({ ...entry })),
		weaponProficiencies: vocabularies.weaponProficiencies.map((entry) => ({ ...entry })),
		toolProficiencies: vocabularies.toolProficiencies.map((entry) => ({ ...entry })),
		savingThrowProficiencies: vocabularies.savingThrowProficiencies.map((entry) => ({
			...entry
		}))
	};
}

function isSharedCatalogFeat(
	feat: E2ESharedFeatRecord
): feat is E2ESharedFeatRecord & { visibility: 'shared' | 'public' } {
	return feat.visibility === 'shared' || feat.visibility === 'public';
}

function isSharedCatalogSpell(
	spell: E2ESharedSpellRecord
): spell is E2ESharedSpellRecord & { visibility: 'shared' | 'public' } {
	return spell.visibility === 'shared' || spell.visibility === 'public';
}
