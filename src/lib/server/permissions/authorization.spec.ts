import { describe, expect, it, vi } from 'vitest';
import {
	createAuthorizationContext,
	getAuthorizationContext,
	hasCapability,
	hasGlobalRole,
	hasPermissionScopeAccess,
	requireCapability,
	requirePermissionScopeAccess,
	requireGlobalRole
} from './authorization';

describe('createAuthorizationContext', () => {
	it('builds role capabilities from the shared permission model', () => {
		expect(createAuthorizationContext('user-1', 'user')).toEqual({
			capabilities: [
				'read_shared_catalog',
				'manage_own_characters',
				'manage_private_content'
			],
			globalRole: 'user',
			userId: 'user-1'
		});

		expect(createAuthorizationContext('user-2', 'admin').capabilities).toContain(
			'manage_system_content'
		);
	});
});

describe('getAuthorizationContext', () => {
	it('loads the stored role from profiles', async () => {
		const maybeSingle = vi.fn().mockResolvedValue({
			data: { global_role: 'content_editor' },
			error: null
		});
		const eq = vi.fn().mockReturnValue({ maybeSingle });
		const select = vi.fn().mockReturnValue({ eq });
		const from = vi.fn().mockReturnValue({ select });

		await expect(getAuthorizationContext({ from } as never, 'user-1')).resolves.toEqual({
			capabilities: [
				'read_shared_catalog',
				'manage_own_characters',
				'manage_private_content',
				'edit_shared_content'
			],
			globalRole: 'content_editor',
			userId: 'user-1'
		});

		expect(from).toHaveBeenCalledWith('profiles');
		expect(select).toHaveBeenCalledWith('global_role');
		expect(eq).toHaveBeenCalledWith('id', 'user-1');
	});

	it('defaults to user when the profile row is not returned yet', async () => {
		const maybeSingle = vi.fn().mockResolvedValue({
			data: null,
			error: null
		});

		await expect(
			getAuthorizationContext(
				{
					from: () => ({
						select: () => ({
							eq: () => ({
								maybeSingle
							})
						})
					})
				} as never,
				'user-1'
			)
		).resolves.toMatchObject({
			globalRole: 'user'
		});
	});

	it('throws when the role lookup fails', async () => {
		await expect(
			getAuthorizationContext(
				{
					from: () => ({
						select: () => ({
							eq: () => ({
								maybeSingle: async () => ({
									data: null,
									error: new Error('query failed')
								})
							})
						})
					})
				} as never,
				'user-1'
			)
		).rejects.toThrow('Failed to load role for user user-1');
	});
});

describe('role enforcement helpers', () => {
	it('treats global roles as hierarchical', () => {
		expect(hasGlobalRole('admin', 'content_editor')).toBe(true);
		expect(hasGlobalRole('content_editor', 'admin')).toBe(false);
	});

	it('checks capabilities directly', () => {
		const context = createAuthorizationContext('user-1', 'content_editor');

		expect(hasCapability(context, 'edit_shared_content')).toBe(true);
		expect(hasCapability(context, 'manage_system_content')).toBe(false);
	});

	it('checks scope access from the shared permission policy', () => {
		expect(hasPermissionScopeAccess(createAuthorizationContext('user-1', 'user'), 'shared_content')).toBe(
			false
		);
		expect(
			hasPermissionScopeAccess(createAuthorizationContext('user-2', 'content_editor'), 'shared_content')
		).toBe(true);
		expect(hasPermissionScopeAccess(createAuthorizationContext('user-3', 'admin'), 'system_content')).toBe(
			true
		);
	});

	it('throws 403 for missing roles or capabilities', () => {
		const context = createAuthorizationContext('user-1', 'user');

		expect(() => requireGlobalRole(context, 'admin')).toThrow(
			expect.objectContaining({
				status: 403
			})
		);
		expect(() => requireCapability(context, 'manage_system_content')).toThrow(
			expect.objectContaining({
				status: 403
			})
		);
		expect(() => requirePermissionScopeAccess(context, 'user_role_administration')).toThrow(
			expect.objectContaining({
				status: 403
			})
		);
	});
});
