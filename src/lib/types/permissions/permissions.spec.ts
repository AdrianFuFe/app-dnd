import { describe, expect, it } from 'vitest';
import { GLOBAL_ROLE_POLICIES, getGlobalRolePolicy, getPermissionScopePolicy } from './permissions';

describe('global permission policies', () => {
	it('defines explicit responsibilities for each global role', () => {
		expect(getGlobalRolePolicy('user').responsibilities).toEqual([
			'Read structured shared catalog data that is visible to authenticated users.',
			'Create, update, and delete only their own characters and other private user-owned content.'
		]);
		expect(getGlobalRolePolicy('content_editor').responsibilities).toContain(
			'Create and update shared non-system catalog content for broader reuse.'
		);
		expect(getGlobalRolePolicy('admin').responsibilities).toContain(
			'Manage user role assignments and other admin-only operator actions.'
		);
	});

	it('defines where admin-only actions are enforced', () => {
		expect(getPermissionScopePolicy('system_content')).toMatchObject({
			allowedRoles: ['admin'],
			enforcement: ['app', 'rls']
		});
		expect(getPermissionScopePolicy('user_role_administration')).toMatchObject({
			allowedRoles: ['admin'],
			enforcement: ['app', 'rls', 'service_role_workflow']
		});
	});

	it('keeps global role policies aligned with their capability maps', () => {
		for (const policy of Object.values(GLOBAL_ROLE_POLICIES)) {
			expect(policy.capabilities.length).toBeGreaterThan(0);
			expect(policy.rank).toBeGreaterThanOrEqual(0);
			expect(policy.label.length).toBeGreaterThan(0);
		}
	});
});
