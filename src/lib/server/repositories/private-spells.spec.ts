import { describe, expect, it } from 'vitest';
import {
	createE2EMockSupabaseClient,
	listE2EExpandedContentCatalog,
	resetE2EMockState
} from '$lib/server/e2e/mock-app';
import {
	buildPrivateSpellDerivationMechanic,
	createSharedSpell,
	createPrivateSpell,
	deleteManagedSharedSpell,
	derivePrivateSpellFromSharedCatalog,
	extractPrivateSpellDerivation,
	listManagedSharedSpells,
	listPrivateSpellsForUser,
	retireManagedSharedSpell,
	updateManagedSharedSpell
} from './private-spells';
import { createAuthorizationContext } from '$lib/server/permissions/authorization';

describe('private spell derivation metadata', () => {
	it('extracts the first spell derivation mechanic from mixed mechanics', () => {
		const derivation = extractPrivateSpellDerivation([
			{ type: 'note', text: 'Custom tweak.' },
			buildPrivateSpellDerivationMechanic({
				source: 'srd-5-1',
				slug: 'magic-missile',
				name: 'Magic Missile'
			})
		]);

		expect(derivation).toEqual({
			source: 'srd-5-1',
			contentType: 'spell',
			slug: 'magic-missile',
			name: 'Magic Missile'
		});
	});

	it('ignores non-derivation mechanics', () => {
		expect(extractPrivateSpellDerivation([{ type: 'note', text: 'No provenance here.' }])).toBe(
			null
		);
	});
});

