import { env } from '$env/dynamic/public';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database/supabase';

function requirePublicEnv(value: string | undefined, key: string): string {
	if (!value || value.trim().length === 0) {
		throw new Error(`Missing required environment variable: ${key}`);
	}

	return value;
}

export function createSupabaseBrowserClient() {
	return createClient<Database>(
		requirePublicEnv(env.PUBLIC_SUPABASE_URL, 'PUBLIC_SUPABASE_URL'),
		requirePublicEnv(env.PUBLIC_SUPABASE_ANON_KEY, 'PUBLIC_SUPABASE_ANON_KEY')
	);
}
