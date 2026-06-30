export const GLOBAL_ROLES = ['user', 'content_editor', 'admin'] as const;

export type GlobalRole = (typeof GLOBAL_ROLES)[number];

export const CAMPAIGN_ROLES = ['owner', 'dm', 'player', 'viewer'] as const;

export type CampaignRole = (typeof CAMPAIGN_ROLES)[number];

export const PERMISSION_ACTIONS = ['view', 'create', 'update', 'delete', 'share', 'admin'] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const ROLE_CAPABILITIES = [
	'read_shared_catalog',
	'manage_own_characters',
	'manage_private_content',
	'edit_shared_content',
	'manage_system_content',
	'manage_users_and_roles'
] as const;

export type RoleCapability = (typeof ROLE_CAPABILITIES)[number];

export const ENFORCEMENT_LAYERS = ['app', 'rls', 'service_role_workflow'] as const;

export type EnforcementLayer = (typeof ENFORCEMENT_LAYERS)[number];

export const PERMISSION_SCOPES = [
	'shared_catalog_read',
	'character_data',
	'private_content',
	'shared_content',
	'system_content',
	'user_role_administration'
] as const;

export type PermissionScope = (typeof PERMISSION_SCOPES)[number];

export interface AuthorizationContext {
	capabilities: RoleCapability[];
	globalRole: GlobalRole;
	userId: string;
}

export interface PermissionScopePolicy {
	allowedRoles: readonly GlobalRole[];
	capability: RoleCapability;
	description: string;
	enforcement: readonly EnforcementLayer[];
}

export interface GlobalRolePolicy {
	label: string;
	rank: number;
	capabilities: readonly RoleCapability[];
	responsibilities: readonly string[];
}

export const GLOBAL_ROLE_LABELS: Record<GlobalRole, string> = {
	user: 'User',
	content_editor: 'Content editor',
	admin: 'Admin'
};

export const GLOBAL_ROLE_CAPABILITIES: Record<GlobalRole, readonly RoleCapability[]> = {
	user: ['read_shared_catalog', 'manage_own_characters', 'manage_private_content'],
	content_editor: [
		'read_shared_catalog',
		'manage_own_characters',
		'manage_private_content',
		'edit_shared_content'
	],
	admin: [
		'read_shared_catalog',
		'manage_own_characters',
		'manage_private_content',
		'edit_shared_content',
		'manage_system_content',
		'manage_users_and_roles'
	]
};

export const GLOBAL_ROLE_RANK: Record<GlobalRole, number> = {
	user: 0,
	content_editor: 1,
	admin: 2
};

export const GLOBAL_ROLE_RESPONSIBILITIES: Record<GlobalRole, readonly string[]> = {
	user: [
		'Read structured shared catalog data that is visible to authenticated users.',
		'Create, update, and delete only their own characters and other private user-owned content.'
	],
	content_editor: [
		'Do everything a user can do.',
		'Create and update shared non-system catalog content for broader reuse.'
	],
	admin: [
		'Do everything a content editor can do.',
		'Manage system-owned catalog content.',
		'Manage user role assignments and other admin-only operator actions.'
	]
};

export const GLOBAL_ROLE_POLICIES: Record<GlobalRole, GlobalRolePolicy> = {
	user: {
		label: GLOBAL_ROLE_LABELS.user,
		rank: GLOBAL_ROLE_RANK.user,
		capabilities: GLOBAL_ROLE_CAPABILITIES.user,
		responsibilities: GLOBAL_ROLE_RESPONSIBILITIES.user
	},
	content_editor: {
		label: GLOBAL_ROLE_LABELS.content_editor,
		rank: GLOBAL_ROLE_RANK.content_editor,
		capabilities: GLOBAL_ROLE_CAPABILITIES.content_editor,
		responsibilities: GLOBAL_ROLE_RESPONSIBILITIES.content_editor
	},
	admin: {
		label: GLOBAL_ROLE_LABELS.admin,
		rank: GLOBAL_ROLE_RANK.admin,
		capabilities: GLOBAL_ROLE_CAPABILITIES.admin,
		responsibilities: GLOBAL_ROLE_RESPONSIBILITIES.admin
	}
};

export const PERMISSION_SCOPE_POLICIES: Record<PermissionScope, PermissionScopePolicy> = {
	shared_catalog_read: {
		allowedRoles: GLOBAL_ROLES,
		capability: 'read_shared_catalog',
		description: 'Read shared catalog content that is public or system-managed.',
		enforcement: ['app', 'rls']
	},
	character_data: {
		allowedRoles: GLOBAL_ROLES,
		capability: 'manage_own_characters',
		description: 'Manage your own characters. Admins may also operate across users when required.',
		enforcement: ['app', 'rls']
	},
	private_content: {
		allowedRoles: GLOBAL_ROLES,
		capability: 'manage_private_content',
		description: 'Create and maintain private user-owned catalog content.',
		enforcement: ['app', 'rls']
	},
	shared_content: {
		allowedRoles: ['content_editor', 'admin'],
		capability: 'edit_shared_content',
		description: 'Create and update shared non-system catalog content.',
		enforcement: ['app', 'rls']
	},
	system_content: {
		allowedRoles: ['admin'],
		capability: 'manage_system_content',
		description: 'Create or modify system-owned catalog content.',
		enforcement: ['app', 'rls']
	},
	user_role_administration: {
		allowedRoles: ['admin'],
		capability: 'manage_users_and_roles',
		description: 'Grant roles and perform admin-only operator workflows.',
		enforcement: ['app', 'rls', 'service_role_workflow']
	}
};

export function getGlobalRolePolicy(role: GlobalRole): GlobalRolePolicy {
	return GLOBAL_ROLE_POLICIES[role];
}

export function getPermissionScopePolicy(scope: PermissionScope): PermissionScopePolicy {
	return PERMISSION_SCOPE_POLICIES[scope];
}
