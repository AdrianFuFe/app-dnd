import { describe, expect, it, vi } from 'vitest';
import { POST } from './logout/+server';

describe('POST /auth/logout', () => {
	it('signs the current user out and redirects to the public home', async () => {
		const signOut = vi.fn().mockResolvedValue({ error: null });

		await expect(
			POST({
				locals: {
					supabase: {
						auth: {
							signOut
						}
					}
				}
			} as never)
		).rejects.toMatchObject({
			location: '/',
			status: 303
		});

		expect(signOut).toHaveBeenCalledOnce();
	});
});
