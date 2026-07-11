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
	deleteManagedSharedSpell,
	derivePrivateFeatFromSharedCatalog,
	derivePrivateSpellFromSharedCatalog,
	listManagedSharedFeats,
	listManagedSharedSpells,
	listReviewableSharedFeats,
	listReviewableSharedSpells,
	listPrivateFeatsForUser,
	listPrivateSpellsForUser,
	publishReviewableSharedFeat,
	publishReviewableSharedSpell,
	retireManagedSharedFeat,
	retireManagedSharedSpell,
	returnReviewableSharedFeatToPrivate,
	returnReviewableSharedSpellToPrivate,
	updateManagedSharedSpell,
	updateManagedSharedFeat
} = vi.hoisted(() => ({
	createPrivateFeat: vi.fn(),
	createPrivateSpell: vi.fn(),
	createSharedFeat: vi.fn(),
	createSharedSpell: vi.fn(),
	deleteManagedSharedFeat: vi.fn(),
	deleteManagedSharedSpell: vi.fn(),
	derivePrivateFeatFromSharedCatalog: vi.fn(),
	derivePrivateSpellFromSharedCatalog: vi.fn(),
	listManagedSharedFeats: vi.fn(),
	listManagedSharedSpells: vi.fn(),
	listReviewableSharedFeats: vi.fn(),
	listReviewableSharedSpells: vi.fn(),
	listPrivateFeatsForUser: vi.fn(),
	listPrivateSpellsForUser: vi.fn(),
	publishReviewableSharedFeat: vi.fn(),
	publishReviewableSharedSpell: vi.fn(),
	retireManagedSharedFeat: vi.fn(),
	retireManagedSharedSpell: vi.fn(),
	returnReviewableSharedFeatToPrivate: vi.fn(),
	returnReviewableSharedSpellToPrivate: vi.fn(),
	updateManagedSharedSpell: vi.fn(),
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
	listReviewableSharedFeats,
	publishReviewableSharedFeat,
	retireManagedSharedFeat,
	returnReviewableSharedFeatToPrivate,
	updateManagedSharedFeat
}));

