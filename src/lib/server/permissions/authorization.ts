import { error as httpError } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database/supabase';
import {
	GLOBAL_ROLE_CAPABILITIES,
	GLOBAL_ROLE_LABELS,
	GLOBAL_ROLE_RANK,
	getPermissionScopePolicy,
	type AuthorizationContext,
	type GlobalRole,
	type PermissionScope,
	type RoleCapability
} from '$lib/types/permissions/permissions';

export function createAuthorizationContext(
	userId: string,
	globalRole: GlobalRole = 'user'
): AuthorizationContext {
	return {
		capabilities: [...GLOBAL_ROLE_CAPABILITIES[globalRole]],
		globalRole,
		userId
	};
}

export function hasGlobalRole(currentRole: GlobalRole, requiredRole: GlobalRole): boolean {
	return GLOBAL_ROLE_RANK[currentRole] >= GLOBAL_ROLE_RANK[requiredRole];
}

export function hasCapability(
	context: Pick<AuthorizationContext, 'capabilities'>,
	capability: RoleCapability
): boolean {
	return context.capabilities.includes(capability);
}

export function hasPermissionScopeAccess(
	context: Pick<AuthorizationContext, 'globalRole' | 'capabilities'>,
	scope: PermissionScope
): boolean {
	const policy = getPermissionScopePolicy(scope);

	return (
		hasCapability(context, policy.capability) &&
		policy.allowedRoles.includes(context.globalRole)
	);
}

export async function getAuthorizationContext(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<AuthorizationContext> {
	const { data, error } = await supabase
		.from('profiles')
		.select('global_role')
		.eq('id', userId)
		.maybeSingle();

	if (error) {
		throw new Error(`Failed to load role for user ${userId}`);
	}

	return createAuthorizationContext(userId, data?.global_role ?? 'user');
}

export function requireGlobalRole(
	context: AuthorizationContext,
	requiredRole: GlobalRole
): AuthorizationContext {
	if (!hasGlobalRole(context.globalRole, requiredRole)) {
		throw httpError(403, `${GLOBAL_ROLE_LABELS[requiredRole]} role required.`);
	}

	return context;
}

export function requireCapability(
	context: AuthorizationContext,
	capability: RoleCapability
): AuthorizationContext {
	if (!hasCapability(context, capability)) {
		throw httpError(403, `Missing required capability: ${capability}.`);
	}

	return context;
}

export function requirePermissionScopeAccess(
	context: AuthorizationContext,
	scope: PermissionScope
): AuthorizationContext {
	if (!hasPermissionScopeAccess(context, scope)) {
		const policy = getPermissionScopePolicy(scope);
		throw httpError(403, `Missing permission for ${scope}: ${policy.description}`);
	}

	return context;
}
