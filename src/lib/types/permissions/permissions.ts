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

export interface AuthorizationContext {
	capabilities: RoleCapability[];
	globalRole: GlobalRole;
	userId: string;
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
