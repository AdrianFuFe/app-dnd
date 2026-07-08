import { describe, expect, it, vi } from 'vitest';
import {
	listCharacterCreationCatalog,
	listExpandedContentCatalog,
	resolveCharacterAttackCatalogSelections,
	resolveCharacterFeatCatalogSelections,
	resolveCharacterInventoryCatalogSelections,
	resolveCharacterSpellCatalogSelections,
	resolveCharacterCreationCatalogSelections
} from './catalog';

const emptyMechanicSummary = {
	spellcastingAbilities: [],
	languageGrants: [],
	proficiencyGrants: [],
	proficiencyChoices: []
};

describe('listCharacterCreationCatalog', () => {
	it('loads structured catalog options for character creation', async () => {
		const speciesOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'species-1',
					slug: 'elfo',
					name: 'Elfo',
					summary: 'Agile and perceptive.',
					base_speed: 30
				}
			],
			error: null
		});
		const speciesSelect = vi.fn().mockReturnValue({ order: speciesOrder });

		const subspeciesOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'subspecies-1',
					slug: 'high-elf',
					species_slug: 'elfo',
					name: 'High Elf',
					summary: 'Arcane focused.',
					mechanics: [
						{ type: 'choose_language', count: 1 },
						{ type: 'proficiency', proficiencyType: 'weapon', value: 'longsword' }
					]
				}
			],
			error: null
		});
		const subspeciesSelect = vi.fn().mockReturnValue({ order: subspeciesOrder });

		const classesOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'class-1',
					slug: 'clerigo',
					name: 'Clerigo',
					summary: 'Divine support caster.',
					hit_die: 8
				}
			],
			error: null
		});
		const classesSelect = vi.fn().mockReturnValue({ order: classesOrder });

		const subclassOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'subclass-1',
					slug: 'life-domain',
					class_slug: 'clerigo',
					name: 'Life Domain',
					summary: 'Healing focused.',
					mechanics: [
						{ type: 'proficiency', proficiencyType: 'armor', value: 'heavy-armor' }
					]
				}
			],
			error: null
		});
		const subclassSelect = vi.fn().mockReturnValue({ order: subclassOrder });

		const backgroundOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'background-1',
					slug: 'sage',
					name: 'Sage',
					summary: 'Academic researcher.'
				}
			],
			error: null
		});
		const backgroundSelect = vi.fn().mockReturnValue({ order: backgroundOrder });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'subspecies') {
				return { select: subspeciesSelect };
			}

			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'subclasses') {
				return { select: subclassSelect };
			}

			if (table === 'backgrounds') {
				return { select: backgroundSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const catalog = await listCharacterCreationCatalog({ from } as never);

		expect(catalog).toEqual({
			speciesOptions: [
				{
					id: 'species-1',
					slug: 'elfo',
					name: 'Elfo',
					summary: 'Agile and perceptive.',
					baseSpeed: 30,
					mechanicSummary: emptyMechanicSummary
				}
			],
			subspeciesOptions: [
				{
					id: 'subspecies-1',
					slug: 'high-elf',
					speciesSlug: 'elfo',
					name: 'High Elf',
					summary: 'Arcane focused.',
					mechanicSummary: {
						spellcastingAbilities: [],
						languageGrants: [{ kind: 'choice', count: 1 }],
						proficiencyGrants: [{ proficiencyType: 'weapon', value: 'longsword' }],
						proficiencyChoices: []
					}
				}
			],
			classOptions: [
				{
					id: 'class-1',
					slug: 'clerigo',
					name: 'Clerigo',
					summary: 'Divine support caster.',
					hitDie: 8,
					mechanicSummary: emptyMechanicSummary,
					grantedSpellSlugs: []
				}
			],
			subclassOptions: [
				{
					id: 'subclass-1',
					slug: 'life-domain',
					classSlug: 'clerigo',
					name: 'Life Domain',
					summary: 'Healing focused.',
					mechanicSummary: {
						spellcastingAbilities: [],
						languageGrants: [],
						proficiencyGrants: [{ proficiencyType: 'armor', value: 'heavy-armor' }],
						proficiencyChoices: []
					},
					grantedSpellsByLevel: []
				}
			],
			backgroundOptions: [
				{
					id: 'background-1',
					slug: 'sage',
					name: 'Sage',
					summary: 'Academic researcher.',
					mechanicSummary: emptyMechanicSummary
				}
			]
		});
	});
});

