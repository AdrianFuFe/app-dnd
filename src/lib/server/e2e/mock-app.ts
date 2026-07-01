import type { Session, SupabaseClient } from '@supabase/supabase-js';
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

type E2EMockSupabaseClient = SupabaseClient<Database> & {
	__appE2E: true;
};

type E2ECharacterRecord = CharacterCreateInput & {
	id: string;
	updatedAt: string;
	userId: string;
};

const E2E_USER_ID = 'e2e-user-1';
const E2E_USER_EMAIL = 'talia@example.test';
const E2E_SPECIES_DWARF_ID = '11111111-1111-4111-8111-111111111111';
const E2E_SPECIES_ELF_ID = '22222222-2222-4222-8222-222222222222';
const E2E_SPECIES_HUMAN_ID = '33333333-3333-4333-8333-333333333333';
const E2E_CLASS_CLERIC_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const E2E_CLASS_FIGHTER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const E2E_CLASS_WIZARD_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const E2E_SUBSPECIES_HIGH_ELF_ID = '44444444-4444-4444-8444-444444444444';
const E2E_SUBCLASS_LIGHT_DOMAIN_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const E2E_SUBCLASS_BATTLE_MASTER_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const E2E_SUBCLASS_EVOCATION_ID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const E2E_BACKGROUND_SAGE_ID = '55555555-5555-4555-8555-555555555555';
const E2E_BACKGROUND_GUILD_ARTISAN_ID = '66666666-6666-4666-8666-666666666666';
const E2E_BACKGROUND_PILGRIM_ID = '77777777-7777-4777-8777-777777777777';
const E2E_SPELL_BLESS_ID = '88888888-8888-4888-8888-888888888888';
const E2E_SPELL_MAGIC_MISSILE_ID = '99999999-9999-4999-8999-999999999999';
const E2E_SPELL_GUIDING_BOLT_ID = '12121212-1212-4121-8121-121212121212';
const E2E_FEAT_HEAVILY_ARMORED_ID = '13131313-1313-4131-8131-131313131313';
const E2E_FEAT_RESILIENT_WISDOM_ID = '14141414-1414-4141-8141-141414141414';
const E2E_EQUIPMENT_QUARTERSTAFF_ID = '15151515-1515-4151-8151-151515151515';
const E2E_EQUIPMENT_WARHAMMER_ID = '16161616-1616-4161-8161-161616161616';
const E2E_EQUIPMENT_SPELLBOOK_ID = '17171717-1717-4171-8171-171717171717';
const E2E_EQUIPMENT_SMITH_TOOLS_ID = '18181818-1818-4181-8181-181818181818';
const E2E_EQUIPMENT_LANTERN_ID = '19191919-1919-4191-8191-191919191919';

const initialCharacters: E2ECharacterRecord[] = [
	{
		id: 'char-e2e-1',
		userId: E2E_USER_ID,
		updatedAt: '2026-06-25T09:00:00.000Z',
		name: 'Talia Stormstep',
		speciesId: E2E_SPECIES_ELF_ID,
		subspeciesId: E2E_SUBSPECIES_HIGH_ELF_ID,
		classId: E2E_CLASS_WIZARD_ID,
		subclassId: E2E_SUBCLASS_EVOCATION_ID,
		backgroundId: E2E_BACKGROUND_SAGE_ID,
		race: 'Elf',
		subrace: 'High Elf',
		className: 'Wizard',
		subclass: 'Evocation',
		level: 3,
		background: 'Sage',
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
				equipmentId: E2E_EQUIPMENT_QUARTERSTAFF_ID,
				name: 'Quarterstaff',
				attackBonus: '+4',
				damage: '1d6',
				damageType: 'bludgeoning',
				range: 'Melee'
			}
		],
		spellItems: [
			{
				spellId: E2E_SPELL_MAGIC_MISSILE_ID,
				name: 'Magic Missile',
				level: 1,
				school: 'Evocation',
				castingTime: '1 action',
				range: '120 ft.',
				components: 'V, S',
				duration: 'Instantaneous',
				isPrepared: true
			}
		],
		featItems: [],
		inventoryItems: [
			{
				equipmentId: E2E_EQUIPMENT_SPELLBOOK_ID,
				name: 'Spellbook',
				quantity: 1,
				isEquipped: false
			}
		],
		attacks: 'Quarterstaff',
		spells: 'Magic Missile',
		notes: 'Tracks ley lines.'
	}
];

