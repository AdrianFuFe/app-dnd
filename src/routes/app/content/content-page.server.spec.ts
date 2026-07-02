import { beforeEach, describe, expect, it, vi } from 'vitest';

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
			spells: [],
			feats: [],
			equipment: []
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
				spells: [],
				feats: [],
				equipment: []
			}
		});

		expect(listCharacterCreationCatalog).not.toHaveBeenCalled();
		expect(listExpandedContentCatalog).not.toHaveBeenCalled();
	});

	it('loads both character and shared catalog slices', async () => {
		const supabase = {};
		const characterCatalog = {
			speciesOptions: [
				{ id: 'species-1', slug: 'elfo', name: 'Elfo', summary: null, baseSpeed: 30 }
			],
			subspeciesOptions: [],
			classOptions: [
				{ id: 'class-1', slug: 'mago', name: 'Mago', summary: null, hitDie: 6 }
			],
			subclassOptions: [],
			backgroundOptions: [
				{ id: 'background-1', slug: 'acolyte', name: 'Acolyte', summary: null }
			]
		};
		const sharedCatalog = {
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
			]
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
