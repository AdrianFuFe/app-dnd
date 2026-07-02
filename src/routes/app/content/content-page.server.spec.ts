import { beforeEach, describe, expect, it, vi } from 'vitest';

const emptyMechanicSummary = {
	spellcastingAbilities: [],
	languageGrants: [],
	proficiencyGrants: [],
	proficiencyChoices: []
};

const { listCharacterCreationCatalog, listExpandedContentCatalog } = vi.hoisted(() => ({
	listCharacterCreationCatalog: vi.fn(),
	listExpandedContentCatalog: vi.fn()
}));

vi.mock('$lib/server/repositories/catalog', () => ({
	listCharacterCreationCatalog,
	listExpandedContentCatalog
}));

import { load } from './+page.server';

describe('/app/content load', () => {
	beforeEach(() => {
		listCharacterCreationCatalog.mockReset().mockResolvedValue({
			speciesOptions: [],
			subspeciesOptions: [],
			classOptions: [],
			subclassOptions: [],
			backgroundOptions: []
		});
		listExpandedContentCatalog.mockReset().mockResolvedValue({
			species: [],
			subspecies: [],
			classes: [],
			subclasses: [],
			backgrounds: [],
			spells: [],
			feats: [],
			equipment: [],
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
		});
	});

	it('returns empty catalog slices when Supabase is unavailable', async () => {
		await expect(
			load({
				locals: {
					supabase: null
				}
			} as never)
		).resolves.toEqual({
			characterCatalog: {
				speciesOptions: [],
				subspeciesOptions: [],
				classOptions: [],
				subclassOptions: [],
				backgroundOptions: []
			},
			sharedCatalog: {
				species: [],
				subspecies: [],
				classes: [],
				subclasses: [],
				backgrounds: [],
				spells: [],
				feats: [],
				equipment: [],
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
			}
		});

		expect(listCharacterCreationCatalog).not.toHaveBeenCalled();
		expect(listExpandedContentCatalog).not.toHaveBeenCalled();
	});

	it('loads both character and shared catalog slices', async () => {
		const supabase = {};
		const characterCatalog = {
			speciesOptions: [
				{
					id: 'species-1',
					slug: 'elfo',
					name: 'Elfo',
					summary: null,
					baseSpeed: 30,
					mechanicSummary: emptyMechanicSummary
				}
			],
			subspeciesOptions: [],
			classOptions: [
				{
					id: 'class-1',
					slug: 'mago',
					name: 'Mago',
					summary: null,
					hitDie: 6,
					mechanicSummary: emptyMechanicSummary
				}
			],
			subclassOptions: [],
			backgroundOptions: [
				{
					id: 'background-1',
					slug: 'acolyte',
					name: 'Acolyte',
					summary: null,
					mechanicSummary: emptyMechanicSummary
				}
			]
		};
		const sharedCatalog = {
			species: [
				{
					id: 'species-1',
					slug: 'elfo',
					name: 'Elfo',
					summary: null,
					baseSpeed: 30,
					mechanicSummary: emptyMechanicSummary
				}
			],
			subspecies: [],
			classes: [
				{
					id: 'class-1',
					slug: 'mago',
					name: 'Mago',
					summary: null,
					hitDie: 6,
					mechanicSummary: emptyMechanicSummary
				}
			],
			subclasses: [],
			backgrounds: [
				{
					id: 'background-1',
					slug: 'acolyte',
					name: 'Acolyte',
					summary: null,
					mechanicSummary: emptyMechanicSummary
				}
			],
			spells: [],
			feats: [],
			equipment: [
				{
					id: 'equipment-1',
					slug: 'staff',
					name: 'Staff',
					category: 'weapon',
					summary: null,
					description: null,
					weight: 4,
					value: '2 sp',
					damage: '1d6',
					damageType: 'bludgeoning',
					range: 'Melee',
					properties: [],
					isWeapon: true,
					isEquippable: true
				}
			],
			vocabularies: {
				abilities: [{ slug: 'strength', name: 'Strength' }],
				languages: [{ slug: 'comun', name: 'Comun' }],
				damageTypes: [{ slug: 'fire', name: 'Fire' }],
				spellSchools: [{ slug: 'evocation', name: 'Evocation' }],
				skillProficiencies: [
					{ slug: 'arcana', name: 'Arcana', proficiencyType: 'skill' as const }
				],
				armorProficiencies: [
					{
						slug: 'light-armor',
						name: 'Light Armor',
						proficiencyType: 'armor' as const
					}
				],
				weaponProficiencies: [
					{
						slug: 'simple-weapons',
						name: 'Simple Weapons',
						proficiencyType: 'weapon' as const
					}
				],
				toolProficiencies: [
					{
						slug: 'thieves-tools',
						name: 'Thieves Tools',
						proficiencyType: 'tool' as const
					}
				],
				savingThrowProficiencies: [
					{
						slug: 'wisdom',
						name: 'Wisdom',
						proficiencyType: 'saving_throw' as const
					}
				]
			}
		};

		listCharacterCreationCatalog.mockResolvedValueOnce(characterCatalog);
		listExpandedContentCatalog.mockResolvedValueOnce(sharedCatalog);

		await expect(
			load({
				locals: {
					supabase
				}
			} as never)
		).resolves.toEqual({
			characterCatalog,
			sharedCatalog
		});

		expect(listCharacterCreationCatalog).toHaveBeenCalledOnce();
		expect(listCharacterCreationCatalog).toHaveBeenCalledWith(supabase);
		expect(listExpandedContentCatalog).toHaveBeenCalledOnce();
		expect(listExpandedContentCatalog).toHaveBeenCalledWith(supabase);
	});
});
