import { describe, expect, it } from 'vitest';
import { createE2EMockSupabaseClient, resetE2EMockState } from '$lib/server/e2e/mock-app';
import { createPrivateSpell, listPrivateSpellsForUser } from './private-spells';

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
					name: 'Arc Light'
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
});
