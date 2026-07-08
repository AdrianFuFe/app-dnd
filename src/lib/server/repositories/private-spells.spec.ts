import { describe, expect, it } from 'vitest';
import {
	createE2EMockSupabaseClient,
	listE2EExpandedContentCatalog,
	resetE2EMockState
} from '$lib/server/e2e/mock-app';
import {
	buildPrivateSpellDerivationMechanic,
	createPrivateSpell,
	derivePrivateSpellFromSharedCatalog,
	extractPrivateSpellDerivation,
	listPrivateSpellsForUser
} from './private-spells';

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
});
