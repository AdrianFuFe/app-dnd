import { describe, expect, it } from 'vitest';
import {
	createDefaultGuidedCharacterInput,
	deriveGuidedCharacterDraft,
	getGuidedChoiceInvalidSelectedValues,
	getGuidedChoiceSelectedValues,
	getGuidedChoiceValidSelectedValues,
	humanizeGuidedChoiceValue,
	sanitizeGuidedChoiceEntries,
	type GuidedCharacterCatalog
} from './guided-character';

const catalog: GuidedCharacterCatalog = {
	speciesOptions: [
		{
			id: 'species-1',
			slug: 'elfo',
			name: 'Elf',
			summary: 'Graceful ancestry.',
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'canon',
			baseSpeed: 30,
			mechanics: [
				{ type: 'ability_bonus', ability: 'dexterity', value: 2 },
				{ type: 'language', mode: 'fixed', language: 'comun' },
				{ type: 'language', mode: 'fixed', language: 'elfico' },
				{ type: 'proficiency', proficiencyType: 'skill', value: 'perception' },
				{ type: 'darkvision', range: 60 },
				{ type: 'resistance', damageType: 'poison' }
			]
		}
	],
	subspeciesOptions: [
		{
			id: 'subspecies-1',
			slug: 'high-elf',
			speciesSlug: 'elfo',
			name: 'High Elf',
			summary: 'Arcane line.',
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'canon',
			mechanics: [
				{ type: 'ability_bonus', ability: 'intelligence', value: 1 },
				{
					type: 'choose_ability_bonus',
					count: 1,
					value: 1,
					allowed: ['intelligence', 'wisdom']
				},
				{ type: 'choose_language', count: 1 }
			]
		}
	],
	classOptions: [
		{
			id: 'class-1',
			slug: 'clerigo',
			name: 'Cleric',
			summary: 'Divine caster.',
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'canon',
			hitDie: 8,
			startingEquipment: [
				{ type: 'choice', options: ['mace', 'warhammer'] },
				{ type: 'item', id: 'shield' }
			],
			mechanics: [
				{ type: 'proficiency', proficiencyType: 'saving_throw', value: 'wisdom' },
				{ type: 'proficiency', proficiencyType: 'saving_throw', value: 'charisma' },
				{ type: 'spellcasting', ability: 'wisdom' },
				{
					type: 'choose_proficiency',
					proficiencyType: 'skill',
					count: 2,
					options: ['history', 'insight']
				}
			]
		}
	],
	subclassOptions: [
		{
			id: 'subclass-1',
			slug: 'life-domain',
			classSlug: 'clerigo',
			name: 'Life Domain',
			summary: 'Healing path.',
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'canon',
			startsAtLevel: 1,
			mechanics: [
				{ type: 'proficiency', proficiencyType: 'armor', value: 'heavy-armor' },
				{ type: 'spell_grant', spellId: 'revivify' },
				{ type: 'feature', featureId: 'disciple-of-life' },
				{ type: 'note', text: 'Gain heavy armor training.' }
			],
			grantedSpellsByLevel: [
				{ level: 1, spellSlugs: ['bless', 'cure-wounds'] },
				{ level: 3, spellSlugs: ['revivify'] }
			]
		}
	],
	backgroundOptions: [
		{
			id: 'background-1',
			slug: 'sage',
			name: 'Sage',
			summary: 'Academic researcher.',
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'canon',
			startingEquipment: [
				{ type: 'item', id: 'holy-symbol' },
				{ type: 'choice', options: ['prayer-book', 'prayer-wheel'] }
			],
			mechanics: [
				{ type: 'proficiency', proficiencyType: 'skill', value: 'arcana' },
				{ type: 'resource', name: 'Research lead', maxFormula: '1', resetOn: 'long_rest' },
				{ type: 'choose_language', count: 2 }
			]
		}
	],
	spellCatalog: [
		{
			id: 'spell-1',
			slug: 'bless',
			name: 'Bless',
			level: 1,
			school: 'enchantment',
			castingTime: '1 action',
			range: '30 feet',
			components: 'V, S, M',
			duration: 'Up to 1 minute',
			classSlugs: ['clerigo'],
			summary: 'Buff allies.',
			description: 'Divine favor bolsters allies.',
			concentration: true,
			ritual: false
		},
		{
			id: 'spell-2',
			slug: 'cure-wounds',
			name: 'Cure Wounds',
			level: 1,
			school: 'evocation',
			castingTime: '1 action',
			range: 'Touch',
			components: 'V, S',
			duration: 'Instantaneous',
			classSlugs: ['clerigo'],
			summary: 'Heal a creature.',
			description: 'A creature regains hit points.',
			concentration: false,
			ritual: false
		},
		{
			id: 'spell-3',
			slug: 'revivify',
			name: 'Revivify',
			level: 3,
			school: 'necromancy',
			castingTime: '1 action',
			range: 'Touch',
			components: 'V, S, M',
			duration: 'Instantaneous',
			classSlugs: ['paladin'],
			summary: 'Restore recent life.',
			description: 'You touch a creature that has died within the last minute.',
			concentration: false,
			ritual: false
		}
	],
	equipmentCatalog: [
		{
			id: 'equipment-1',
			slug: 'mace',
			name: 'Mace',
			category: 'weapon',
			summary: 'Simple weapon.',
			description: 'A sturdy mace.',
			weight: 4,
			value: '5 gp',
			damage: '1d6',
			damageType: 'bludgeoning',
			range: 'Melee',
			properties: [],
			isWeapon: true,
			isEquippable: true
		},
		{
			id: 'equipment-2',
			slug: 'warhammer',
			name: 'Warhammer',
			category: 'weapon',
			summary: 'Martial weapon.',
			description: 'A balanced warhammer.',
			weight: 2,
			value: '15 gp',
			damage: '1d8',
			damageType: 'bludgeoning',
			range: 'Melee',
			properties: ['versatile (1d10)'],
			isWeapon: true,
			isEquippable: true
		},
		{
			id: 'equipment-3',
			slug: 'shield',
			name: 'Shield',
			category: 'armor',
			summary: 'Defensive shield.',
			description: 'A sturdy shield.',
			weight: 6,
			value: '10 gp',
			damage: null,
			damageType: null,
			range: null,
			properties: [],
			isWeapon: false,
			isEquippable: true
		},
		{
			id: 'equipment-4',
			slug: 'holy-symbol',
			name: 'Holy Symbol',
			category: 'focus',
			summary: 'Divine focus.',
			description: 'A holy symbol.',
			weight: 1,
			value: '5 gp',
			damage: null,
			damageType: null,
			range: null,
			properties: [],
			isWeapon: false,
			isEquippable: true
		},
		{
			id: 'equipment-5',
			slug: 'prayer-book',
			name: 'Prayer Book',
			category: 'book',
			summary: 'Devotional text.',
			description: 'A prayer book.',
			weight: 5,
			value: '1 gp',
			damage: null,
			damageType: null,
			range: null,
			properties: [],
			isWeapon: false,
			isEquippable: false
		},
		{
			id: 'equipment-6',
			slug: 'prayer-wheel',
			name: 'Prayer Wheel',
			category: 'focus',
			summary: 'Devotional focus.',
			description: 'A prayer wheel.',
			weight: 1,
			value: '1 gp',
			damage: null,
			damageType: null,
			range: null,
			properties: [],
			isWeapon: false,
			isEquippable: true
		}
	],
	vocabularies: {
		abilities: [
			{ slug: 'strength', name: 'Strength' },
			{ slug: 'dexterity', name: 'Dexterity' },
			{ slug: 'constitution', name: 'Constitution' },
			{ slug: 'intelligence', name: 'Intelligence' },
			{ slug: 'wisdom', name: 'Wisdom' },
			{ slug: 'charisma', name: 'Charisma' }
		],
		languages: [
			{ slug: 'comun', name: 'Comun' },
			{ slug: 'elfico', name: 'Elfico' },
			{ slug: 'draconico', name: 'Draconico' },
			{ slug: 'gigante', name: 'Gigante' }
		],
		damageTypes: [],
		spellSchools: [],
		skillProficiencies: [
			{ slug: 'history', name: 'History', proficiencyType: 'skill' },
			{ slug: 'insight', name: 'Insight', proficiencyType: 'skill' },
			{ slug: 'arcana', name: 'Arcana', proficiencyType: 'skill' }
		],
		armorProficiencies: [],
		weaponProficiencies: [],
		toolProficiencies: [],
		savingThrowProficiencies: []
	}
};

