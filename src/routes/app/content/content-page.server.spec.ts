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

const { createPrivateFeat, createSharedFeat, derivePrivateFeatFromSharedCatalog, listPrivateFeatsForUser } =
	vi.hoisted(() => ({
	createPrivateFeat: vi.fn(),
	createSharedFeat: vi.fn(),
	derivePrivateFeatFromSharedCatalog: vi.fn(),
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
	createSharedFeat,
	derivePrivateFeatFromSharedCatalog,
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
			derivedPrivateFeatName: null,
			publishedSharedFeatName: null,
			publishedSystemFeatName: null,
			createPrivateFeatValues: {
				name: '',
				summary: '',
				description: '',
				prerequisitesText: ''
			},
			roleOperations: {
				canPublishSharedFeats: false,
				canPublishSystemFeats: false
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
				sourceCode: 'user-private',
				slug: 'observant-echo',
				name: 'Observant Echo',
				prerequisites: ['level:4'],
				summary: 'Sharper pattern recall.',
				description: null,
				derivation: null,
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
				parent: async () => ({
					session,
					authorization: {
						userId: 'user-1',
						globalRole: 'content_editor',
						capabilities: ['read_shared_catalog', 'manage_private_content', 'edit_shared_content']
					}
				}),
				url: new URL(
					'http://localhost/app/content?createdPrivateFeat=Observant%20Echo&derivedPrivateFeat=Alert&publishedSharedFeat=Battle%20Lore'
				)
			} as never)
		).resolves.toEqual({
			createdPrivateFeatName: 'Observant Echo',
			derivedPrivateFeatName: 'Alert',
			publishedSharedFeatName: 'Battle Lore',
			publishedSystemFeatName: null,
			createPrivateFeatValues: {
				name: '',
				summary: '',
				description: '',
				prerequisitesText: ''
			},
			roleOperations: {
				canPublishSharedFeats: true,
				canPublishSystemFeats: false
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
		createSharedFeat.mockReset();
		derivePrivateFeatFromSharedCatalog.mockReset();
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
			sourceCode: 'user-private',
			slug: 'observant-echo',
			name: 'Observant Echo',
			prerequisites: ['level:4'],
			summary: 'Sharper pattern recall.',
			description: null,
			derivation: null,
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

	it('derives a private feat from a shared SRD feat', async () => {
		derivePrivateFeatFromSharedCatalog.mockResolvedValueOnce({
			id: 'private-feat-2',
			sourceCode: 'homebrew',
			slug: 'alert',
			name: 'Alert',
			prerequisites: [],
			summary: 'Always ready.',
			description: null,
			derivation: {
				source: 'srd-5-1',
				contentType: 'feat',
				slug: 'alert',
				name: 'Alert'
			},
			createdAt: '2026-07-08T09:00:00.000Z',
			updatedAt: '2026-07-08T09:00:00.000Z'
		});

		await expect(
			actions.deriveFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/deriveFeat', {
					method: 'POST',
					body: new URLSearchParams({
						sharedFeatId: 'shared-feat-1'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?derivedPrivateFeat=Alert'
		});

		expect(derivePrivateFeatFromSharedCatalog).toHaveBeenCalledWith({}, 'user-1', {
			sharedFeatId: 'shared-feat-1'
		});
	});

	it('publishes a shared feat for content editors', async () => {
		getAuthorizationContext.mockResolvedValueOnce({
			userId: 'user-1',
			globalRole: 'content_editor',
			capabilities: [
				'read_shared_catalog',
				'manage_own_characters',
				'manage_private_content',
				'edit_shared_content'
			]
		});
		createSharedFeat.mockResolvedValueOnce({
			id: 'shared-feat-1',
			sourceCode: 'homebrew',
			slug: 'battle-lore',
			name: 'Battle Lore',
			prerequisites: ['level:4'],
			summary: 'Shared training doctrine.',
			description: null,
			visibility: 'shared',
			isSystemContent: false,
			createdAt: '2026-07-08T09:15:00.000Z',
			updatedAt: '2026-07-08T09:15:00.000Z'
		});

		await expect(
			actions.publishSharedFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Battle Lore',
						summary: 'Shared training doctrine.',
						description: '',
						prerequisitesText: 'level:4'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?publishedSharedFeat=Battle%20Lore'
		});

		expect(requirePermissionScopeAccess).toHaveBeenCalledWith(
			expect.objectContaining({ globalRole: 'content_editor' }),
			'shared_content'
		);
		expect(createSharedFeat).toHaveBeenCalledWith({}, 'user-1', {
			slug: 'battle-lore',
			name: 'Battle Lore',
			summary: 'Shared training doctrine.',
			description: undefined,
			prerequisites: ['level:4'],
			visibility: 'shared',
			isSystemContent: false
		});
	});

	it('publishes system content only for admins', async () => {
		getAuthorizationContext.mockResolvedValueOnce({
			userId: 'user-1',
			globalRole: 'admin',
			capabilities: [
				'read_shared_catalog',
				'manage_own_characters',
				'manage_private_content',
				'edit_shared_content',
				'manage_system_content',
				'manage_users_and_roles'
			]
		});
		createSharedFeat.mockResolvedValueOnce({
			id: 'system-feat-1',
			sourceCode: 'homebrew',
			slug: 'warden-sigil',
			name: 'Warden Sigil',
			prerequisites: [],
			summary: 'System-governed feat.',
			description: null,
			visibility: 'public',
			isSystemContent: true,
			createdAt: '2026-07-08T09:20:00.000Z',
			updatedAt: '2026-07-08T09:20:00.000Z'
		});

		await expect(
			actions.publishSystemFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishSystemFeat', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Warden Sigil',
						summary: 'System-governed feat.',
						description: '',
						prerequisitesText: ''
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?publishedSystemFeat=Warden%20Sigil'
		});

		expect(requirePermissionScopeAccess).toHaveBeenCalledWith(
			expect.objectContaining({ globalRole: 'admin' }),
			'system_content'
		);
		expect(createSharedFeat).toHaveBeenCalledWith({}, 'user-1', {
			slug: 'warden-sigil',
			name: 'Warden Sigil',
			summary: 'System-governed feat.',
			description: undefined,
			prerequisites: [],
			visibility: 'public',
			isSystemContent: true
		});
	});

	it('blocks standard users from shared publishing', async () => {
		requirePermissionScopeAccess.mockImplementationOnce(() => {
			throw Object.assign(new Error('forbidden'), { status: 403 });
		});

		await expect(
			actions.publishSharedFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Battle Lore',
						summary: 'Shared training doctrine.',
						description: '',
						prerequisitesText: 'level:4'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 403
		});

		expect(createSharedFeat).not.toHaveBeenCalled();
	});

	it('blocks content editors from system publishing', async () => {
		getAuthorizationContext.mockResolvedValueOnce({
			userId: 'user-1',
			globalRole: 'content_editor',
			capabilities: [
				'read_shared_catalog',
				'manage_own_characters',
				'manage_private_content',
				'edit_shared_content'
			]
		});
		requirePermissionScopeAccess.mockImplementationOnce(() => {
			throw Object.assign(new Error('forbidden'), { status: 403 });
		});

		await expect(
			actions.publishSystemFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishSystemFeat', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Warden Sigil',
						summary: 'System-governed feat.',
						description: '',
						prerequisitesText: ''
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 403
		});

		expect(createSharedFeat).not.toHaveBeenCalled();
	});
});