describe('resolveCharacterCreationCatalogSelections', () => {
	it('maps selected IDs back to trusted stored fields', async () => {
		const speciesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'species-1',
				slug: 'elfo',
				name: 'Elfo'
			},
			error: null
		});
		const speciesEq = vi.fn().mockReturnValue({ single: speciesSingle });
		const speciesSelect = vi.fn().mockReturnValue({ eq: speciesEq });

		const subspeciesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'subspecies-1',
				species_slug: 'elfo',
				name: 'High Elf'
			},
			error: null
		});
		const subspeciesEq = vi.fn().mockReturnValue({ single: subspeciesSingle });
		const subspeciesSelect = vi.fn().mockReturnValue({ eq: subspeciesEq });

		const classesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'class-1',
				slug: 'clerigo',
				name: 'Clerigo',
				mechanics: []
			},
			error: null
		});
		const classesEq = vi.fn().mockReturnValue({ single: classesSingle });
		const classesSelect = vi.fn().mockReturnValue({ eq: classesEq });

		const subclassSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'subclass-1',
				class_slug: 'clerigo',
				name: 'Life Domain'
			},
			error: null
		});
		const subclassEq = vi.fn().mockReturnValue({ single: subclassSingle });
		const subclassSelect = vi.fn().mockReturnValue({ eq: subclassEq });

		const backgroundSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'background-1',
				name: 'Sage'
			},
			error: null
		});
		const backgroundEq = vi.fn().mockReturnValue({ single: backgroundSingle });
		const backgroundSelect = vi.fn().mockReturnValue({ eq: backgroundEq });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'subspecies') {
				return { select: subspeciesSelect };
			}

			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'subclasses') {
				return { select: subclassSelect };
			}

			if (table === 'backgrounds') {
				return { select: backgroundSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const selection = await resolveCharacterCreationCatalogSelections({ from } as never, {
			speciesId: 'species-1',
			subspeciesId: 'subspecies-1',
			classId: 'class-1',
			subclassId: 'subclass-1',
			backgroundId: 'background-1'
		});

		expect(selection).toEqual({
			speciesId: 'species-1',
			race: 'Elfo',
			subspeciesId: 'subspecies-1',
			subrace: 'High Elf',
			classId: 'class-1',
			className: 'Clerigo',
			subclassId: 'subclass-1',
			subclass: 'Life Domain',
			backgroundId: 'background-1',
			background: 'Sage'
		});
	});

	it('rejects a subspecies that does not match the selected species', async () => {
		const speciesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'species-1',
				slug: 'elfo',
				name: 'Elfo'
			},
			error: null
		});
		const speciesEq = vi.fn().mockReturnValue({ single: speciesSingle });
		const speciesSelect = vi.fn().mockReturnValue({ eq: speciesEq });

		const subspeciesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'subspecies-1',
				species_slug: 'humano',
				name: 'High Elf'
			},
			error: null
		});
		const subspeciesEq = vi.fn().mockReturnValue({ single: subspeciesSingle });
		const subspeciesSelect = vi.fn().mockReturnValue({ eq: subspeciesEq });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'subspecies') {
				return { select: subspeciesSelect };
			}

			if (
				table === 'character_classes' ||
				table === 'subclasses' ||
				table === 'backgrounds'
			) {
				return { select: vi.fn() };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		await expect(
			resolveCharacterCreationCatalogSelections({ from } as never, {
				speciesId: 'species-1',
				subspeciesId: 'subspecies-1'
			})
		).rejects.toThrow('Please choose a valid subspecies for the selected species.');
	});

	it('rejects unknown selected IDs', async () => {
		const speciesSingle = vi.fn().mockResolvedValue({
			data: null,
			error: new Error('missing')
		});
		const speciesEq = vi.fn().mockReturnValue({ single: speciesSingle });
		const speciesSelect = vi.fn().mockReturnValue({ eq: speciesEq });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (
				table === 'subspecies' ||
				table === 'character_classes' ||
				table === 'subclasses' ||
				table === 'backgrounds'
			) {
				return { select: vi.fn() };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		await expect(
			resolveCharacterCreationCatalogSelections({ from } as never, {
				speciesId: 'missing-species'
			})
		).rejects.toThrow('Please choose a valid species from the catalog.');
	});
});

