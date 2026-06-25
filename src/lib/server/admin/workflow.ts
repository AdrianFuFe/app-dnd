import type { User } from '@supabase/supabase-js';

export const ADMIN_WORKFLOW_GLOBAL_ROLES = ['user', 'content_editor', 'admin'] as const;

export type AdminWorkflowGlobalRole = (typeof ADMIN_WORKFLOW_GLOBAL_ROLES)[number];

export interface AdminWorkflowEnv {
	adminAllowlistEmails: string[];
	serviceRoleKey: string;
	supabaseAnonKey?: string;
	supabaseUrl: string;
}

export interface TestUserInput {
	displayName: string | null;
	email: string;
	emailConfirmed: boolean;
	password: string;
}

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function parseEmailAllowlist(value: string | undefined): string[] {
	if (!value) {
		return [];
	}

	return [...new Set(value.split(',').map((entry) => normalizeEmail(entry)).filter(Boolean))];
}

export function parseAdminWorkflowEnv(
	env: NodeJS.ProcessEnv = process.env
): AdminWorkflowEnv {
	return {
		adminAllowlistEmails: parseEmailAllowlist(env.ADMIN_ALLOWLIST_EMAILS),
		serviceRoleKey: requireNonEmptyValue(env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY'),
		supabaseAnonKey: env.PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined,
		supabaseUrl: requireNonEmptyValue(env.PUBLIC_SUPABASE_URL, 'PUBLIC_SUPABASE_URL')
	};
}

export function parseRole(value: string): AdminWorkflowGlobalRole {
	if ((ADMIN_WORKFLOW_GLOBAL_ROLES as readonly string[]).includes(value)) {
		return value as AdminWorkflowGlobalRole;
	}

	throw new Error(
		`Invalid role "${value}". Expected one of: ${ADMIN_WORKFLOW_GLOBAL_ROLES.join(', ')}.`
	);
}

export function isAdminGrantAllowed(email: string, allowlistEmails: readonly string[]): boolean {
	return allowlistEmails.includes(normalizeEmail(email));
}

export function assertAdminGrantAllowed(
	email: string,
	role: AdminWorkflowGlobalRole,
	allowlistEmails: readonly string[]
): void {
	if (role !== 'admin') {
		return;
	}

	if (!isAdminGrantAllowed(email, allowlistEmails)) {
		throw new Error(
			`Refusing to grant admin role to ${normalizeEmail(email)}. Add the email to ADMIN_ALLOWLIST_EMAILS first.`
		);
	}
}

export function buildProfileUpsert(input: {
	displayName?: string | null;
	role: AdminWorkflowGlobalRole;
	userId: string;
}) {
	const profile = {
		global_role: input.role,
		id: input.userId,
		updated_at: new Date().toISOString()
	};

	if (input.displayName && input.displayName.trim().length > 0) {
		return {
			...profile,
			display_name: input.displayName.trim()
		};
	}

	return profile;
}

export async function findUserByEmail(
	listUsersPage: (page: number, perPage: number) => Promise<{
		lastPage?: number | null;
		users: Pick<User, 'email' | 'id'>[];
	}>,
	email: string
): Promise<Pick<User, 'email' | 'id'> | null> {
	const normalizedEmail = normalizeEmail(email);
	let page = 1;
	const perPage = 200;

	while (true) {
		const result = await listUsersPage(page, perPage);
		const match = result.users.find((user) => normalizeEmail(user.email ?? '') === normalizedEmail);

		if (match) {
			return match;
		}

		const lastPage = result.lastPage ?? page;

		if (page >= lastPage) {
			return null;
		}

		page += 1;
	}
}

export function parseBooleanFlag(value: string | undefined, defaultValue: boolean): boolean {
	if (!value) {
		return defaultValue;
	}

	if (value === 'true') {
		return true;
	}

	if (value === 'false') {
		return false;
	}

	throw new Error(`Invalid boolean value "${value}". Expected true or false.`);
}

export function parseCommandLineArgs(argv: string[]): Record<string, string> {
	const parsed: Record<string, string> = {};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];

		if (!token.startsWith('--')) {
			throw new Error(`Unexpected argument "${token}". Expected a --name value pair.`);
		}

		const key = token.slice(2);
		const value = argv[index + 1];

		if (!key) {
			throw new Error('Encountered an empty argument name.');
		}

		if (!value || value.startsWith('--')) {
			throw new Error(`Missing value for argument "--${key}".`);
		}

		parsed[key] = value;
		index += 1;
	}

	return parsed;
}

export function parseManageRoleInput(argv: string[]) {
	const args = parseCommandLineArgs(argv);

	return {
		email: requireNonEmptyValue(args.email, 'email'),
		role: parseRole(requireNonEmptyValue(args.role, 'role'))
	};
}

export function parseCreateTestUserInput(argv: string[]): TestUserInput {
	const args = parseCommandLineArgs(argv);

	return {
		displayName: args['display-name']?.trim() || null,
		email: requireNonEmptyValue(args.email, 'email'),
		emailConfirmed: parseBooleanFlag(args['email-confirmed'], true),
		password: requireNonEmptyValue(args.password, 'password')
	};
}

function requireNonEmptyValue(value: string | undefined, key: string): string {
	if (!value || value.trim().length === 0) {
		throw new Error(`Missing required value: ${key}`);
	}

	return value.trim();
}