const e2eCatalog: CharacterCreationCatalog = {
	speciesOptions: [
		{
			id: E2E_SPECIES_DWARF_ID,
			slug: 'dwarf',
			name: 'Dwarf',
			summary: 'Steady travelers known for endurance and stonecraft.',
			baseSpeed: 25
		},
		{
			id: E2E_SPECIES_ELF_ID,
			slug: 'elf',
			name: 'Elf',
			summary: 'Keen-sensed wanderers with long memories and precise grace.',
			baseSpeed: 30
		},
		{
			id: E2E_SPECIES_HUMAN_ID,
			slug: 'human',
			name: 'Human',
			summary: 'Adaptable adventurers who thrive across every frontier.',
			baseSpeed: 30
		}
	],
	subspeciesOptions: [
		{
			id: E2E_SUBSPECIES_HIGH_ELF_ID,
			slug: 'high-elf',
			speciesSlug: 'elf',
			name: 'High Elf',
			summary: 'Arcane-leaning elves with extra training and cantrip aptitude.'
		}
	],
	classOptions: [
		{
			id: E2E_CLASS_CLERIC_ID,
			slug: 'cleric',
			name: 'Cleric',
			summary: 'Divine spellcasters who channel miracles into the fight.',
			hitDie: 8
		},
		{
			id: E2E_CLASS_FIGHTER_ID,
			slug: 'fighter',
			name: 'Fighter',
			summary: 'Versatile martial experts built for discipline and steel.',
			hitDie: 10
		},
		{
			id: E2E_CLASS_WIZARD_ID,
			slug: 'wizard',
			name: 'Wizard',
			summary: 'Arcane scholars who solve problems with preparation and power.',
			hitDie: 6
		}
	],
	subclassOptions: [
		{
			id: E2E_SUBCLASS_LIGHT_DOMAIN_ID,
			slug: 'light-domain',
			classSlug: 'cleric',
			name: 'Light Domain',
			summary: 'A radiant divine path focused on fire, warding, and revelation.'
		},
		{
			id: E2E_SUBCLASS_BATTLE_MASTER_ID,
			slug: 'battle-master',
			classSlug: 'fighter',
			name: 'Battle Master',
			summary: 'A tactical martial path built around maneuvers and battlefield control.'
		},
		{
			id: E2E_SUBCLASS_EVOCATION_ID,
			slug: 'school-of-evocation',
			classSlug: 'wizard',
			name: 'Evocation',
			summary: 'Arcane specialists in shaping destructive elemental power.'
		}
	],
	backgroundOptions: [
		{
			id: E2E_BACKGROUND_GUILD_ARTISAN_ID,
			slug: 'guild-artisan',
			name: 'Guild Artisan',
			summary: 'Craft-focused wanderers with trade connections and practical discipline.'
		},
		{
			id: E2E_BACKGROUND_PILGRIM_ID,
			slug: 'pilgrim',
			name: 'Pilgrim',
			summary: 'Travelers defined by devotion, vows, and hard-earned road wisdom.'
		},
		{
			id: E2E_BACKGROUND_SAGE_ID,
			slug: 'sage',
			name: 'Sage',
			summary: 'Researchers and lorekeepers driven by study and dangerous questions.'
		}
	]
};