describe('listExpandedContentCatalog', () => {
	it('loads the broader shared SRD catalog for live browsing', async () => {
		const speciesOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'species-1',
					slug: 'elfo',
					name: 'Elfo',
					summary: 'Agile and perceptive.',
					base_speed: 30,
					mechanics: [
						{ type: 'language', mode: 'fixed', language: 'comun' },
						{ type: 'proficiency', proficiencyType: 'skill', value: 'perception' }
					]
				}
			],
			error: null
		});
		const speciesSelect = vi.fn().mockReturnValue({ order: speciesOrder });

		const subspeciesOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'subspecies-1',
					slug: 'high-elf',
					species_slug: 'elfo',
					name: 'High Elf',
					summary: 'Arcane focused.',
					mechanics: [
						{ type: 'choose_language', count: 1 },
						{ type: 'proficiency', proficiencyType: 'weapon', value: 'longbow' }
					]
				}
			],
			error: null
		});
		const subspeciesSelect = vi.fn().mockReturnValue({ order: subspeciesOrder });

		const classesOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'class-1',
					slug: 'clerigo',
					name: 'Clerigo',
					summary: 'Divine support caster.',
					hit_die: 8,
					mechanics: [
						{ type: 'spellcasting', ability: 'wisdom' },
						{ type: 'spell_grant', spellId: 'guiding-bolt' },
						{ type: 'proficiency', proficiencyType: 'saving_throw', value: 'wisdom' }
					]
				}
			],
			error: null
		});
		const classesSelect = vi.fn().mockReturnValue({ order: classesOrder });

		const subclassOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'subclass-1',
					slug: 'life-domain',
					class_slug: 'clerigo',
					name: 'Life Domain',
					summary: 'Healing focused.',
					mechanics: [
						{ type: 'proficiency', proficiencyType: 'armor', value: 'heavy-armor' }
					],
					granted_spells_by_level: [{ level: 1, spellSlugs: ['bless', 'cure-wounds'] }]
				}
			],
			error: null
		});
		const subclassSelect = vi.fn().mockReturnValue({ order: subclassOrder });

		const backgroundOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'background-1',
					slug: 'sage',
					name: 'Sage',
					summary: 'Academic researcher.',
					mechanics: [
						{ type: 'choose_language', count: 2 },
						{ type: 'proficiency', proficiencyType: 'skill', value: 'arcana' }
					]
				}
			],
			error: null
		});
		const backgroundSelect = vi.fn().mockReturnValue({ order: backgroundOrder });

		const spellNameOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'spell-1',
					slug: 'bless',
					name: 'Bless',
					level: 1,
					school: 'enchantment',
					casting_time: '1 action',
					range_text: '30 feet',
					components: 'V, S, M',
					duration: 'Up to 1 minute',
					class_slugs: ['clerigo'],
					summary: 'Buff allies.',
					description: 'Bolster your allies with divine favor.',
					concentration: true,
					ritual: false
				}
			],
			error: null
		});
		const spellLevelOrder = vi.fn().mockReturnValue({ order: spellNameOrder });
		const spellSelect = vi.fn().mockReturnValue({ order: spellLevelOrder });

		const featOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'feat-1',
					slug: 'heavily-armored',
					name: 'Heavily Armored',
					prerequisites: ['proficiency:armor:medium-armor'],
					summary: 'Gain heavy armor training.',
					description: 'Boosts durability for front-line builds.'
				}
			],
			error: null
		});
		const featSelect = vi.fn().mockReturnValue({ order: featOrder });

		const equipmentOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'equipment-1',
					slug: 'quarterstaff',
					name: 'Quarterstaff',
					category: 'weapon',
					summary: 'A simple weapon.',
					description: 'A sturdy wooden staff.',
					weight: 4,
					value: '2 sp',
					damage: '1d6',
					damage_type: 'bludgeoning',
					range_text: 'Melee',
					properties: ['versatile (1d8)'],
					is_weapon: true,
					is_equippable: true
				}
			],
			error: null
		});
		const equipmentSelect = vi.fn().mockReturnValue({ order: equipmentOrder });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'subspecies') {
				return { select: subspeciesSelect };
			}

			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'subclasses') {
				return { select: subclassSelect };
			}

			if (table === 'backgrounds') {
				return { select: backgroundSelect };
			}

			if (table === 'spells') {
				return { select: spellSelect };
			}

			if (table === 'feats') {
				return { select: featSelect };
			}

			if (table === 'equipment') {
				return { select: equipmentSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const catalog = await listExpandedContentCatalog({ from } as never);

		expect(catalog).toEqual({
			species: [
				{
					id: 'species-1',
					slug: 'elfo',
					name: 'Elfo',
					summary: 'Agile and perceptive.',
					baseSpeed: 30,
					mechanicSummary: {
						spellcastingAbilities: [],
						languageGrants: [{ kind: 'fixed', language: 'comun' }],
						proficiencyGrants: [{ proficiencyType: 'skill', value: 'perception' }],
						proficiencyChoices: []
					}
				}
			],
			subspecies: [
				{
					id: 'subspecies-1',
					slug: 'high-elf',
					speciesSlug: 'elfo',
					name: 'High Elf',
					summary: 'Arcane focused.',
					mechanicSummary: {
						spellcastingAbilities: [],
						languageGrants: [{ kind: 'choice', count: 1 }],
						proficiencyGrants: [{ proficiencyType: 'weapon', value: 'longbow' }],
						proficiencyChoices: []
					}
				}
			],
			classes: [
				{
					id: 'class-1',
					slug: 'clerigo',
					name: 'Clerigo',
					summary: 'Divine support caster.',
					hitDie: 8,
					mechanicSummary: {
						spellcastingAbilities: ['wisdom'],
						languageGrants: [],
						proficiencyGrants: [{ proficiencyType: 'saving_throw', value: 'wisdom' }],
						proficiencyChoices: []
					},
					grantedSpellSlugs: ['guiding-bolt']
				}
			],
			subclasses: [
				{
					id: 'subclass-1',
					slug: 'life-domain',
					classSlug: 'clerigo',
					name: 'Life Domain',
					summary: 'Healing focused.',
					mechanicSummary: {
						spellcastingAbilities: [],
						languageGrants: [],
						proficiencyGrants: [{ proficiencyType: 'armor', value: 'heavy-armor' }],
						proficiencyChoices: []
					},
					grantedSpellsByLevel: [{ level: 1, spellSlugs: ['bless', 'cure-wounds'] }]
				}
			],
			backgrounds: [
				{
					id: 'background-1',
					slug: 'sage',
					name: 'Sage',
					summary: 'Academic researcher.',
					mechanicSummary: {
						spellcastingAbilities: [],
						languageGrants: [{ kind: 'choice', count: 2 }],
						proficiencyGrants: [{ proficiencyType: 'skill', value: 'arcana' }],
						proficiencyChoices: []
					}
				}
			],
			spells: [
				{
					id: 'spell-1',
					slug: 'bless',
					name: 'Bless',
					visibility: 'shared',
					isSystemContent: undefined,
					level: 1,
					school: 'enchantment',
					castingTime: '1 action',
					range: '30 feet',
					components: 'V, S, M',
					duration: 'Up to 1 minute',
					classSlugs: ['clerigo'],
					summary: 'Buff allies.',
					description: 'Bolster your allies with divine favor.',
					concentration: true,
					ritual: false
				}
			],
			feats: [
				{
					id: 'feat-1',
					slug: 'heavily-armored',
					name: 'Heavily Armored',
					prerequisites: ['proficiency:armor:medium-armor'],
					summary: 'Gain heavy armor training.',
					description: 'Boosts durability for front-line builds.'
				}
			],
			equipment: [
				{
					id: 'equipment-1',
					slug: 'quarterstaff',
					name: 'Quarterstaff',
					category: 'weapon',
					summary: 'A simple weapon.',
					description: 'A sturdy wooden staff.',
					weight: 4,
					value: '2 sp',
					damage: '1d6',
					damageType: 'bludgeoning',
					range: 'Melee',
					properties: ['versatile (1d8)'],
					isWeapon: true,
					isEquippable: true
				}
			],
			vocabularies: expect.any(Object)
		});

		expect(catalog.vocabularies.abilities).toEqual([
			{ slug: 'strength', name: 'Strength' },
			{ slug: 'dexterity', name: 'Dexterity' },
			{ slug: 'constitution', name: 'Constitution' },
			{ slug: 'intelligence', name: 'Intelligence' },
			{ slug: 'wisdom', name: 'Wisdom' },
			{ slug: 'charisma', name: 'Charisma' }
		]);
		expect(catalog.vocabularies.languages).toContainEqual({
			slug: 'comun',
			name: 'Comun'
		});
		expect(catalog.vocabularies.skillProficiencies).toContainEqual({
			slug: 'arcana',
			name: 'Arcana',
			proficiencyType: 'skill'
		});
		expect(catalog.vocabularies.weaponProficiencies).toContainEqual({
			slug: 'simple-weapons',
			name: 'Simple Weapons',
			proficiencyType: 'weapon'
		});
		expect(catalog.vocabularies.savingThrowProficiencies).toContainEqual({
			slug: 'wisdom',
			name: 'Wisdom',
			proficiencyType: 'saving_throw'
		});
	});
});

