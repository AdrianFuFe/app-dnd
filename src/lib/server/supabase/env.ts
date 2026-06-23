import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export interface SupabaseServerEnv {
	anonKey: string;
	serviceRoleKey: string | null;
	url: string;
}

function requireNonEmptyEnv(value: string | undefined, key: string): string {
	if (!value || value.trim().length === 0) {
		throw new Error(`Missing required environment variable: ${key}`);
	}

	return value;
}

export function getSupabaseServerEnv(): SupabaseServerEnv {
	return {
		anonKey: requireNonEmptyEnv(publicEnv.PUBLIC_SUPABASE_ANON_KEY, 'PUBLIC_SUPABASE_ANON_KEY'),
		serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null,
		url: requireNonEmptyEnv(publicEnv.PUBLIC_SUPABASE_URL, 'PUBLIC_SUPABASE_URL')
	};
}
