import { describe, expect, it } from 'vitest';
import { getRequestSession } from './client.ts';

describe('getRequestSession', () => {
	it('returns null when the auth client returns an error', async () => {
		const session = await getRequestSession({
			auth: {
				getSession: async () => ({
					data: { session: null },
					error: new Error('failure')
				})
			}
		} as never);

		expect(session).toBeNull();
	});
});