describe('resolveCharacterSpellCatalogSelections', () => {
	it('normalizes linked spell rows from trusted catalog data', async () => {
		const classesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'class-1',
				slug: 'clerigo',
				name: 'Clerigo'
			},
			error: null
		});
		const classesEq = vi.fn().mockReturnValue({ single: classesSingle });
		const classesSelect = vi.fn().mockReturnValue({ eq: classesEq });

		const spellsIn = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'spell-1',
					slug: 'bless',
					name: 'Bless',
					level: 1,
					school: 'enchantment',
					casting_time: '1 action',
					range_text: '30 feet',
					components: 'V, S, M',
					duration: 'Up to 1 minute',
					class_slugs: ['clerigo'],
					summary: 'Buff allies.',
					description: 'Bolster your allies with divine favor.',
					concentration: true,
					ritual: false
				}
			],
			error: null
		});
		const spellsSelect = vi.fn().mockReturnValue({ in: spellsIn });

		const from = vi.fn((table: string) => {
			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'spells') {
				return { select: spellsSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const spellItems = await resolveCharacterSpellCatalogSelections({ from } as never, {
			classId: 'class-1',
			spellItems: [
				{
					spellId: 'spell-1',
					name: 'Old Name',
					level: 9,
					isPrepared: true
				}
			]
		});

		expect(spellItems).toEqual([
			{
				spellId: 'spell-1',
				name: 'Bless',
				level: 1,
				school: 'enchantment',
				castingTime: '1 action',
				range: '30 feet',
				components: 'V, S, M',
				duration: 'Up to 1 minute',
				description: 'Bolster your allies with divine favor.',
				isPrepared: true
			}
		]);
	});

	it('accepts linked spells granted directly by the selected class', async () => {
		const classesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'class-1',
				slug: 'clerigo',
				name: 'Clerigo',
				mechanics: [{ type: 'spell_grant', spellId: 'magic-missile' }]
			},
			error: null
		});
		const classesEq = vi.fn().mockReturnValue({ single: classesSingle });
		const classesSelect = vi.fn().mockReturnValue({ eq: classesEq });

		const spellsIn = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'spell-1',
					slug: 'magic-missile',
					name: 'Magic Missile',
					level: 1,
					school: 'evocation',
					casting_time: '1 action',
					range_text: '120 feet',
					components: 'V, S',
					duration: 'Instantaneous',
					class_slugs: ['mago'],
					summary: 'Arcane force darts.',
					description: 'Three glowing darts of force strike automatically.',
					concentration: false,
					ritual: false
				}
			],
			error: null
		});
		const spellsSelect = vi.fn().mockReturnValue({ in: spellsIn });

		const from = vi.fn((table: string) => {
			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'spells') {
				return { select: spellsSelect };
			}

			if (table === 'subclasses') {
				return { select: vi.fn() };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const spellItems = await resolveCharacterSpellCatalogSelections({ from } as never, {
			classId: 'class-1',
			spellItems: [
				{
					spellId: 'spell-1',
					name: 'Old Name',
					isPrepared: true
				}
			]
		});

		expect(spellItems[0]?.name).toBe('Magic Missile');
		expect(spellItems[0]?.spellId).toBe('spell-1');
	});

	it('accepts linked spells granted by the selected subclass', async () => {
		const classesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'class-1',
				slug: 'clerigo',
				name: 'Clerigo',
				mechanics: []
			},
			error: null
		});
		const classesEq = vi.fn().mockReturnValue({ single: classesSingle });
		const classesSelect = vi.fn().mockReturnValue({ eq: classesEq });

		const subclassesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'subclass-1',
				class_slug: 'clerigo',
				name: 'Knowledge Domain',
				granted_spells_by_level: [{ level: 1, spellSlugs: ['identify'] }]
			},
			error: null
		});
		const subclassesEq = vi.fn().mockReturnValue({ single: subclassesSingle });
		const subclassesSelect = vi.fn().mockReturnValue({ eq: subclassesEq });

		const spellsIn = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'spell-1',
					slug: 'identify',
					name: 'Identify',
					level: 1,
					school: 'divination',
					casting_time: '1 minute',
					range_text: 'Touch',
					components: 'V, S, M',
					duration: 'Instantaneous',
					class_slugs: ['mago'],
					summary: 'Learn an item or effect properties.',
					description: 'You learn whether an object is magical and how to use it.',
					concentration: false,
					ritual: true
				}
			],
			error: null
		});
		const spellsSelect = vi.fn().mockReturnValue({ in: spellsIn });

		const from = vi.fn((table: string) => {
			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'subclasses') {
				return { select: subclassesSelect };
			}

			if (table === 'spells') {
				return { select: spellsSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const spellItems = await resolveCharacterSpellCatalogSelections({ from } as never, {
			classId: 'class-1',
			subclassId: 'subclass-1',
			spellItems: [
				{
					spellId: 'spell-1',
					name: 'Old Name',
					isPrepared: true
				}
			]
		});

		expect(spellItems[0]?.name).toBe('Identify');
		expect(spellItems[0]?.spellId).toBe('spell-1');
	});

	it('accepts linked spells granted by subclass spell_grant mechanics', async () => {
		const classesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'class-1',
				slug: 'clerigo',
				name: 'Clerigo',
				mechanics: []
			},
			error: null
		});
		const classesEq = vi.fn().mockReturnValue({ single: classesSingle });
		const classesSelect = vi.fn().mockReturnValue({ eq: classesEq });

		const subclassesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'subclass-1',
				class_slug: 'clerigo',
				name: 'Knowledge Domain',
				mechanics: [{ type: 'spell_grant', spellId: 'identify' }],
				granted_spells_by_level: []
			},
			error: null
		});
		const subclassesEq = vi.fn().mockReturnValue({ single: subclassesSingle });
		const subclassesSelect = vi.fn().mockReturnValue({ eq: subclassesEq });

		const spellsIn = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'spell-1',
					slug: 'identify',
					name: 'Identify',
					level: 1,
					school: 'divination',
					casting_time: '1 minute',
					range_text: 'Touch',
					components: 'V, S, M',
					duration: 'Instantaneous',
					class_slugs: ['mago'],
					summary: 'Learn an item or effect properties.',
					description: 'You learn whether an object is magical and how to use it.',
					concentration: false,
					ritual: true
				}
			],
			error: null
		});
		const spellsSelect = vi.fn().mockReturnValue({ in: spellsIn });

		const from = vi.fn((table: string) => {
			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'subclasses') {
				return { select: subclassesSelect };
			}

			if (table === 'spells') {
				return { select: spellsSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const spellItems = await resolveCharacterSpellCatalogSelections({ from } as never, {
			classId: 'class-1',
			subclassId: 'subclass-1',
			spellItems: [
				{
					spellId: 'spell-1',
					name: 'Old Name',
					isPrepared: true
				}
			]
		});

		expect(spellItems[0]?.name).toBe('Identify');
		expect(spellItems[0]?.spellId).toBe('spell-1');
	});

	it('rejects linked spells that do not match the selected class', async () => {
		const classesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'class-1',
				slug: 'guerrero',
				name: 'Guerrero',
				mechanics: []
			},
			error: null
		});
		const classesEq = vi.fn().mockReturnValue({ single: classesSingle });
		const classesSelect = vi.fn().mockReturnValue({ eq: classesEq });

		const spellsIn = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'spell-1',
					slug: 'bless',
					name: 'Bless',
					level: 1,
					school: 'enchantment',
					casting_time: '1 action',
					range_text: '30 feet',
					components: 'V, S, M',
					duration: 'Up to 1 minute',
					class_slugs: ['clerigo'],
					summary: 'Buff allies.',
					description: 'Bolster your allies with divine favor.',
					concentration: true,
					ritual: false
				}
			],
			error: null
		});
		const spellsSelect = vi.fn().mockReturnValue({ in: spellsIn });

		const from = vi.fn((table: string) => {
			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'spells') {
				return { select: spellsSelect };
			}

			if (table === 'subclasses') {
				return { select: vi.fn() };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		await expect(
			resolveCharacterSpellCatalogSelections({ from } as never, {
				classId: 'class-1',
				spellItems: [
					{
						spellId: 'spell-1',
						name: 'Bless',
						isPrepared: false
					}
				]
			})
		).rejects.toThrow('Please choose a valid spell for the selected class.');
	});
});

