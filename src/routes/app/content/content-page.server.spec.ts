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

const {
	createPrivateFeat,
	createPrivateSpell,
	createSharedFeat,
	createSharedSpell,
	deleteManagedSharedFeat,
	derivePrivateFeatFromSharedCatalog,
	derivePrivateSpellFromSharedCatalog,
	listManagedSharedFeats,
	listPrivateFeatsForUser,
	listPrivateSpellsForUser,
	retireManagedSharedFeat,
	updateManagedSharedFeat
} =
	vi.hoisted(() => ({
	createPrivateFeat: vi.fn(),
	createPrivateSpell: vi.fn(),
	createSharedFeat: vi.fn(),
	createSharedSpell: vi.fn(),
	deleteManagedSharedFeat: vi.fn(),
	derivePrivateFeatFromSharedCatalog: vi.fn(),
	derivePrivateSpellFromSharedCatalog: vi.fn(),
	listManagedSharedFeats: vi.fn(),
	listPrivateFeatsForUser: vi.fn(),
	listPrivateSpellsForUser: vi.fn(),
	retireManagedSharedFeat: vi.fn(),
	updateManagedSharedFeat: vi.fn()
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
	deleteManagedSharedFeat,
	derivePrivateFeatFromSharedCatalog,
	listManagedSharedFeats,
	listPrivateFeatsForUser,
	retireManagedSharedFeat,
	updateManagedSharedFeat
}));

