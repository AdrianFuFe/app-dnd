import { describe, expect, it } from 'vitest';
import { deriveManualCharacterContentProfile } from './manual-character-content-profile';
import type { GuidedCharacterCatalog } from './guided-character';
import type {
	FeatCatalogEntry,
	SpellCatalogEntry
} from '$lib/types/content/expanded-content-catalog';
import type { CharacterCreateInput } from '$lib/types/domain/character';

const guidedCatalog: GuidedCharacterCatalog = {
	speciesOptions: [
		{
			id: 'species-1',
			slug: 'elfo',
			name: 'Elf',
			summary: null,
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'canon',
			baseSpeed: 30,
			mechanics: []
		}
	],
	subspeciesOptions: [],
	classOptions: [],
	subclassOptions: [],
	backgroundOptions: [
		{
			id: 'background-1',
			slug: 'sage-variant',
			name: 'Sage Variant',
			summary: null,
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'custom',
			startingEquipment: [],
			mechanics: []
		}
	],
	spellCatalog: [],
	equipmentCatalog: [],
	vocabularies: {
		abilities: [],
		languages: [],
		damageTypes: [],
		spellSchools: [],
		skillProficiencies: [],
		armorProficiencies: [],
		weaponProficiencies: [],
		toolProficiencies: [],
		savingThrowProficiencies: []
	}
};

const spellCatalog: SpellCatalogEntry[] = [
	{
		id: 'spell-1',
		slug: 'homebrew-light',
		name: 'Homebrew Light',
		rulesetCode: 'dnd-2014-srd',
		contentMode: 'custom',
		level: 1,
		school: 'evocation',
		castingTime: '1 action',
		range: '30 feet',
		components: 'V, S',
		duration: '1 minute',
		classSlugs: [],
		summary: null,
		description: null,
		concentration: false,
		ritual: false
	}
];

const featCatalog: FeatCatalogEntry[] = [];

const baseInput: CharacterCreateInput = {
	name: 'Talia',
	rulesetCode: 'dnd-2014-srd',
	contentMode: 'canon',
	speciesId: 'species-1',
	backgroundId: undefined,
	level: 1,
	strength: 10,
	dexterity: 10,
	constitution: 10,
	intelligence: 10,
	wisdom: 10,
	charisma: 10,
	maxHp: 8,
	currentHp: 8,
	temporaryHp: 0,
	armorClass: 10,
	initiative: 0,
	speed: 30,
	hitDice: '1d8',
	attackItems: [],
	spellItems: [
		{
			spellId: 'spell-guided-1',
			name: 'Mage Hand',
			isPrepared: true
		},
		{
			spellId: 'spell-guided-2',
			name: 'Shield',
			isPrepared: false
		}
	],
	featItems: [],
	inventoryItems: [],
	noteItems: []
};