describe('resolveCharacterFeatCatalogSelections', () => {
	it('normalizes linked feat rows from trusted catalog data', async () => {
		const featsIn = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'feat-1',
					slug: 'alert',
					name: 'Alert',
					prerequisites: [],
					summary: 'Act quickly.',
					description: 'You gain a bonus to initiative.'
				}
			],
			error: null
		});
		const featsSelect = vi.fn().mockReturnValue({ in: featsIn });
		const from = vi.fn((table: string) => {
			if (table === 'feats') {
				return { select: featsSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const featItems = await resolveCharacterFeatCatalogSelections({ from } as never, {
			featItems: [
				{
					featId: 'feat-1',
					name: 'Old Name'
				}
			]
		});

		expect(featItems).toEqual([
			{
				featId: 'feat-1',
				name: 'Alert',
				description: 'You gain a bonus to initiative.'
			}
		]);
	});

	it('rejects unknown linked feats', async () => {
		const featsIn = vi.fn().mockResolvedValue({
			data: [],
			error: null
		});
		const featsSelect = vi.fn().mockReturnValue({ in: featsIn });
		const from = vi.fn((table: string) => {
			if (table === 'feats') {
				return { select: featsSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		await expect(
			resolveCharacterFeatCatalogSelections({ from } as never, {
				featItems: [
					{
						featId: 'missing-feat',
						name: 'Missing'
					}
				]
			})
		).rejects.toThrow('Please choose a valid feat from the catalog.');
	});
});

describe('resolveCharacterAttackCatalogSelections', () => {
	it('normalizes linked attacks from trusted equipment data', async () => {
		const equipmentIn = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'equipment-1',
					slug: 'quarterstaff',
					name: 'Quarterstaff',
					category: 'weapon',
					summary: 'A simple weapon.',
					description: 'A sturdy wooden staff.',
					weight: 4,
					value: '2 sp',
					damage: '1d6',
					damage_type: 'bludgeoning',
					range_text: 'Melee',
					properties: ['versatile (1d8)'],
					is_weapon: true,
					is_equippable: true
				}
			],
			error: null
		});
		const equipmentSelect = vi.fn().mockReturnValue({ in: equipmentIn });
		const from = vi.fn((table: string) => {
			if (table === 'equipment') {
				return { select: equipmentSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const attackItems = await resolveCharacterAttackCatalogSelections({ from } as never, {
			attackItems: [
				{
					equipmentId: 'equipment-1',
					name: 'Old Name',
					attackBonus: '+4'
				}
			]
		});

		expect(attackItems).toEqual([
			{
				equipmentId: 'equipment-1',
				name: 'Quarterstaff',
				attackBonus: '+4',
				damage: '1d6',
				damageType: 'bludgeoning',
				range: 'Melee',
				description: 'A sturdy wooden staff.'
			}
		]);
	});
});

describe('resolveCharacterInventoryCatalogSelections', () => {
	it('normalizes linked inventory items from trusted equipment data', async () => {
		const equipmentIn = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'equipment-1',
					slug: 'spellbook',
					name: 'Spellbook',
					category: 'book',
					summary: 'Arcane notes.',
					description: 'A wizard spellbook.',
					weight: 3,
					value: '50 gp',
					damage: null,
					damage_type: null,
					range_text: null,
					properties: [],
					is_weapon: false,
					is_equippable: true
				}
			],
			error: null
		});
		const equipmentSelect = vi.fn().mockReturnValue({ in: equipmentIn });
		const from = vi.fn((table: string) => {
			if (table === 'equipment') {
				return { select: equipmentSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const inventoryItems = await resolveCharacterInventoryCatalogSelections({ from } as never, {
			inventoryItems: [
				{
					equipmentId: 'equipment-1',
					name: 'Old Name',
					quantity: 1,
					isEquipped: false
				}
			]
		});

		expect(inventoryItems).toEqual([
			{
				equipmentId: 'equipment-1',
				name: 'Spellbook',
				quantity: 1,
				description: 'A wizard spellbook.',
				weight: 3,
				value: '50 gp',
				isEquipped: false
			}
		]);
	});
});
