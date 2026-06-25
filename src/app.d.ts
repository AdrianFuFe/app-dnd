// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	type SupabaseRequestClient = import('@supabase/supabase-js').SupabaseClient<
		import('$lib/types/database/supabase').Database
	>;
	type SupabaseSession = import('@supabase/supabase-js').Session;

	namespace NodeJS {
		interface ProcessEnv {
			ADMIN_ALLOWLIST_EMAILS?: string;
			APP_E2E?: 'true' | 'false';
			PUBLIC_SUPABASE_ANON_KEY: string;
			PUBLIC_SUPABASE_URL: string;
			SUPABASE_SERVICE_ROLE_KEY?: string;
		}
	}

	namespace App {
		// interface Error {}
		interface Locals {
			runtime: import('$lib/server/runtime/integration').RuntimeIntegrationStatus;
			safeGetSession: () => Promise<SupabaseSession | null>;
			session: SupabaseSession | null;
			supabase: SupabaseRequestClient;
		}
		interface PageData {
			authorization?:
				| import('$lib/types/permissions/permissions').AuthorizationContext
				| null;
			session: SupabaseSession | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