vi.mock('$lib/server/repositories/private-spells', () => ({
	createPrivateSpell,
	createSharedSpell,
	deleteManagedSharedSpell,
	derivePrivateSpellFromSharedCatalog,
	listManagedSharedSpells,
	listPrivateSpellsForUser,
	listReviewableSharedSpells,
	publishReviewableSharedSpell,
	retireManagedSharedSpell,
	returnReviewableSharedSpellToPrivate,
	updateManagedSharedSpell
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
		listManagedSharedSpells.mockReset().mockResolvedValue([]);
		listReviewableSharedFeats.mockReset().mockResolvedValue([]);
		listReviewableSharedSpells.mockReset().mockResolvedValue([]);
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
			submittedSharedFeatName: null,
			submittedSharedSpellName: null,
			publishedSharedFeatName: null,
			publishedSystemFeatName: null,
			returnedSharedFeatName: null,
			publishedSharedSpellName: null,
			publishedSystemSpellName: null,
			returnedSharedSpellName: null,
			updatedSharedFeatName: null,
			updatedSharedSpellName: null,
			retiredSharedFeatName: null,
			deletedSharedFeatName: null,
			retiredSharedSpellName: null,
			deletedSharedSpellName: null,
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
			editSharedSpellId: null,
			editSharedSpellValues: {
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
			roleOperations: {
				canSubmitSharedFeats: false,
				canSubmitSharedSpells: false,
				canReviewSharedFeats: false,
				canReviewSharedSpells: false,
				canPublishSharedFeats: false,
				canPublishSystemFeats: false,
				canPublishSharedSpells: false,
				canPublishSystemSpells: false,
				canMaintainSharedFeats: false,
				canMaintainSystemFeats: false,
				canMaintainSharedSpells: false,
				canMaintainSystemSpells: false
			},
			characterCatalog: {
				speciesOptions: [],
				subspeciesOptions: [],
				classOptions: [],
				subclassOptions: [],
				backgroundOptions: []
			},
			manageableSharedFeats: [],
			manageableSharedSpells: [],
			reviewableSharedFeats: [],
			reviewableSharedSpells: [],
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
		const manageableSharedSpells = [
			{
				id: 'shared-spell-1',
				ownerUserId: 'user-1',
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
				visibility: 'shared' as const,
				isSystemContent: false,
				concentration: false,
				ritual: false,
				createdAt: '2026-07-08T10:15:00.000Z',
				updatedAt: '2026-07-08T10:15:00.000Z'
			}
		];
		const reviewableSharedFeats = [
			{
				id: 'review-feat-1',
				ownerUserId: 'user-2',
				sourceCode: 'homebrew',
				contentMode: 'custom' as const,
				editorialStatus: 'in_review' as const,
				slug: 'pending-lore',
				name: 'Pending Lore',
				prerequisites: [],
				summary: 'Awaiting review.',
				description: null,
				visibility: 'shared' as const,
				isSystemContent: false,
				createdAt: '2026-07-08T08:15:00.000Z',
				updatedAt: '2026-07-08T08:15:00.000Z'
			}
		];
		const reviewableSharedSpells = [
			{
				id: 'review-spell-1',
				ownerUserId: 'user-2',
				sourceCode: 'homebrew',
				contentMode: 'custom' as const,
				editorialStatus: 'in_review' as const,
				slug: 'pending-sigil',
				name: 'Pending Sigil',
				level: 2,
				school: 'abjuration',
				castingTime: '1 action',
				range: '30 feet',
				components: 'V, S',
				materials: null,
				duration: '1 minute',
				classSlugs: ['clerigo'],
				summary: 'Awaiting review.',
				description: null,
				visibility: 'shared' as const,
				isSystemContent: false,
				concentration: true,
				ritual: false,
				createdAt: '2026-07-08T08:30:00.000Z',
				updatedAt: '2026-07-08T08:30:00.000Z'
			}
		];

		listCharacterCreationCatalog.mockResolvedValueOnce(characterCatalog);
		listExpandedContentCatalog.mockResolvedValueOnce(sharedCatalog);
		listPrivateFeatsForUser.mockResolvedValueOnce(privateFeats);
		listPrivateSpellsForUser.mockResolvedValueOnce(privateSpells);
		listManagedSharedFeats.mockResolvedValueOnce(manageableSharedFeats);
		listManagedSharedSpells.mockResolvedValueOnce(manageableSharedSpells);
		listReviewableSharedFeats.mockResolvedValueOnce(reviewableSharedFeats);
		listReviewableSharedSpells.mockResolvedValueOnce(reviewableSharedSpells);

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
						capabilities: [
							'read_shared_catalog',
							'manage_private_content',
							'edit_shared_content'
						]
					}
				}),
				url: new URL(
					'http://localhost/app/content?createdPrivateFeat=Observant%20Echo&createdPrivateSpell=Arc%20Light&derivedPrivateFeat=Alert&derivedPrivateSpell=Magic%20Missile&submittedSharedFeat=Pending%20Lore&publishedSharedFeat=Battle%20Lore&editSharedFeat=shared-feat-1&updatedSharedFeat=Battle%20Lore' +
						'&submittedSharedSpell=Pending%20Sigil&publishedSharedSpell=Arc%20Light%20Nova&publishedSystemSpell=Solar%20Ward&editSharedSpell=shared-spell-1&updatedSharedSpell=Arc%20Light%20Nova&retiredSharedSpell=Old%20Ward&deletedSharedSpell=Lost%20Sigil'
				)
			} as never)
		).resolves.toEqual({
			createdPrivateFeatName: 'Observant Echo',
			createdPrivateSpellName: 'Arc Light',
			derivedPrivateFeatName: 'Alert',
			derivedPrivateSpellName: 'Magic Missile',
			submittedSharedFeatName: 'Pending Lore',
			submittedSharedSpellName: 'Pending Sigil',
			publishedSharedFeatName: 'Battle Lore',
			publishedSystemFeatName: null,
			returnedSharedFeatName: null,
			publishedSharedSpellName: 'Arc Light Nova',
			publishedSystemSpellName: 'Solar Ward',
			returnedSharedSpellName: null,
			updatedSharedFeatName: 'Battle Lore',
			updatedSharedSpellName: 'Arc Light Nova',
			retiredSharedFeatName: null,
			deletedSharedFeatName: null,
			retiredSharedSpellName: 'Old Ward',
			deletedSharedSpellName: 'Lost Sigil',
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
			editSharedSpellId: 'shared-spell-1',
			editSharedSpellValues: {
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
				concentration: false,
				ritual: false
			},
			roleOperations: {
				canSubmitSharedFeats: true,
				canSubmitSharedSpells: true,
				canReviewSharedFeats: true,
				canReviewSharedSpells: true,
				canPublishSharedFeats: true,
				canPublishSystemFeats: false,
				canPublishSharedSpells: true,
				canPublishSystemSpells: false,
				canMaintainSharedFeats: true,
				canMaintainSystemFeats: false,
				canMaintainSharedSpells: true,
				canMaintainSystemSpells: false
			},
			characterCatalog,
			manageableSharedFeats,
			manageableSharedSpells,
			reviewableSharedFeats,
			reviewableSharedSpells,
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
		expect(listManagedSharedSpells).toHaveBeenCalledOnce();
		expect(listReviewableSharedFeats).toHaveBeenCalledOnce();
		expect(listReviewableSharedSpells).toHaveBeenCalledOnce();
	});
});

