import { beforeEach, describe, expect, it, vi } from 'vitest';

const { ensureProfileForSession } = vi.hoisted(() => ({
	ensureProfileForSession: vi.fn()
}));

vi.mock('$lib/server/profiles/sync', () => ({
	ensureProfileForSession
}));

import { load } from './+layout.server';

describe('/app auth guard', () => {
	beforeEach(() => {
		ensureProfileForSession.mockReset().mockResolvedValue(undefined);
	});

	it('redirects unauthenticated users to login with their original path', async () => {
		await expect(
			load({
				locals: {
					session: null
				},
				url: new URL('https://example.com/app/characters/new?step=1')
			} as never)
		).rejects.toMatchObject({
			location: '/auth/login?redirectTo=%2Fapp%2Fcharacters%2Fnew%3Fstep%3D1',
			status: 302
		});
	});

	it('allows authenticated users into /app', async () => {
		const session = { user: { id: 'user-1' } };
		const supabase = {};

		await expect(
			load({
				locals: {
					session,
					supabase
				},
				url: new URL('https://example.com/app')
			} as never)
		).resolves.toEqual({
			session
		});

		expect(ensureProfileForSession).toHaveBeenCalledOnce();
		expect(ensureProfileForSession).toHaveBeenCalledWith(supabase, session);
	});
});