describe('deriveGuidedCharacterDraft', () => {
	it('builds a canonical level-1 draft with derived combat stats and granted spells', () => {
		const input = {
			...createDefaultGuidedCharacterInput(),
			speciesId: 'species-1',
			subspeciesId: 'subspecies-1',
			classId: 'class-1',
			subclassId: 'subclass-1',
			backgroundId: 'background-1',
			constitution: 14,
			dexterity: 12,
			abilityChoices: [{ key: 'ability:0', value: 'intelligence' }],
			languageChoices: [
				{ key: 'language:0', value: 'draconico' },
				{ key: 'language:1', value: 'comun' },
				{ key: 'language:1', value: 'gigante' }
			],
			proficiencyChoices: [
				{ key: 'skill:0', value: 'history' },
				{ key: 'skill:0', value: 'insight' }
			],
			equipmentChoices: [
				{ key: 'equipment:0', value: 'mace' },
				{ key: 'equipment:1', value: 'prayer-book' }
	]
};

		const draft = deriveGuidedCharacterDraft(catalog, input);

		expect(draft.character.race).toBe('Elf');
		expect(draft.character.rulesetCode).toBe('dnd-2014-srd');
		expect(draft.character.contentMode).toBe('canon');
		expect(draft.character.subrace).toBe('High Elf');
		expect(draft.character.className).toBe('Cleric');
		expect(draft.character.background).toBe('Sage');
		expect(draft.character.dexterity).toBe(14);
		expect(draft.character.intelligence).toBe(12);
		expect(draft.character.maxHp).toBe(10);
		expect(draft.character.currentHp).toBe(10);
		expect(draft.character.armorClass).toBe(12);
		expect(draft.character.initiative).toBe(2);
		expect(draft.character.hitDice).toBe('1d8');
		expect(draft.character.spellItems.map((entry) => entry.name)).toEqual([
			'Bless',
			'Cure Wounds'
		]);
		expect(draft.preview.resolvedChoiceLines).toEqual([
			'Chosen ability bonuses: Intelligence (+1)',
			'Chosen languages: Draconico',
			'Chosen languages: Comun, Gigante',
			'Chosen Skill proficiencies: History, Insight',
			'Chosen equipment: Mace',
			'Chosen equipment: Prayer Book'
		]);
		expect(draft.preview.pendingChoiceLines).toEqual([]);
		expect(draft.preview.rulesetCode).toBe('dnd-2014-srd');
		expect(draft.preview.contentMode).toBe('canon');
		expect(draft.preview.customizationReasonLines).toEqual([]);
		expect(draft.preview.derivedInventoryItems.map((entry) => entry.name)).toEqual([
			'Mace',
			'Shield',
			'Holy Symbol',
			'Prayer Book'
		]);
		expect(draft.character.attackItems).toEqual([
			{
				equipmentId: 'equipment-1',
				name: 'Mace',
				attackBonus: '+2',
				damage: '1d6',
				damageType: 'bludgeoning',
				range: 'Melee',
				description: 'A sturdy mace.'
			}
		]);
		expect(draft.preview.derivedAttackItems).toEqual(draft.character.attackItems);
		expect(draft.character.noteItems).toEqual([
			{
				title: 'Guided build grants',
				content:
					'Language: Comun\nLanguage: Elfico\nSkill proficiency: Perception\nDarkvision: 60 ft.\nResistance: Poison\nSaving Throw proficiency: Wisdom\nSaving Throw proficiency: Charisma\nSpellcasting ability: Wisdom\nArmor proficiency: Heavy Armor\nFeature: Disciple Of Life\nNote: Gain heavy armor training.\nSkill proficiency: Arcana\nResource: Research lead (1, Long Rest)'
			},
			{
				title: 'Guided build choices',
				content:
					'Chosen ability bonuses: Intelligence (+1)\nChosen languages: Draconico\nChosen languages: Comun, Gigante\nChosen Skill proficiencies: History, Insight\nChosen equipment: Mace\nChosen equipment: Prayer Book'
			}
		]);
	});

	it('rejects incomplete guided choices', () => {
		expect(() =>
			deriveGuidedCharacterDraft(catalog, {
				...createDefaultGuidedCharacterInput(),
				speciesId: 'species-1',
				subspeciesId: 'subspecies-1',
				classId: 'class-1',
				subclassId: 'subclass-1',
				backgroundId: 'background-1',
				abilityChoices: [{ key: 'ability:0', value: 'intelligence' }],
				languageChoices: [{ key: 'language:0', value: 'draconico' }],
				proficiencyChoices: [
					{ key: 'skill:0', value: 'history' },
					{ key: 'skill:0', value: 'insight' }
				],
				equipmentChoices: [
					{ key: 'equipment:0', value: 'mace' },
					{ key: 'equipment:1', value: 'prayer-book' }
				]
			})
		).toThrow('Please complete every required language choice.');
	});

	it('rejects duplicate guided picks inside the same choice group', () => {
		expect(() =>
			deriveGuidedCharacterDraft(catalog, {
				...createDefaultGuidedCharacterInput(),
				speciesId: 'species-1',
				subspeciesId: 'subspecies-1',
				classId: 'class-1',
				subclassId: 'subclass-1',
				backgroundId: 'background-1',
				abilityChoices: [
					{ key: 'ability:0', value: 'intelligence' },
					{ key: 'ability:0', value: 'intelligence' }
				],
				languageChoices: [
					{ key: 'language:0', value: 'draconico' },
					{ key: 'language:1', value: 'comun' },
					{ key: 'language:1', value: 'comun' }
				],
				proficiencyChoices: [
					{ key: 'skill:0', value: 'history' },
					{ key: 'skill:0', value: 'insight' }
				],
				equipmentChoices: [
					{ key: 'equipment:0', value: 'mace' },
					{ key: 'equipment:1', value: 'prayer-book' }
				]
			})
		).toThrow('Please avoid duplicate picks in each ability bonus choice.');
	});

	it('rejects guided picks that exceed the allowed number of choices', () => {
		expect(() =>
			deriveGuidedCharacterDraft(catalog, {
				...createDefaultGuidedCharacterInput(),
				speciesId: 'species-1',
				subspeciesId: 'subspecies-1',
				classId: 'class-1',
				subclassId: 'subclass-1',
				backgroundId: 'background-1',
				abilityChoices: [
					{ key: 'ability:0', value: 'intelligence' },
					{ key: 'ability:0', value: 'wisdom' }
				],
				languageChoices: [
					{ key: 'language:0', value: 'draconico' },
					{ key: 'language:0', value: 'gigante' },
					{ key: 'language:1', value: 'comun' },
					{ key: 'language:1', value: 'gigante' }
				],
				proficiencyChoices: [
					{ key: 'skill:0', value: 'history' },
					{ key: 'skill:0', value: 'insight' }
				],
				equipmentChoices: [
					{ key: 'equipment:0', value: 'mace' },
					{ key: 'equipment:1', value: 'prayer-book' }
				]
			})
		).toThrow('Please keep each ability bonus choice within the allowed number of picks.');
	});

	it('rejects dependent selections that do not match', () => {
		expect(() =>
			deriveGuidedCharacterDraft(catalog, {
				...createDefaultGuidedCharacterInput(),
				speciesId: 'species-1',
				subspeciesId: 'subspecies-1',
				classId: 'class-1',
				subclassId: 'subclass-1',
				backgroundId: 'background-1',
				abilityChoices: [{ key: 'ability:0', value: 'wisdom' }],
				languageChoices: [
					{ key: 'language:0', value: 'draconico' },
					{ key: 'language:1', value: 'comun' },
					{ key: 'language:1', value: 'gigante' }
				],
				proficiencyChoices: [
					{ key: 'skill:0', value: 'history' },
					{ key: 'skill:0', value: 'insight' }
				],
				equipmentChoices: [
					{ key: 'equipment:0', value: 'mace' },
					{ key: 'equipment:1', value: 'prayer-book' }
				]
			})
		).not.toThrow();

		expect(() =>
			deriveGuidedCharacterDraft(
				{
					...catalog,
					subspeciesOptions: [{ ...catalog.subspeciesOptions[0], speciesSlug: 'humano' }]
				},
				{
					...createDefaultGuidedCharacterInput(),
					speciesId: 'species-1',
					subspeciesId: 'subspecies-1',
					classId: 'class-1',
					backgroundId: 'background-1'
				}
			)
		).toThrow('Please choose a valid subspecies for the selected species.');
	});

	it('rejects subclasses that do not start at level 1', () => {
		expect(() =>
			deriveGuidedCharacterDraft(
				{
					...catalog,
					subclassOptions: [{ ...catalog.subclassOptions[0], startsAtLevel: 3 }]
				},
				{
					...createDefaultGuidedCharacterInput(),
					speciesId: 'species-1',
					subspeciesId: 'subspecies-1',
					classId: 'class-1',
					subclassId: 'subclass-1',
					backgroundId: 'background-1'
				}
			)
		).toThrow('Please choose a subclass that is available at level 1.');
	});

	it('marks the character as custom when a linked guided entity is custom for the same ruleset', () => {
		const draft = deriveGuidedCharacterDraft(
			{
				...catalog,
				backgroundOptions: [{ ...catalog.backgroundOptions[0], contentMode: 'custom' }]
			},
			{
				...createDefaultGuidedCharacterInput(),
				speciesId: 'species-1',
				subspeciesId: 'subspecies-1',
				classId: 'class-1',
				subclassId: 'subclass-1',
				backgroundId: 'background-1',
				abilityChoices: [{ key: 'ability:0', value: 'intelligence' }],
				languageChoices: [
					{ key: 'language:0', value: 'draconico' },
					{ key: 'language:1', value: 'comun' },
					{ key: 'language:1', value: 'gigante' }
				],
				proficiencyChoices: [
					{ key: 'skill:0', value: 'history' },
					{ key: 'skill:0', value: 'insight' }
				],
				equipmentChoices: [
					{ key: 'equipment:0', value: 'mace' },
					{ key: 'equipment:1', value: 'prayer-book' }
				]
			}
		);

		expect(draft.character.rulesetCode).toBe('dnd-2014-srd');
		expect(draft.character.contentMode).toBe('custom');
		expect(draft.preview.contentMode).toBe('custom');
		expect(draft.preview.customizationReasonLines).toEqual([
			'Uses custom background: Sage'
		]);
	});

	it('keeps the guided draft canonical when no linked content is custom', () => {
		const draft = deriveGuidedCharacterDraft(catalog, {
			...createDefaultGuidedCharacterInput(),
			speciesId: 'species-1',
			subspeciesId: 'subspecies-1',
			classId: 'class-1',
			subclassId: 'subclass-1',
			backgroundId: 'background-1',
			abilityChoices: [{ key: 'ability:0', value: 'intelligence' }],
			constitution: 14,
			dexterity: 12,
			languageChoices: [
				{ key: 'language:0', value: 'draconico' },
				{ key: 'language:1', value: 'comun' },
				{ key: 'language:1', value: 'gigante' }
			],
			proficiencyChoices: [
				{ key: 'skill:0', value: 'history' },
				{ key: 'skill:0', value: 'insight' }
			],
			equipmentChoices: [
				{ key: 'equipment:0', value: 'mace' },
				{ key: 'equipment:1', value: 'prayer-book' }
			]
		});

		expect(draft.character.contentMode).toBe('canon');
		expect(draft.character.maxHp).toBe(10);
		expect(draft.character.currentHp).toBe(10);
		expect(draft.character.temporaryHp).toBe(0);
		expect(draft.character.armorClass).toBe(12);
		expect(draft.character.initiative).toBe(2);
		expect(draft.character.speed).toBe(30);
		expect(draft.preview.derivedCombatStats).toEqual({
			maxHp: 10,
			currentHp: 10,
			temporaryHp: 0,
			armorClass: 12,
			initiative: 2,
			speed: 30
		});
		expect(draft.preview.customizationReasonLines).toEqual([]);
	});
});