describe('deriveManualCharacterContentProfile', () => {
	it('marks manual freeform rows as custom', () => {
		const result = deriveManualCharacterContentProfile(
			{
				...baseInput,
				attackItems: [{ name: 'Custom Strike' }],
				spellItems: [{ name: 'Homebrew Light', isPrepared: true }]
			},
			{
				guidedCatalog,
				spellCatalog,
				featCatalog
			}
		);

		expect(result.profile.contentMode).toBe('custom');
		expect(result.reasonLines).toEqual([
			'Manual override: Attack Items',
			'Manual override: Spell Items'
		]);
	});

	it('marks linked custom catalog content as custom', () => {
		const result = deriveManualCharacterContentProfile(
			{
				...baseInput,
				backgroundId: 'background-1',
				spellItems: [{ spellId: 'spell-1', name: 'Homebrew Light', isPrepared: true }]
			},
			{
				guidedCatalog,
				spellCatalog,
				featCatalog
			}
		);

		expect(result.profile.contentMode).toBe('custom');
		expect(result.reasonLines).toEqual([
			'Uses custom background: Sage Variant',
			'Uses custom spell: Homebrew Light'
		]);
	});

	it('preserves existing custom state when no new reasons are exposed on the current save', () => {
		const result = deriveManualCharacterContentProfile(baseInput, {
			guidedCatalog,
			spellCatalog,
			featCatalog,
			existingCharacter: {
				contentMode: 'custom',
				maxHp: 8,
				currentHp: 8,
				temporaryHp: 0,
				armorClass: 10,
				initiative: 0,
				speed: 30,
				hitDice: '1d8',
				spellItems: baseInput.spellItems
			}
		});

		expect(result.profile.contentMode).toBe('custom');
		expect(result.reasonLines).toEqual(['Existing custom draft retained']);
	});

	it('prepends a guided divergence reason when a guided-origin draft becomes custom', () => {
		const result = deriveManualCharacterContentProfile(
			{
				...baseInput,
				attackItems: [{ name: 'Custom Strike' }]
			},
			{
				guidedCatalog,
				spellCatalog,
				featCatalog,
				existingCharacter: {
					contentMode: 'canon',
					maxHp: 8,
					currentHp: 8,
					temporaryHp: 0,
					armorClass: 10,
					initiative: 0,
					speed: 30,
					hitDice: '1d8',
					spellItems: baseInput.spellItems,
					guidedOrigin: true
				}
			}
		);

		expect(result.profile.contentMode).toBe('custom');
		expect(result.reasonLines).toEqual([
			'Guided baseline diverged after manual edits',
			'Manual override: Attack Items'
		]);
	});

	it('retains guided divergence messaging when a guided-origin custom draft has no new visible reasons', () => {
		const result = deriveManualCharacterContentProfile(baseInput, {
			guidedCatalog,
			spellCatalog,
			featCatalog,
			existingCharacter: {
				contentMode: 'custom',
				maxHp: 8,
				currentHp: 8,
				temporaryHp: 0,
				armorClass: 10,
				initiative: 0,
				speed: 30,
				hitDice: '1d8',
				spellItems: baseInput.spellItems,
				guidedOrigin: true
			}
		});

		expect(result.profile.contentMode).toBe('custom');
		expect(result.reasonLines).toEqual(['Guided baseline diverged on an earlier manual edit']);
	});

	it('marks guided-origin drafts as custom when linked spell choices change', () => {
		const result = deriveManualCharacterContentProfile(
			{
				...baseInput,
				spellItems: [
					{
						spellId: 'spell-guided-1',
						name: 'Mage Hand',
						isPrepared: true
					},
					{
						spellId: 'spell-guided-3',
						name: 'Magic Missile',
						isPrepared: false
					}
				]
			},
			{
				guidedCatalog,
				spellCatalog,
				featCatalog,
				existingCharacter: {
					contentMode: 'canon',
					maxHp: 8,
					currentHp: 8,
					temporaryHp: 0,
					armorClass: 10,
					initiative: 0,
					speed: 30,
					hitDice: '1d8',
					spellItems: baseInput.spellItems,
					guidedOrigin: true
				}
			}
		);

		expect(result.profile.contentMode).toBe('custom');
		expect(result.reasonLines).toEqual([
			'Guided baseline diverged after manual edits',
			'Manual override: Guided Spell Items'
		]);
	});

	it('marks guided-origin drafts as custom when linked spell preparation changes', () => {
		const result = deriveManualCharacterContentProfile(
			{
				...baseInput,
				spellItems: [
					{
						spellId: 'spell-guided-1',
						name: 'Mage Hand',
						isPrepared: false
					},
					{
						spellId: 'spell-guided-2',
						name: 'Shield',
						isPrepared: false
					}
				]
			},
			{
				guidedCatalog,
				spellCatalog,
				featCatalog,
				existingCharacter: {
					contentMode: 'canon',
					maxHp: 8,
					currentHp: 8,
					temporaryHp: 0,
					armorClass: 10,
					initiative: 0,
					speed: 30,
					hitDice: '1d8',
					spellItems: baseInput.spellItems,
					guidedOrigin: true
				}
			}
		);

		expect(result.profile.contentMode).toBe('custom');
		expect(result.reasonLines).toEqual([
			'Guided baseline diverged after manual edits',
			'Manual override: Guided Spell Items'
		]);
	});
});
