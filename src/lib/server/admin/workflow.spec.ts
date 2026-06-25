import { describe, expect, it } from 'vitest';
import {
	assertAdminGrantAllowed,
	buildProfileUpsert,
	findUserByEmail,
	parseAdminWorkflowEnv,
	parseBooleanFlag,
	parseCommandLineArgs,
	parseCreateTestUserInput,
	parseEmailAllowlist,
	parseManageRoleInput,
	parseRole
} from './workflow';

describe('admin workflow helpers', () => {
	it('normalizes the email allowlist', () => {
		expect(parseEmailAllowlist(' Admin@example.com,editor@example.com,admin@example.com ')).toEqual([
			'admin@example.com',
			'editor@example.com'
		]);
	});

	it('loads the required admin workflow env', () => {
		expect(
			parseAdminWorkflowEnv({
				ADMIN_ALLOWLIST_EMAILS: 'admin@example.com',
				PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
				SUPABASE_SERVICE_ROLE_KEY: 'service-role-key'
			} as NodeJS.ProcessEnv)
		).toEqual({
			adminAllowlistEmails: ['admin@example.com'],
			serviceRoleKey: 'service-role-key',
			supabaseAnonKey: undefined,
			supabaseUrl: 'https://example.supabase.co'
		});
	});

	it('rejects invalid role strings', () => {
		expect(() => parseRole('owner')).toThrow('Invalid role "owner"');
	});

	it('blocks admin grants for non-allowlisted emails', () => {
		expect(() => assertAdminGrantAllowed('user@example.com', 'admin', ['admin@example.com'])).toThrow(
			'Refusing to grant admin role'
		);
	});

	it('allows non-admin role updates without the allowlist', () => {
		expect(() =>
			assertAdminGrantAllowed('user@example.com', 'content_editor', [])
		).not.toThrow();
	});

	it('builds a profile upsert payload', () => {
		const profile = buildProfileUpsert({
			displayName: 'Test User',
			role: 'user',
			userId: 'user-1'
		});

		expect(profile).toMatchObject({
			display_name: 'Test User',
			global_role: 'user',
			id: 'user-1'
		});
		expect(profile.updated_at).toEqual(expect.any(String));
	});

	it('finds a user by email across pages', async () => {
		const user = await findUserByEmail(
			async (page) => {
				if (page === 1) {
					return {
						lastPage: 2,
						users: [{ email: 'first@example.com', id: 'user-1' }]
					};
				}

				return {
					lastPage: 2,
					users: [{ email: 'admin@example.com', id: 'user-2' }]
				};
			},
			'Admin@example.com'
		);

		expect(user).toEqual({
			email: 'admin@example.com',
			id: 'user-2'
		});
	});

	it('parses strict boolean flags', () => {
		expect(parseBooleanFlag(undefined, true)).toBe(true);
		expect(parseBooleanFlag('false', true)).toBe(false);
		expect(() => parseBooleanFlag('yes', true)).toThrow('Invalid boolean value "yes"');
	});

	it('parses command line args as named pairs', () => {
		expect(parseCommandLineArgs(['--email', 'user@example.com', '--role', 'user'])).toEqual({
			email: 'user@example.com',
			role: 'user'
		});
	});

	it('parses role management input', () => {
		expect(parseManageRoleInput(['--email', 'user@example.com', '--role', 'admin'])).toEqual({
			email: 'user@example.com',
			role: 'admin'
		});
	});

	it('parses test-user input with defaults', () => {
		expect(parseCreateTestUserInput(['--email', 'user@example.com', '--password', 'secret123'])).toEqual(
			{
				displayName: null,
				email: 'user@example.com',
				emailConfirmed: true,
				password: 'secret123'
			}
		);
	});
});