describe('guided choice recovery helpers', () => {
	it('splits selected values into valid and invalid entries for a choice group', () => {
		const items = [
			{ key: 'equipment:3', value: 'priests-pack' },
			{ key: 'equipment:3', value: 'warhammer' },
			{ key: 'equipment:4', value: 'prayer-book' }
		];

		expect(getGuidedChoiceSelectedValues(items, 'equipment:3')).toEqual([
			'priests-pack',
			'warhammer'
		]);
		expect(
			getGuidedChoiceValidSelectedValues(items, 'equipment:3', [
				'priests-pack',
				'explorers-pack'
			])
		).toEqual(['priests-pack']);
		expect(
			getGuidedChoiceInvalidSelectedValues(items, 'equipment:3', [
				'priests-pack',
				'explorers-pack'
			])
		).toEqual(['warhammer']);
	});

	it('sanitizes stale invalid values for one choice group without touching others', () => {
		const items = [
			{ key: 'equipment:3', value: 'warhammer' },
			{ key: 'equipment:3', value: 'priests-pack' },
			{ key: 'equipment:4', value: 'prayer-book' }
		];

		expect(
			sanitizeGuidedChoiceEntries(items, 'equipment:3', ['priests-pack', 'explorers-pack'])
		).toEqual([
			{ key: 'equipment:3', value: 'priests-pack' },
			{ key: 'equipment:4', value: 'prayer-book' }
		]);
	});

	it('humanizes invalid guided choice values for recovery actions', () => {
		expect(humanizeGuidedChoiceValue('warhammer')).toBe('Warhammer');
		expect(humanizeGuidedChoiceValue('light-crossbow-and-20-bolts')).toBe(
			'Light Crossbow And 20 Bolts'
		);
	});
});
