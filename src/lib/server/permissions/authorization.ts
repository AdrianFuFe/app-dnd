import { error as httpError } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database/supabase';
import {
	GLOBAL_ROLE_CAPABILITIES,
	GLOBAL_ROLE_LABELS,
	GLOBAL_ROLE_RANK,
	type AuthorizationContext,
	type GlobalRole,
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
