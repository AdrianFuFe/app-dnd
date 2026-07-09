import type { Handle } from '@sveltejs/kit';
import { isE2EMode } from '$lib/server/e2e/mode';
import {
	createE2EMockSupabaseClient,
	getE2EMockSession,
	setE2EMockGlobalRole
} from '$lib/server/e2e/mock-app';
import { GLOBAL_ROLES, type GlobalRole } from '$lib/types/permissions/permissions';
import { getRuntimeIntegrationStatus } from '$lib/server/runtime/integration';
import { createRequestSupabaseServerClient, getRequestSession } from '$lib/server/supabase/client';

export const handle: Handle = async ({ event, resolve }) => {
	const runtime = getRuntimeIntegrationStatus();

	event.locals.runtime = runtime;

	if (runtime.mode === 'e2e-mock' && isE2EMode()) {
		const requestedRole = event.url.searchParams.get('e2eRole') ?? event.cookies.get('app-e2e-role');

		if (requestedRole && GLOBAL_ROLES.includes(requestedRole as GlobalRole)) {
			setE2EMockGlobalRole(requestedRole as GlobalRole);
			event.locals.e2eRole = requestedRole as GlobalRole;
			event.cookies.set('app-e2e-role', requestedRole, {
				httpOnly: false,
				path: '/',
				sameSite: 'lax',
				secure: false
			});
		}

		const session = getE2EMockSession();

		event.locals.supabase = createE2EMockSupabaseClient();
		event.locals.safeGetSession = async () => session;
		event.locals.session = session;

		return resolve(event);
	}

	if (!runtime.liveSupabaseConfigured) {
		event.locals.supabase = null as never;
		event.locals.safeGetSession = async () => null;
		event.locals.session = null;

		return resolve(event);
	}

	const supabase = createRequestSupabaseServerClient({
		cookies: event.cookies
	});

	const safeGetSession = async () => getRequestSession(supabase);
	const session = await safeGetSession();

	event.locals.supabase = supabase;
	event.locals.safeGetSession = safeGetSession;
	event.locals.session = session;

	return resolve(event);
};
