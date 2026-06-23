import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerEnv } from './env.ts';
import type { Database } from '$lib/types/database/supabase';
import type { Cookies } from '@sveltejs/kit';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseServerClient() {
	const { anonKey, url } = getSupabaseServerEnv();

	return createClient<Database>(url, anonKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

export interface RequestSupabaseContext {
	cookies: Cookies;
}

export function createRequestSupabaseServerClient({
	cookies
}: RequestSupabaseContext): SupabaseClient<Database> {
	const { anonKey, url } = getSupabaseServerEnv();

	return createClient<Database>(url, anonKey, {
		auth: {
			autoRefreshToken: false,
			detectSessionInUrl: false,
			persistSession: false,
			storage: {
				getItem(key) {
					return cookies.get(key) ?? null;
				},
				removeItem(key) {
					cookies.delete(key, { path: '/' });
				},
				setItem(key, value) {
					cookies.set(key, value, {
						httpOnly: true,
						path: '/',
						sameSite: 'lax',
						secure: true
					});
				}
			}
		}
	});
}

export async function getRequestSession(
	supabase: SupabaseClient<Database>
): Promise<Session | null> {
	const { data, error } = await supabase.auth.getSession();

	if (error) {
		return null;
	}

	return data.session;
}

export function createSupabaseServiceRoleClient() {
	const { serviceRoleKey, url } = getSupabaseServerEnv();

	if (!serviceRoleKey) {
		throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
	}

	return createClient<Database>(url, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}
