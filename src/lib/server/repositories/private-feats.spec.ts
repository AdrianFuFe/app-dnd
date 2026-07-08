import { describe, expect, it } from 'vitest';
import {
	buildPrivateFeatDerivationMechanic,
	createSharedFeat,
	deleteManagedSharedFeat,
	extractPrivateFeatDerivation,
	listManagedSharedFeats,
	listPrivateFeatsForUser,
	retireManagedSharedFeat
} from './private-feats';
import { createE2EMockSupabaseClient, resetE2EMockState } from '$lib/server/e2e/mock-app';
import { createAuthorizationContext } from '$lib/server/permissions/authorization';

describe('private feat derivation metadata', () => {
	it('extracts the first feat derivation mechanic from mixed mechanics', () => {
		const derivation = extractPrivateFeatDerivation([
			{ type: 'note', text: 'Custom tweak.' },
			buildPrivateFeatDerivationMechanic({
				source: 'srd-5-1',
				slug: 'alert',
				name: 'Alert'
			})
		]);

		expect(derivation).toEqual({
			source: 'srd-5-1',
			contentType: 'feat',
			slug: 'alert',
			name: 'Alert'
		});
	});

	it('ignores non-derivation mechanics', () => {
		expect(extractPrivateFeatDerivation([{ type: 'note', text: 'No provenance here.' }])).toBe(
			null
		);
	});
});

describe('managed shared feat lifecycle', () => {
	it('retires an editor-owned shared feat into private content in the E2E repository path', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();
		const authorization = createAuthorizationContext('user-1', 'content_editor');

		const created = await createSharedFeat(supabase, 'user-1', {
			slug: 'battle-lore',
			name: 'Battle Lore',
			prerequisites: ['level:4'],
			summary: 'Shared training doctrine.',
			visibility: 'shared',
			isSystemContent: false
		});

		await expect(retireManagedSharedFeat(supabase, authorization, created.id)).resolves.toEqual({
			id: created.id,
			name: 'Battle Lore'
		});

		await expect(listManagedSharedFeats(supabase, authorization)).resolves.toEqual([]);
		await expect(listPrivateFeatsForUser(supabase, 'user-1')).resolves.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: created.id,
					sourceCode: 'homebrew',
					name: 'Battle Lore'
				})
			])
		);
	});

	it('deletes a system-owned shared feat for admins in the E2E repository path', async () => {
		resetE2EMockState();
		const supabase = createE2EMockSupabaseClient();
		const authorization = createAuthorizationContext('user-1', 'admin');

		const created = await createSharedFeat(supabase, 'user-1', {
			slug: 'warden-sigil',
			name: 'Warden Sigil',
			prerequisites: [],
			summary: 'System-governed feat.',
			visibility: 'public',
			isSystemContent: true
		});

		await expect(deleteManagedSharedFeat(supabase, authorization, created.id)).resolves.toEqual({
			id: created.id,
			name: 'Warden Sigil'
		});

		await expect(listManagedSharedFeats(supabase, authorization)).resolves.toEqual([]);
	});
});