vi.mock('$lib/server/repositories/private-spells', () => ({
	createPrivateSpell,
	createSharedSpell,
	derivePrivateSpellFromSharedCatalog,
	listPrivateSpellsForUser
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
		listPrivateSpellsForUser.mockReset().mockResolvedValue([]);
		listManagedSharedFeats.mockReset().mockResolvedValue([]);
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
			createdPrivateSpellName: null,
			derivedPrivateFeatName: null,
			derivedPrivateSpellName: null,
			publishedSharedFeatName: null,
			publishedSystemFeatName: null,
			publishedSharedSpellName: null,
			publishedSystemSpellName: null,
			updatedSharedFeatName: null,
			retiredSharedFeatName: null,
			deletedSharedFeatName: null,
			createPrivateFeatValues: {
				name: '',
				summary: '',
				description: '',
				prerequisitesText: ''
			},
			createPrivateSpellValues: {
				name: '',
				level: '',
				school: '',
				summary: '',
				description: '',
				castingTime: '',
				range: '',
				components: '',
				materials: '',
				duration: '',
				classSlugsText: '',
				concentration: false,
				ritual: false
			},
			editSharedFeatId: null,
			editSharedFeatValues: {
				name: '',
				summary: '',
				description: '',
				prerequisitesText: ''
			},
			roleOperations: {
				canPublishSharedFeats: false,
				canPublishSystemFeats: false,
				canPublishSharedSpells: false,
				canPublishSystemSpells: false,
				canMaintainSharedFeats: false,
				canMaintainSystemFeats: false
			},
			characterCatalog: {
				speciesOptions: [],
				subspeciesOptions: [],
				classOptions: [],
				subclassOptions: [],
				backgroundOptions: []
			},
			manageableSharedFeats: [],
			privateFeats: [],
			privateSpells: [],
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
		expect(listPrivateSpellsForUser).not.toHaveBeenCalled();
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
		const privateSpells = [
			{
				id: 'private-spell-1',
				sourceCode: 'user-private',
				slug: 'arc-light',
				name: 'Arc Light',
				level: 1,
				school: 'evocation',
				castingTime: '1 action',
				range: '60 feet',
				components: 'V, S, M',
				materials: 'A polished copper wire.',
				duration: 'Instantaneous',
				classSlugs: ['mago'],
				summary: 'Focused arcane flash.',
				description: null,
				derivation: null,
				concentration: false,
				ritual: false,
				createdAt: '2026-07-07T21:00:00.000Z',
				updatedAt: '2026-07-07T21:00:00.000Z'
			}
		];
		const manageableSharedFeats = [
			{
				id: 'shared-feat-1',
				ownerUserId: 'user-1',
				sourceCode: 'homebrew',
				slug: 'battle-lore',
				name: 'Battle Lore',
				prerequisites: ['level:4'],
				summary: 'Shared training doctrine.',
				description: null,
				visibility: 'shared' as const,
				isSystemContent: false,
				createdAt: '2026-07-08T09:15:00.000Z',
				updatedAt: '2026-07-08T09:15:00.000Z'
			}
		];

		listCharacterCreationCatalog.mockResolvedValueOnce(characterCatalog);
		listExpandedContentCatalog.mockResolvedValueOnce(sharedCatalog);
		listPrivateFeatsForUser.mockResolvedValueOnce(privateFeats);
		listPrivateSpellsForUser.mockResolvedValueOnce(privateSpells);
		listManagedSharedFeats.mockResolvedValueOnce(manageableSharedFeats);

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
					'http://localhost/app/content?createdPrivateFeat=Observant%20Echo&createdPrivateSpell=Arc%20Light&derivedPrivateFeat=Alert&derivedPrivateSpell=Magic%20Missile&publishedSharedFeat=Battle%20Lore&editSharedFeat=shared-feat-1&updatedSharedFeat=Battle%20Lore'
					+ '&publishedSharedSpell=Arc%20Light%20Nova&publishedSystemSpell=Solar%20Ward'
				)
			} as never)
		).resolves.toEqual({
			createdPrivateFeatName: 'Observant Echo',
			createdPrivateSpellName: 'Arc Light',
			derivedPrivateFeatName: 'Alert',
			derivedPrivateSpellName: 'Magic Missile',
			publishedSharedFeatName: 'Battle Lore',
			publishedSystemFeatName: null,
			publishedSharedSpellName: 'Arc Light Nova',
			publishedSystemSpellName: 'Solar Ward',
			updatedSharedFeatName: 'Battle Lore',
			retiredSharedFeatName: null,
			deletedSharedFeatName: null,
			createPrivateFeatValues: {
				name: '',
				summary: '',
				description: '',
				prerequisitesText: ''
			},
			createPrivateSpellValues: {
				name: '',
				level: '',
				school: '',
				summary: '',
				description: '',
				castingTime: '',
				range: '',
				components: '',
				materials: '',
				duration: '',
				classSlugsText: '',
				concentration: false,
				ritual: false
			},
			editSharedFeatId: 'shared-feat-1',
			editSharedFeatValues: {
				name: 'Battle Lore',
				summary: 'Shared training doctrine.',
				description: '',
				prerequisitesText: 'level:4'
			},
			roleOperations: {
				canPublishSharedFeats: true,
				canPublishSystemFeats: false,
				canPublishSharedSpells: true,
				canPublishSystemSpells: false,
				canMaintainSharedFeats: true,
				canMaintainSystemFeats: false
			},
			characterCatalog,
			manageableSharedFeats,
			privateFeats,
			privateSpells,
			sharedCatalog
		});

		expect(listCharacterCreationCatalog).toHaveBeenCalledOnce();
		expect(listCharacterCreationCatalog).toHaveBeenCalledWith(supabase);
		expect(listExpandedContentCatalog).toHaveBeenCalledOnce();
		expect(listExpandedContentCatalog).toHaveBeenCalledWith(supabase);
		expect(listPrivateFeatsForUser).toHaveBeenCalledOnce();
		expect(listPrivateFeatsForUser).toHaveBeenCalledWith(supabase, session.user.id);
		expect(listPrivateSpellsForUser).toHaveBeenCalledOnce();
		expect(listPrivateSpellsForUser).toHaveBeenCalledWith(supabase, session.user.id);
		expect(listManagedSharedFeats).toHaveBeenCalledOnce();
	});
});

