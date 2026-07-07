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

const { createPrivateFeat, listPrivateFeatsForUser } = vi.hoisted(() => ({
	createPrivateFeat: vi.fn(),
	listPrivateFeatsForUser: vi.fn()
}));

const { getAuthorizationContext, requirePermissionScopeAccess } = vi.hoisted(() => ({
	getAuthorizationContext: vi.fn(),
	requirePermissionScopeAccess: vi.fn()
}));

vi.mock('$lib/server/repositories/catalog', () => ({
	listCharacterCreationCatalog,
	listExpandedContentCatalog
}));

vi.mock('$lib/server/repositories/private-feats', () => ({
	createPrivateFeat,
	listPrivateFeatsForUser
}));

vi.mock('$lib/server/permissions/authorization', () => ({
	getAuthorizationContext,
	requirePermissionScopeAccess
}));

import { actions, load } from './+page.server';

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
		listPrivateFeatsForUser.mockReset().mockResolvedValue([]);
	});

	it('returns empty catalog slices when Supabase is unavailable', async () => {
		await expect(
			load({
				locals: {
					supabase: null
				},
				url: new URL('http://localhost/app/content')
			} as never)
		).resolves.toEqual({
			createdPrivateFeatName: null,
			createPrivateFeatValues: {
				name: '',
				summary: '',
				description: '',
				prerequisitesText: ''
			},
			characterCatalog: {
				speciesOptions: [],
				subspeciesOptions: [],
				classOptions: [],
				subclassOptions: [],
				backgroundOptions: []
			},
			privateFeats: [],
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
		expect(listPrivateFeatsForUser).not.toHaveBeenCalled();
	});

	it('loads both shared and private content slices', async () => {
		const supabase = {};
		const session = {
			user: {
				id: 'user-1'
			}
		};
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
		const privateFeats = [
			{
				id: 'private-feat-1',
				slug: 'observant-echo',
				name: 'Observant Echo',
				prerequisites: ['level:4'],
				summary: 'Sharper pattern recall.',
				description: null,
				createdAt: '2026-07-07T20:00:00.000Z',
				updatedAt: '2026-07-07T20:00:00.000Z'
			}
		];

		listCharacterCreationCatalog.mockResolvedValueOnce(characterCatalog);
		listExpandedContentCatalog.mockResolvedValueOnce(sharedCatalog);
		listPrivateFeatsForUser.mockResolvedValueOnce(privateFeats);

		await expect(
			load({
				locals: {
					supabase
				},
				parent: async () => ({ session }),
				url: new URL('http://localhost/app/content?createdPrivateFeat=Observant%20Echo')
			} as never)
		).resolves.toEqual({
			createdPrivateFeatName: 'Observant Echo',
			createPrivateFeatValues: {
				name: '',
				summary: '',
				description: '',
				prerequisitesText: ''
			},
			characterCatalog,
			privateFeats,
			sharedCatalog
		});

		expect(listCharacterCreationCatalog).toHaveBeenCalledOnce();
		expect(listCharacterCreationCatalog).toHaveBeenCalledWith(supabase);
		expect(listExpandedContentCatalog).toHaveBeenCalledOnce();
		expect(listExpandedContentCatalog).toHaveBeenCalledWith(supabase);
		expect(listPrivateFeatsForUser).toHaveBeenCalledOnce();
		expect(listPrivateFeatsForUser).toHaveBeenCalledWith(supabase, session.user.id);
	});
});

describe('/app/content actions', () => {
	beforeEach(() => {
		createPrivateFeat.mockReset();
		getAuthorizationContext.mockReset().mockResolvedValue({
			userId: 'user-1',
			globalRole: 'user',
			capabilities: ['manage_private_content']
		});
		requirePermissionScopeAccess.mockReset().mockImplementation((context) => context);
	});

	it('returns field errors for invalid private feat input', async () => {
		const response = await actions.default?.({
			locals: {
				session: {
					user: {
						id: 'user-1'
					}
				},
				supabase: {}
			},
			request: new Request('http://localhost/app/content', {
				method: 'POST',
				body: new URLSearchParams({
					name: 'Bad Feat',
					summary: '',
					description: '',
					prerequisitesText: 'medium-armor proficiency'
				})
			})
		} as never);

		expect(response?.status).toBe(400);
		expect(response?.data.createPrivateFeatFormError).toBe(
			'Please correct the highlighted private feat fields.'
		);
		expect(response?.data.createPrivateFeatFieldErrors.prerequisitesText?.[0]).toContain(
			'Use prerequisite format'
		);
		expect(createPrivateFeat).not.toHaveBeenCalled();
	});

	it('creates a private feat for the current user', async () => {
		createPrivateFeat.mockResolvedValueOnce({
			id: 'private-feat-1',
			slug: 'observant-echo',
			name: 'Observant Echo',
			prerequisites: ['level:4'],
			summary: 'Sharper pattern recall.',
			description: null,
			createdAt: '2026-07-07T20:00:00.000Z',
			updatedAt: '2026-07-07T20:00:00.000Z'
		});

		await expect(
			actions.default?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Observant Echo',
						summary: 'Sharper pattern recall.',
						description: '',
						prerequisitesText: 'level:4'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?createdPrivateFeat=Observant%20Echo'
		});

		expect(getAuthorizationContext).toHaveBeenCalledOnce();
		expect(requirePermissionScopeAccess).toHaveBeenCalledOnce();
		expect(createPrivateFeat).toHaveBeenCalledWith({}, 'user-1', {
			slug: 'observant-echo',
			name: 'Observant Echo',
			summary: 'Sharper pattern recall.',
			description: undefined,
			prerequisites: ['level:4']
		});
	});
});