describe('private spells repository', () => {
	it('creates and lists private spells in the E2E repository path', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();

		await expect(
			createPrivateSpell(supabase, 'user-1', {
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
				description: 'A guided burst of light.',
				concentration: false,
				ritual: false
			})
		).resolves.toEqual(
			expect.objectContaining({
				sourceCode: 'user-private',
				slug: 'arc-light',
				name: 'Arc Light',
				level: 1,
				school: 'evocation',
				classSlugs: ['mago']
			})
		);

		await expect(listPrivateSpellsForUser(supabase, 'user-1')).resolves.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					slug: 'arc-light',
					name: 'Arc Light',
					derivation: null
				})
			])
		);
	});

	it('rejects duplicate private spell slugs for the same user in the E2E repository path', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();

		await createPrivateSpell(supabase, 'user-1', {
			slug: 'arc-light',
			name: 'Arc Light',
			level: 1,
			school: 'evocation',
			classSlugs: [],
			concentration: false,
			ritual: false
		});

		await expect(
			createPrivateSpell(supabase, 'user-1', {
				slug: 'arc-light',
				name: 'Arc Light Redux',
				level: 1,
				school: 'evocation',
				classSlugs: [],
				concentration: false,
				ritual: false
			})
		).rejects.toThrow('You already have a private spell with that slug. Try a different name.');
	});

	it('derives a private spell from a shared SRD spell in the E2E repository path', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();
		const magicMissileId = listE2EExpandedContentCatalog().spells.find(
			(spell) => spell.slug === 'magic-missile'
		)?.id;

		expect(magicMissileId).toBeDefined();

		await expect(
			derivePrivateSpellFromSharedCatalog(supabase, 'user-1', {
				sharedSpellId: magicMissileId!
			})
		).resolves.toEqual(
			expect.objectContaining({
				sourceCode: 'homebrew',
				slug: 'magic-missile',
				name: 'Magic Missile',
				derivation: {
					source: 'srd-5-1',
					contentType: 'spell',
					slug: 'magic-missile',
					name: 'Magic Missile'
				}
			})
		);
	});

	it('publishes a shared spell in the E2E repository path and exposes it in the shared catalog only', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();

		await expect(
			createSharedSpell(supabase, 'user-1', {
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
				description: undefined,
				concentration: false,
				ritual: false,
				visibility: 'shared',
				isSystemContent: false
			})
		).resolves.toEqual(
			expect.objectContaining({
				sourceCode: 'homebrew',
				slug: 'arc-light-nova',
				contentMode: 'custom',
				editorialStatus: 'published',
				visibility: 'shared',
				isSystemContent: false
			})
		);

		await expect(listPrivateSpellsForUser(supabase, 'user-1')).resolves.not.toEqual(
			expect.arrayContaining([expect.objectContaining({ slug: 'arc-light-nova' })])
		);
		expect(
			listE2EExpandedContentCatalog().spells.find((spell) => spell.slug === 'arc-light-nova')
		).toEqual(
			expect.objectContaining({
				name: 'Arc Light Nova',
				visibility: 'shared',
				isSystemContent: false
			})
		);
	});

	it('rejects duplicate shared spell slugs in the E2E repository path', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();

		await createSharedSpell(supabase, 'user-1', {
			slug: 'arc-light-nova',
			name: 'Arc Light Nova',
			level: 3,
			school: 'evocation',
			classSlugs: [],
			concentration: false,
			ritual: false,
			visibility: 'shared',
			isSystemContent: false
		});

		await expect(
			createSharedSpell(supabase, 'user-2', {
				slug: 'arc-light-nova',
				name: 'Arc Light Nova II',
				level: 4,
				school: 'evocation',
				classSlugs: [],
				concentration: false,
				ritual: false,
				visibility: 'public',
				isSystemContent: true
			})
		).rejects.toThrow('A shared spell with that slug already exists. Try a different name.');
	});

	it('lists and updates managed shared spells in the E2E repository path', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();

		await createSharedSpell(supabase, 'user-1', {
			slug: 'arc-light-nova',
			name: 'Arc Light Nova',
			level: 3,
			school: 'evocation',
			classSlugs: ['mago'],
			concentration: false,
			ritual: false,
			visibility: 'shared',
			isSystemContent: false
		});

		await expect(
			listManagedSharedSpells(
				supabase,
				createAuthorizationContext('user-1', 'content_editor')
			)
		).resolves.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					slug: 'arc-light-nova',
					name: 'Arc Light Nova',
					ownerUserId: 'user-1'
				})
			])
		);

		await expect(
			updateManagedSharedSpell(
				supabase,
				createAuthorizationContext('user-1', 'content_editor'),
				{
					spellId: 'shared-spell-e2e-1',
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
					description: 'Brighter and broader.',
					concentration: false,
					ritual: false
				}
			)
		).resolves.toEqual(
			expect.objectContaining({
				slug: 'arc-light-supernova',
				name: 'Arc Light Supernova',
				level: 4
			})
		);
	});

	it('retires an editor-owned shared spell into private content in the E2E repository path', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();
		const created = await createSharedSpell(supabase, 'user-1', {
			slug: 'arc-light-nova',
			name: 'Arc Light Nova',
			level: 3,
			school: 'evocation',
			classSlugs: ['mago'],
			concentration: false,
			ritual: false,
			visibility: 'shared',
			isSystemContent: false
		});
		const authorization = createAuthorizationContext('user-1', 'content_editor');

		await expect(
			retireManagedSharedSpell(supabase, authorization, created.id)
		).resolves.toEqual({
			id: created.id,
			name: 'Arc Light Nova'
		});

		await expect(listManagedSharedSpells(supabase, authorization)).resolves.toEqual([]);
		await expect(listPrivateSpellsForUser(supabase, 'user-1')).resolves.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: created.id,
					name: 'Arc Light Nova',
					editorialStatus: 'retired'
				})
			])
		);
	});

	it('deletes a system-owned shared spell for admins in the E2E repository path', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();
		const created = await createSharedSpell(supabase, 'user-1', {
			slug: 'solar-ward',
			name: 'Solar Ward',
			level: 4,
			school: 'abjuration',
			classSlugs: ['clerigo'],
			concentration: true,
			ritual: false,
			visibility: 'public',
			isSystemContent: true
		});
		const authorization = createAuthorizationContext('user-1', 'admin');

		await expect(
			deleteManagedSharedSpell(supabase, authorization, created.id)
		).resolves.toEqual({
			id: created.id,
			name: 'Solar Ward'
		});

		await expect(listManagedSharedSpells(supabase, authorization)).resolves.toEqual([]);
	});
});