const e2eExpandedContentCatalog: ExpandedContentCatalog = {
	spells: [
		{
			id: E2E_SPELL_BLESS_ID,
			slug: 'bless',
			name: 'Bless',
			level: 1,
			school: 'enchantment',
			castingTime: '1 action',
			range: '30 feet',
			components: 'V, S, M',
			duration: 'Up to 1 minute',
			classSlugs: ['cleric'],
			summary: 'Up to three creatures add 1d4 to attacks and saves.',
			description: 'Bolster your party with a short-lived divine bonus.',
			concentration: true,
			ritual: false
		},
		{
			id: E2E_SPELL_MAGIC_MISSILE_ID,
			slug: 'magic-missile',
			name: 'Magic Missile',
			level: 1,
			school: 'evocation',
			castingTime: '1 action',
			range: '120 feet',
			components: 'V, S',
			duration: 'Instantaneous',
			classSlugs: ['wizard'],
			summary: 'Force darts hit automatically and can split between targets.',
			description: 'Create glowing darts of force that strike unerringly.',
			concentration: false,
			ritual: false
		},
		{
			id: E2E_SPELL_GUIDING_BOLT_ID,
			slug: 'guiding-bolt',
			name: 'Guiding Bolt',
			level: 1,
			school: 'evocation',
			castingTime: '1 action',
			range: '120 feet',
			components: 'V, S',
			duration: 'Instantaneous',
			classSlugs: ['cleric'],
			summary: 'Radiant energy marks a target and helps the next strike land.',
			description: 'A flash of light deals radiant damage and grants advantage to the next attack.',
			concentration: false,
			ritual: false
		}
	],
	feats: [
		{
			id: E2E_FEAT_HEAVILY_ARMORED_ID,
			slug: 'heavily-armored',
			name: 'Heavily Armored',
			prerequisites: ['proficiency:armor:medium-armor'],
			summary: 'Gain heavy armor training and improve Strength.',
			description: 'Useful for builds that want stronger frontline defenses.'
		},
		{
			id: E2E_FEAT_RESILIENT_WISDOM_ID,
			slug: 'resilient-wisdom',
			name: 'Resilient (Wisdom)',
			prerequisites: [],
			summary: 'Improve Wisdom and gain Wisdom saving throw proficiency.',
			description: 'A simple defensive feat for casters and support characters.'
		}
	],
	equipment: [
		{
			id: E2E_EQUIPMENT_LANTERN_ID,
			slug: 'lantern',
			name: 'Lantern',
			category: 'adventuring-gear',
			summary: 'A hooded lantern for steady light.',
			description: 'A lantern useful for long watches, ruins, and coastal fog.',
			weight: 2,
			value: '5 gp',
			damage: null,
			damageType: null,
			range: null,
			properties: [],
			isWeapon: false,
			isEquippable: true
		},
		{
			id: E2E_EQUIPMENT_QUARTERSTAFF_ID,
			slug: 'quarterstaff',
			name: 'Quarterstaff',
			category: 'weapon',
			summary: 'A simple wooden staff usable as a melee weapon.',
			description: 'A balanced staff favored by travelers, mages, and disciplined scouts.',
			weight: 4,
			value: '2 sp',
			damage: '1d6',
			damageType: 'bludgeoning',
			range: 'Melee',
			properties: ['versatile (1d8)'],
			isWeapon: true,
			isEquippable: true
		},
		{
			id: E2E_EQUIPMENT_SMITH_TOOLS_ID,
			slug: 'smith-tools',
			name: "Smith's Tools",
			category: 'tool',
			summary: 'A forge-ready tool set for metalwork and repair.',
			description: 'Useful for making camp repairs or working a proper smithy.',
			weight: 8,
			value: '20 gp',
			damage: null,
			damageType: null,
			range: null,
			properties: [],
			isWeapon: false,
			isEquippable: true
		},
		{
			id: E2E_EQUIPMENT_SPELLBOOK_ID,
			slug: 'spellbook',
			name: 'Spellbook',
			category: 'book',
			summary: "A wizard's spellbook filled with arcane notes.",
			description: 'The written foundation of a prepared caster’s practice.',
			weight: 3,
			value: '50 gp',
			damage: null,
			damageType: null,
			range: null,
			properties: [],
			isWeapon: false,
			isEquippable: true
		},
		{
			id: E2E_EQUIPMENT_WARHAMMER_ID,
			slug: 'warhammer',
			name: 'Warhammer',
			category: 'weapon',
			summary: 'A martial hammer built for crushing hits.',
			description: 'A versatile melee weapon that rewards strong front-line fighters.',
			weight: 2,
			value: '15 gp',
			damage: '1d8',
			damageType: 'bludgeoning',
			range: 'Melee',
			properties: ['versatile (1d10)'],
			isWeapon: true,
			isEquippable: true
		}
	]
};

const state = {
	characters: [] as E2ECharacterRecord[],
	nextCharacterSequence: 2,
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
	state.nextCharacterSequence = 2;
	state.nextUpdatedMinute = 0;
}

export function listE2ECatalog(): CharacterCreationCatalog {
	return {
		speciesOptions: e2eCatalog.speciesOptions.map((option) => ({ ...option })),
		subspeciesOptions: e2eCatalog.subspeciesOptions.map((option) => ({ ...option })),
		classOptions: e2eCatalog.classOptions.map((option) => ({ ...option })),
		subclassOptions: e2eCatalog.subclassOptions.map((option) => ({ ...option })),
		backgroundOptions: e2eCatalog.backgroundOptions.map((option) => ({ ...option }))
	};
}

export function listE2EExpandedContentCatalog(): ExpandedContentCatalog {
	return {
		spells: e2eExpandedContentCatalog.spells.map(cloneSpellCatalogEntry),
		feats: e2eExpandedContentCatalog.feats.map(cloneFeatCatalogEntry),
		equipment: e2eExpandedContentCatalog.equipment.map(cloneEquipmentCatalogEntry)
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

export function getE2EBackgroundOption(
	backgroundId: string
): CharacterBackgroundOption | undefined {
	return e2eCatalog.backgroundOptions.find((option) => option.id === backgroundId);
}

export function getE2ESpellCatalogEntry(spellId: string): SpellCatalogEntry | undefined {
	return e2eExpandedContentCatalog.spells.find((entry) => entry.id === spellId);
}

export function getE2EFeatCatalogEntry(featId: string): FeatCatalogEntry | undefined {
	return e2eExpandedContentCatalog.feats.find((entry) => entry.id === featId);
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