describe('/app/content actions', () => {
	beforeEach(() => {
		createPrivateFeat.mockReset();
		createPrivateSpell.mockReset();
		createSharedFeat.mockReset();
		createSharedSpell.mockReset();
		deleteManagedSharedFeat.mockReset();
		derivePrivateFeatFromSharedCatalog.mockReset();
		derivePrivateSpellFromSharedCatalog.mockReset();
		listManagedSharedFeats.mockReset();
		retireManagedSharedFeat.mockReset();
		updateManagedSharedFeat.mockReset();
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

	it('returns field errors for invalid private spell input', async () => {
		const response = await actions.createPrivateSpell?.({
			locals: {
				session: {
					user: {
						id: 'user-1'
					}
				},
				supabase: {}
			},
			request: new Request('http://localhost/app/content?/createPrivateSpell', {
				method: 'POST',
				body: new URLSearchParams({
					name: 'Arc Light',
					level: '1',
					school: 'evocation',
					summary: '',
					description: '',
					castingTime: '',
					range: '',
					components: 'V, S',
					materials: 'A polished copper wire.',
					duration: '',
					classSlugsText: '',
					concentration: '',
					ritual: ''
				})
			})
		} as never);

		expect(response?.status).toBe(400);
		expect(response?.data.createPrivateSpellFormError).toBe(
			'Please correct the highlighted private spell fields.'
		);
		expect(response?.data.createPrivateSpellFieldErrors.materials?.[0]).toContain(
			'only allowed when spell components include M'
		);
		expect(createPrivateSpell).not.toHaveBeenCalled();
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

	it('creates a private spell for the current user', async () => {
		createPrivateSpell.mockResolvedValueOnce({
			id: 'private-spell-1',
			sourceCode: 'user-private',
			slug: 'arc-light',
			name: 'Arc Light',
			level: 1,
			school: 'evocation',
			castingTime: '1 action',
			range: '60 feet',
			components: 'V, S, M',
			materials: 'A polished copper wire.',
			duration: 'Instantaneous',
			classSlugs: ['mago'],
			summary: 'Focused arcane flash.',
			description: null,
			derivation: null,
			concentration: false,
			ritual: false,
			createdAt: '2026-07-07T21:00:00.000Z',
			updatedAt: '2026-07-07T21:00:00.000Z'
		});

		await expect(
			actions.createPrivateSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/createPrivateSpell', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Arc Light',
						level: '1',
						school: 'evocation',
						summary: 'Focused arcane flash.',
						description: '',
						castingTime: '1 action',
						range: '60 feet',
						components: 'V, S, M',
						materials: 'A polished copper wire.',
						duration: 'Instantaneous',
						classSlugsText: 'mago',
						concentration: '',
						ritual: ''
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?createdPrivateSpell=Arc%20Light'
		});

		expect(createPrivateSpell).toHaveBeenCalledWith({}, 'user-1', {
			slug: 'arc-light',
			name: 'Arc Light',
			level: 1,
			school: 'evocation',
			summary: 'Focused arcane flash.',
			description: undefined,
			castingTime: '1 action',
			range: '60 feet',
			components: 'V, S, M',
			materials: 'A polished copper wire.',
			duration: 'Instantaneous',
			classSlugs: ['mago'],
			concentration: false,
			ritual: false
		});
	});

	it('derives a private spell from a shared SRD spell', async () => {
		derivePrivateSpellFromSharedCatalog.mockResolvedValueOnce({
			id: 'private-spell-2',
			sourceCode: 'homebrew',
			slug: 'magic-missile',
			name: 'Magic Missile',
			level: 1,
			school: 'evocation',
			castingTime: '1 action',
			range: '120 feet',
			components: 'V, S',
			materials: null,
			duration: 'Instantaneous',
			classSlugs: ['mago'],
			summary: 'Darts of force.',
			description: null,
			derivation: {
				source: 'srd-5-1',
				contentType: 'spell',
				slug: 'magic-missile',
				name: 'Magic Missile'
			},
			concentration: false,
			ritual: false,
			createdAt: '2026-07-08T09:05:00.000Z',
			updatedAt: '2026-07-08T09:05:00.000Z'
		});

		await expect(
			actions.deriveSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/deriveSpell', {
					method: 'POST',
					body: new URLSearchParams({
						sharedSpellId: 'shared-spell-1'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?derivedPrivateSpell=Magic%20Missile'
		});

		expect(derivePrivateSpellFromSharedCatalog).toHaveBeenCalledWith({}, 'user-1', {
			sharedSpellId: 'shared-spell-1'
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

	it('publishes a shared spell for content editors', async () => {
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
		createSharedSpell.mockResolvedValueOnce({
			id: 'shared-spell-1',
			sourceCode: 'homebrew',
			slug: 'arc-light-nova',
			name: 'Arc Light Nova',
			level: 3,
			school: 'evocation',
			castingTime: '1 action',
			range: '90 feet',
			components: 'V, S, M',
			materials: 'A copper lens.',
			duration: 'Instantaneous',
			classSlugs: ['mago'],
			summary: 'Shared arcane detonation.',
			description: null,
			visibility: 'shared',
			isSystemContent: false,
			concentration: false,
			ritual: false,
			createdAt: '2026-07-08T10:15:00.000Z',
			updatedAt: '2026-07-08T10:15:00.000Z'
		});

		await expect(
			actions.publishSharedSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Arc Light Nova',
						level: '3',
						school: 'evocation',
						summary: 'Shared arcane detonation.',
						description: '',
						castingTime: '1 action',
						range: '90 feet',
						components: 'V, S, M',
						materials: 'A copper lens.',
						duration: 'Instantaneous',
						classSlugsText: 'mago',
						concentration: '',
						ritual: ''
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?publishedSharedSpell=Arc%20Light%20Nova'
		});

		expect(requirePermissionScopeAccess).toHaveBeenCalledWith(
			expect.objectContaining({ globalRole: 'content_editor' }),
			'shared_content'
		);
		expect(createSharedSpell).toHaveBeenCalledWith({}, 'user-1', {
			slug: 'arc-light-nova',
			name: 'Arc Light Nova',
			level: 3,
			school: 'evocation',
			summary: 'Shared arcane detonation.',
			description: undefined,
			castingTime: '1 action',
			range: '90 feet',
			components: 'V, S, M',
			materials: 'A copper lens.',
			duration: 'Instantaneous',
			classSlugs: ['mago'],
			concentration: false,
			ritual: false,
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

	it('publishes system spells only for admins', async () => {
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
		createSharedSpell.mockResolvedValueOnce({
			id: 'system-spell-1',
			sourceCode: 'homebrew',
			slug: 'solar-ward',
			name: 'Solar Ward',
			level: 4,
			school: 'abjuration',
			castingTime: '1 action',
			range: 'Self',
			components: 'V, S',
			materials: null,
			duration: '10 minutes',
			classSlugs: ['clerigo'],
			summary: 'System-governed radiant barrier.',
			description: null,
			visibility: 'public',
			isSystemContent: true,
			concentration: true,
			ritual: false,
			createdAt: '2026-07-08T10:20:00.000Z',
			updatedAt: '2026-07-08T10:20:00.000Z'
		});

		await expect(
			actions.publishSystemSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishSystemSpell', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Solar Ward',
						level: '4',
						school: 'abjuration',
						summary: 'System-governed radiant barrier.',
						description: '',
						castingTime: '1 action',
						range: 'Self',
						components: 'V, S',
						materials: '',
						duration: '10 minutes',
						classSlugsText: 'clerigo',
						concentration: 'on',
						ritual: ''
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?publishedSystemSpell=Solar%20Ward'
		});

		expect(requirePermissionScopeAccess).toHaveBeenCalledWith(
			expect.objectContaining({ globalRole: 'admin' }),
			'system_content'
		);
		expect(createSharedSpell).toHaveBeenCalledWith({}, 'user-1', {
			slug: 'solar-ward',
			name: 'Solar Ward',
			level: 4,
			school: 'abjuration',
			summary: 'System-governed radiant barrier.',
			description: undefined,
			castingTime: '1 action',
			range: 'Self',
			components: 'V, S',
			materials: undefined,
			duration: '10 minutes',
			classSlugs: ['clerigo'],
			concentration: true,
			ritual: false,
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

	it('blocks standard users from shared spell publishing', async () => {
		requirePermissionScopeAccess.mockImplementationOnce(() => {
			throw Object.assign(new Error('forbidden'), { status: 403 });
		});

		await expect(
			actions.publishSharedSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Arc Light Nova',
						level: '3',
						school: 'evocation'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 403
		});

		expect(createSharedSpell).not.toHaveBeenCalled();
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

	it('blocks content editors from system spell publishing', async () => {
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
			actions.publishSystemSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishSystemSpell', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Solar Ward',
						level: '4',
						school: 'abjuration'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 403
		});

		expect(createSharedSpell).not.toHaveBeenCalled();
	});

	it('updates a managed shared feat for content editors', async () => {
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
		updateManagedSharedFeat.mockResolvedValueOnce({
			id: 'shared-feat-1',
			ownerUserId: 'user-1',
			sourceCode: 'homebrew',
			slug: 'battle-lore-revised',
			name: 'Battle Lore Revised',
			prerequisites: ['level:8'],
			summary: 'Revised training doctrine.',
			description: null,
			visibility: 'shared',
			isSystemContent: false,
			createdAt: '2026-07-08T09:15:00.000Z',
			updatedAt: '2026-07-08T09:45:00.000Z'
		});

		await expect(
			actions.updateSharedFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/updateSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({
						featId: 'shared-feat-1',
						name: 'Battle Lore Revised',
						summary: 'Revised training doctrine.',
						description: '',
						prerequisitesText: 'level:8'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location:
				'/app/content?editSharedFeat=shared-feat-1&updatedSharedFeat=Battle%20Lore%20Revised'
		});

		expect(requirePermissionScopeAccess).toHaveBeenCalledWith(
			expect.objectContaining({ globalRole: 'content_editor' }),
			'shared_content'
		);
		expect(updateManagedSharedFeat).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'content_editor', userId: 'user-1' }),
			{
				featId: 'shared-feat-1',
				slug: 'battle-lore-revised',
				name: 'Battle Lore Revised',
				summary: 'Revised training doctrine.',
				description: undefined,
				prerequisites: ['level:8']
			}
		);
	});

	it('returns edit-form validation errors for invalid shared feat updates', async () => {
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

		const response = await actions.updateSharedFeat?.({
			locals: {
				session: {
					user: {
						id: 'user-1'
					}
				},
				supabase: {}
			},
			request: new Request('http://localhost/app/content?/updateSharedFeat', {
				method: 'POST',
				body: new URLSearchParams({
					featId: 'shared-feat-1',
					name: 'Battle Lore',
					summary: '',
					description: '',
					prerequisitesText: 'medium-armor proficiency'
				})
			})
		} as never);

		expect(response?.status).toBe(400);
		expect(response?.data.editSharedFeatId).toBe('shared-feat-1');
		expect(response?.data.editSharedFeatFormError).toBe(
			'Please correct the highlighted private feat fields.'
		);
		expect(response?.data.editSharedFeatFieldErrors.prerequisitesText?.[0]).toContain(
			'Use prerequisite format'
		);
		expect(updateManagedSharedFeat).not.toHaveBeenCalled();
	});

	it('blocks content editors from admin-only managed feat updates', async () => {
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
		updateManagedSharedFeat.mockRejectedValueOnce(
			Object.assign(new Error('forbidden'), { status: 403 })
		);

		await expect(
			actions.updateSharedFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/updateSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({
						featId: 'shared-feat-1',
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
	});

	it('retires a managed shared feat for content editors', async () => {
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
		retireManagedSharedFeat.mockResolvedValueOnce({
			id: 'shared-feat-1',
			name: 'Battle Lore'
		});

		await expect(
			actions.retireSharedFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/retireSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({
						featId: 'shared-feat-1'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?retiredSharedFeat=Battle%20Lore'
		});

		expect(retireManagedSharedFeat).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'content_editor', userId: 'user-1' }),
			'shared-feat-1'
		);
	});

	it('deletes a managed shared feat for admins', async () => {
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
		deleteManagedSharedFeat.mockResolvedValueOnce({
			id: 'system-feat-1',
			name: 'Warden Sigil'
		});

		await expect(
			actions.deleteSharedFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/deleteSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({
						featId: 'system-feat-1'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?deletedSharedFeat=Warden%20Sigil'
		});

		expect(deleteManagedSharedFeat).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'admin', userId: 'user-1' }),
			'system-feat-1'
		);
	});

	it('blocks content editors from admin-only lifecycle actions', async () => {
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
		retireManagedSharedFeat.mockRejectedValueOnce(
			Object.assign(new Error('forbidden'), { status: 403 })
		);

		await expect(
			actions.retireSharedFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/retireSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({
						featId: 'system-feat-1'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 403
		});
	});
});
