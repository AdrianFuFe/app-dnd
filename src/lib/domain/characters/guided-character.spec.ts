import { describe, expect, it } from 'vitest';
import {
	createDefaultGuidedCharacterInput,
	deriveGuidedCharacterDraft,
	type GuidedCharacterCatalog
} from './guided-character';

const catalog: GuidedCharacterCatalog = {
	speciesOptions: [
		{
			id: 'species-1',
			slug: 'elfo',
			name: 'Elf',
			summary: 'Graceful ancestry.',
			baseSpeed: 30,
			mechanics: [
				{ type: 'ability_bonus', ability: 'dexterity', value: 2 },
				{ type: 'language', mode: 'fixed', language: 'comun' },
				{ type: 'language', mode: 'fixed', language: 'elfico' },
				{ type: 'proficiency', proficiencyType: 'skill', value: 'perception' }
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
			mechanics: [
				{ type: 'ability_bonus', ability: 'intelligence', value: 1 },
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
			hitDie: 8,
			startingEquipment: [
				{ type: 'choice', options: ['mace', 'warhammer'] },
				{ type: 'item', id: 'shield' }
			],
			mechanics: [
				{ type: 'proficiency', proficiencyType: 'saving_throw', value: 'wisdom' },
				{ type: 'proficiency', proficiencyType: 'saving_throw', value: 'charisma' },
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
			mechanics: [{ type: 'proficiency', proficiencyType: 'armor', value: 'heavy-armor' }],
			grantedSpellsByLevel: [{ level: 1, spellSlugs: ['bless', 'cure-wounds'] }]
		}
	],
	backgroundOptions: [
		{
			id: 'background-1',
			slug: 'sage',
			name: 'Sage',
			summary: 'Academic researcher.',
			startingEquipment: [
				{ type: 'item', id: 'holy-symbol' },
				{ type: 'choice', options: ['prayer-book', 'prayer-wheel'] }
			],
			mechanics: [
				{ type: 'proficiency', proficiencyType: 'skill', value: 'arcana' },
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
		abilities: [],
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
		expect(draft.character.subrace).toBe('High Elf');
		expect(draft.character.className).toBe('Cleric');
		expect(draft.character.background).toBe('Sage');
		expect(draft.character.dexterity).toBe(14);
		expect(draft.character.intelligence).toBe(11);
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
			'Chosen languages: Draconico',
			'Chosen languages: Comun, Gigante',
			'Chosen Skill proficiencies: History, Insight',
			'Chosen equipment: Mace',
			'Chosen equipment: Prayer Book'
		]);
		expect(draft.preview.pendingChoiceLines).toEqual([]);
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
					'Language: Comun\nLanguage: Elfico\nSkill proficiency: Perception\nSaving Throw proficiency: Wisdom\nSaving Throw proficiency: Charisma\nArmor proficiency: Heavy Armor\nSkill proficiency: Arcana'
			},
			{
				title: 'Guided build choices',
				content:
					'Chosen languages: Draconico\nChosen languages: Comun, Gigante\nChosen Skill proficiencies: History, Insight\nChosen equipment: Mace\nChosen equipment: Prayer Book'
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

	it('rejects dependent selections that do not match', () => {
		expect(() =>
			deriveGuidedCharacterDraft(catalog, {
				...createDefaultGuidedCharacterInput(),
				speciesId: 'species-1',
				subspeciesId: 'subspecies-1',
				classId: 'class-1',
				subclassId: 'subclass-1',
				backgroundId: 'background-1',
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
});
