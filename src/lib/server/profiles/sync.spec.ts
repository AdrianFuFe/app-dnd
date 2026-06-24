import { describe, expect, it, vi } from 'vitest';
import { ensureProfileForSession, getProfileDisplayName } from './sync';

describe('getProfileDisplayName', () => {
	it('prefers display_name metadata when available', () => {
		expect(
			getProfileDisplayName({
				user_metadata: {
					display_name: '  Aria  ',
					full_name: 'Aria Moonfall'
				}
			} as never)
		).toBe('Aria');
	});

	it('falls back to full_name and name metadata', () => {
		expect(
			getProfileDisplayName({
				user_metadata: {
					full_name: 'Aria Moonfall'
				}
			} as never)
		).toBe('Aria Moonfall');

		expect(
			getProfileDisplayName({
				user_metadata: {
					name: 'Aria'
				}
			} as never)
		).toBe('Aria');
	});

	it('returns null when no usable metadata name exists', () => {
		expect(
			getProfileDisplayName({
				user_metadata: {
					display_name: '   '
				}
			} as never)
		).toBeNull();
	});
});

describe('ensureProfileForSession', () => {
	it('upserts the authenticated profile row', async () => {
		const upsert = vi.fn().mockResolvedValue({ error: null });
		const supabase = {
			from: vi.fn().mockReturnValue({
				upsert
			})
		};

		await ensureProfileForSession(
			supabase as never,
			{
				user: {
					id: 'user-1',
					user_metadata: {
						display_name: 'Aria'
					}
				}
			} as never
		);

		expect(supabase.from).toHaveBeenCalledWith('profiles');
		expect(upsert).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'user-1',
				display_name: 'Aria'
			}),
			{
				onConflict: 'id'
			}
		);
		expect(upsert.mock.calls[0]?.[0]).toEqual(
			expect.objectContaining({
				updated_at: expect.any(String)
			})
		);
	});

	it('does not clear an existing display name when metadata is missing', async () => {
		const upsert = vi.fn().mockResolvedValue({ error: null });

		await ensureProfileForSession(
			{
				from: () => ({
					upsert
				})
			} as never,
			{
				user: {
					id: 'user-1',
					user_metadata: {}
				}
			} as never
		);

		expect(upsert.mock.calls[0]?.[0]).toEqual({
			id: 'user-1',
			updated_at: expect.any(String)
		});
	});

	it('throws when the profile sync fails', async () => {
		await expect(
			ensureProfileForSession(
				{
					from: () => ({
						upsert: async () => ({
							error: new Error('write failed')
						})
					})
				} as never,
				{
					user: {
						id: 'user-1',
						user_metadata: {}
					}
				} as never
			)
		).rejects.toThrow('Failed to sync profile for user user-1');
	});
});