describe('/app/content actions', () => {
	beforeEach(() => {
		createPrivateFeat.mockReset();
		createPrivateSpell.mockReset();
		createSharedFeat.mockReset();
		createSharedSpell.mockReset();
		deleteManagedSharedFeat.mockReset();
		deleteManagedSharedSpell.mockReset();
		derivePrivateFeatFromSharedCatalog.mockReset();
		derivePrivateSpellFromSharedCatalog.mockReset();
		listManagedSharedFeats.mockReset();
		listManagedSharedSpells.mockReset();
		listReviewableSharedFeats.mockReset();
		listReviewableSharedSpells.mockReset();
		publishReviewableSharedFeat.mockReset();
		publishReviewableSharedSpell.mockReset();
		retireManagedSharedFeat.mockReset();
		retireManagedSharedSpell.mockReset();
		returnReviewableSharedFeatToPrivate.mockReset();
		returnReviewableSharedSpellToPrivate.mockReset();
		updateManagedSharedSpell.mockReset();
		updateManagedSharedFeat.mockReset();
		getAuthorizationContext.mockReset().mockResolvedValue({
			userId: 'user-1',
			globalRole: 'user',
			capabilities: ['manage_private_content']
		});
		requirePermissionScopeAccess.mockReset().mockImplementation((context) => context);
	});

	it('returns field errors for invalid private feat input', async () => {
		const response = await actions.createPrivateFeat?.({
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
			actions.createPrivateFeat?.({
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

	it('submits a shared feat into editorial review for standard users', async () => {
		createSharedFeat.mockResolvedValueOnce({
			id: 'review-feat-1',
			sourceCode: 'homebrew',
			contentMode: 'custom',
			editorialStatus: 'in_review',
			slug: 'pending-lore',
			name: 'Pending Lore',
			prerequisites: ['level:4'],
			summary: 'Awaiting review.',
			description: null,
			visibility: 'shared',
			isSystemContent: false,
			createdAt: '2026-07-09T09:00:00.000Z',
			updatedAt: '2026-07-09T09:00:00.000Z'
		});

		await expect(
			actions.submitSharedFeat?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/submitSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Pending Lore',
						summary: 'Awaiting review.',
						description: '',
						prerequisitesText: 'level:4'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?submittedSharedFeat=Pending%20Lore'
		});

		expect(requirePermissionScopeAccess).toHaveBeenCalledWith(
			expect.objectContaining({ globalRole: 'user' }),
			'private_content'
		);
		expect(createSharedFeat).toHaveBeenCalledWith({}, 'user-1', {
			slug: 'pending-lore',
			name: 'Pending Lore',
			summary: 'Awaiting review.',
			description: undefined,
			prerequisites: ['level:4'],
			visibility: 'shared',
			isSystemContent: false,
			editorialStatus: 'in_review'
		});
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

	it('submits a shared spell into editorial review for standard users', async () => {
		createSharedSpell.mockResolvedValueOnce({
			id: 'review-spell-1',
			sourceCode: 'homebrew',
			contentMode: 'custom',
			editorialStatus: 'in_review',
			slug: 'pending-sigil',
			name: 'Pending Sigil',
			level: 2,
			school: 'abjuration',
			castingTime: '1 action',
			range: '30 feet',
			components: 'V, S',
			materials: null,
			duration: '1 minute',
			classSlugs: ['clerigo'],
			summary: 'Awaiting review.',
			description: null,
			visibility: 'shared',
			isSystemContent: false,
			concentration: true,
			ritual: false,
			createdAt: '2026-07-09T09:05:00.000Z',
			updatedAt: '2026-07-09T09:05:00.000Z'
		});

		await expect(
			actions.submitSharedSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/submitSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({
						name: 'Pending Sigil',
						level: '2',
						school: 'abjuration',
						summary: 'Awaiting review.',
						description: '',
						castingTime: '1 action',
						range: '30 feet',
						components: 'V, S',
						materials: '',
						duration: '1 minute',
						classSlugsText: 'clerigo',
						concentration: 'on',
						ritual: ''
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?submittedSharedSpell=Pending%20Sigil'
		});

		expect(requirePermissionScopeAccess).toHaveBeenCalledWith(
			expect.objectContaining({ globalRole: 'user' }),
			'private_content'
		);
		expect(createSharedSpell).toHaveBeenCalledWith({}, 'user-1', {
			slug: 'pending-sigil',
			name: 'Pending Sigil',
			level: 2,
			school: 'abjuration',
			summary: 'Awaiting review.',
			description: undefined,
			castingTime: '1 action',
			range: '30 feet',
			components: 'V, S',
			materials: undefined,
			duration: '1 minute',
			classSlugs: ['clerigo'],
			concentration: true,
			ritual: false,
			visibility: 'shared',
			isSystemContent: false,
			editorialStatus: 'in_review'
		});
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

	it('publishes a reviewed shared feat for editors', async () => {
		getAuthorizationContext.mockResolvedValueOnce({
			userId: 'user-1',
			globalRole: 'content_editor',
			capabilities: ['manage_private_content', 'edit_shared_content']
		});
		publishReviewableSharedFeat.mockResolvedValueOnce({
			id: 'review-feat-1',
			ownerUserId: 'user-2',
			sourceCode: 'homebrew',
			contentMode: 'custom',
			editorialStatus: 'published',
			slug: 'pending-lore',
			name: 'Pending Lore',
			prerequisites: ['level:4'],
			summary: 'Approved.',
			description: null,
			visibility: 'shared',
			isSystemContent: false,
			createdAt: '2026-07-09T09:00:00.000Z',
			updatedAt: '2026-07-09T09:10:00.000Z'
		});

		await expect(
			actions.publishReviewedSharedFeat?.({
				locals: {
					session: { user: { id: 'user-1' } },
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishReviewedSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({ featId: 'review-feat-1' })
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?publishedSharedFeat=Pending%20Lore'
		});

		expect(publishReviewableSharedFeat).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'content_editor', userId: 'user-1' }),
			'review-feat-1'
		);
	});

	it('publishes a reviewed shared spell for editors', async () => {
		getAuthorizationContext.mockResolvedValueOnce({
			userId: 'user-1',
			globalRole: 'content_editor',
			capabilities: ['manage_private_content', 'edit_shared_content']
		});
		publishReviewableSharedSpell.mockResolvedValueOnce({
			id: 'review-spell-1',
			ownerUserId: 'user-2',
			sourceCode: 'homebrew',
			contentMode: 'custom',
			editorialStatus: 'published',
			slug: 'pending-sigil',
			name: 'Pending Sigil',
			level: 2,
			school: 'abjuration',
			castingTime: '1 action',
			range: '30 feet',
			components: 'V, S',
			materials: null,
			duration: '1 minute',
			classSlugs: ['clerigo'],
			summary: 'Approved.',
			description: null,
			visibility: 'shared',
			isSystemContent: false,
			concentration: true,
			ritual: false,
			createdAt: '2026-07-09T09:05:00.000Z',
			updatedAt: '2026-07-09T09:15:00.000Z'
		});

		await expect(
			actions.publishReviewedSharedSpell?.({
				locals: {
					session: { user: { id: 'user-1' } },
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/publishReviewedSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({ spellId: 'review-spell-1' })
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?publishedSharedSpell=Pending%20Sigil'
		});

		expect(publishReviewableSharedSpell).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'content_editor', userId: 'user-1' }),
			'review-spell-1'
		);
	});

	it('returns a reviewed shared feat to private draft for editors', async () => {
		getAuthorizationContext.mockResolvedValueOnce({
			userId: 'user-1',
			globalRole: 'content_editor',
			capabilities: ['manage_private_content', 'edit_shared_content']
		});
		returnReviewableSharedFeatToPrivate.mockResolvedValueOnce({
			id: 'review-feat-1',
			name: 'Pending Lore'
		});

		await expect(
			actions.returnReviewedSharedFeat?.({
				locals: {
					session: { user: { id: 'user-1' } },
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/returnReviewedSharedFeat', {
					method: 'POST',
					body: new URLSearchParams({ featId: 'review-feat-1' })
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?returnedSharedFeat=Pending%20Lore'
		});

		expect(returnReviewableSharedFeatToPrivate).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'content_editor', userId: 'user-1' }),
			'review-feat-1'
		);
	});

	it('returns a reviewed shared spell to private draft for editors', async () => {
		getAuthorizationContext.mockResolvedValueOnce({
			userId: 'user-1',
			globalRole: 'content_editor',
			capabilities: ['manage_private_content', 'edit_shared_content']
		});
		returnReviewableSharedSpellToPrivate.mockResolvedValueOnce({
			id: 'review-spell-1',
			name: 'Pending Sigil'
		});

		await expect(
			actions.returnReviewedSharedSpell?.({
				locals: {
					session: { user: { id: 'user-1' } },
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/returnReviewedSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({ spellId: 'review-spell-1' })
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?returnedSharedSpell=Pending%20Sigil'
		});

		expect(returnReviewableSharedSpellToPrivate).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'content_editor', userId: 'user-1' }),
			'review-spell-1'
		);
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

	it('updates a managed shared spell for content editors', async () => {
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
		updateManagedSharedSpell.mockResolvedValueOnce({
			id: 'shared-spell-1',
			ownerUserId: 'user-1',
			sourceCode: 'homebrew',
			slug: 'arc-light-supernova',
			name: 'Arc Light Supernova',
			level: 4,
			school: 'evocation',
			castingTime: '1 action',
			range: '120 feet',
			components: 'V, S, M',
			materials: 'A copper lens.',
			duration: 'Instantaneous',
			classSlugs: ['mago'],
			summary: 'Revised arcane detonation.',
			description: null,
			visibility: 'shared',
			isSystemContent: false,
			concentration: false,
			ritual: false,
			createdAt: '2026-07-08T10:15:00.000Z',
			updatedAt: '2026-07-08T10:45:00.000Z'
		});

		await expect(
			actions.updateSharedSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/updateSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({
						spellId: 'shared-spell-1',
						name: 'Arc Light Supernova',
						level: '4',
						school: 'evocation',
						summary: 'Revised arcane detonation.',
						description: '',
						castingTime: '1 action',
						range: '120 feet',
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
			location:
				'/app/content?editSharedSpell=shared-spell-1&updatedSharedSpell=Arc%20Light%20Supernova'
		});

		expect(requirePermissionScopeAccess).toHaveBeenCalledWith(
			expect.objectContaining({ globalRole: 'content_editor' }),
			'shared_content'
		);
		expect(updateManagedSharedSpell).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'content_editor', userId: 'user-1' }),
			{
				spellId: 'shared-spell-1',
				slug: 'arc-light-supernova',
				name: 'Arc Light Supernova',
				level: 4,
				school: 'evocation',
				summary: 'Revised arcane detonation.',
				description: undefined,
				castingTime: '1 action',
				range: '120 feet',
				components: 'V, S, M',
				materials: 'A copper lens.',
				duration: 'Instantaneous',
				classSlugs: ['mago'],
				concentration: false,
				ritual: false
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

	it('returns edit-form validation errors for invalid shared spell updates', async () => {
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

		const response = await actions.updateSharedSpell?.({
			locals: {
				session: {
					user: {
						id: 'user-1'
					}
				},
				supabase: {}
			},
			request: new Request('http://localhost/app/content?/updateSharedSpell', {
				method: 'POST',
				body: new URLSearchParams({
					spellId: 'shared-spell-1',
					name: 'Arc Light Nova',
					level: '3',
					school: 'evocation',
					summary: '',
					description: '',
					castingTime: '',
					range: '',
					components: 'V, S',
					materials: 'A copper lens.',
					duration: '',
					classSlugsText: '',
					concentration: '',
					ritual: ''
				})
			})
		} as never);

		expect(response?.status).toBe(400);
		expect(response?.data.editSharedSpellId).toBe('shared-spell-1');
		expect(response?.data.editSharedSpellFormError).toBe(
			'Please correct the highlighted private spell fields.'
		);
		expect(response?.data.editSharedSpellFieldErrors.materials?.[0]).toContain(
			'only allowed when spell components include M'
		);
		expect(updateManagedSharedSpell).not.toHaveBeenCalled();
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

	it('blocks content editors from admin-only managed spell updates', async () => {
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
		updateManagedSharedSpell.mockRejectedValueOnce(
			Object.assign(new Error('forbidden'), { status: 403 })
		);

		await expect(
			actions.updateSharedSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/updateSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({
						spellId: 'system-spell-1',
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
			status: 403
		});
	});

	it('retires a managed shared spell for content editors', async () => {
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
		retireManagedSharedSpell.mockResolvedValueOnce({
			id: 'shared-spell-1',
			name: 'Arc Light Nova'
		});

		await expect(
			actions.retireSharedSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/retireSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({
						spellId: 'shared-spell-1'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?retiredSharedSpell=Arc%20Light%20Nova'
		});

		expect(retireManagedSharedSpell).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'content_editor', userId: 'user-1' }),
			'shared-spell-1'
		);
	});

	it('deletes a managed shared spell for admins', async () => {
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
		deleteManagedSharedSpell.mockResolvedValueOnce({
			id: 'system-spell-1',
			name: 'Solar Ward'
		});

		await expect(
			actions.deleteSharedSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/deleteSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({
						spellId: 'system-spell-1'
					})
				})
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/app/content?deletedSharedSpell=Solar%20Ward'
		});

		expect(deleteManagedSharedSpell).toHaveBeenCalledWith(
			{},
			expect.objectContaining({ globalRole: 'admin', userId: 'user-1' }),
			'system-spell-1'
		);
	});

	it('blocks content editors from admin-only shared spell lifecycle actions', async () => {
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
		retireManagedSharedSpell.mockRejectedValueOnce(
			Object.assign(new Error('forbidden'), { status: 403 })
		);

		await expect(
			actions.retireSharedSpell?.({
				locals: {
					session: {
						user: {
							id: 'user-1'
						}
					},
					supabase: {}
				},
				request: new Request('http://localhost/app/content?/retireSharedSpell', {
					method: 'POST',
					body: new URLSearchParams({
						spellId: 'system-spell-1'
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
