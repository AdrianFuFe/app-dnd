import type { Handle } from '@sveltejs/kit';
import { isE2EMode } from '$lib/server/e2e/mode';
import { createE2EMockSupabaseClient, getE2EMockSession } from '$lib/server/e2e/mock-app';
import { getRuntimeIntegrationStatus } from '$lib/server/runtime/integration';
import { createRequestSupabaseServerClient, getRequestSession } from '$lib/server/supabase/client';

export const handle: Handle = async ({ event, resolve }) => {
	const runtime = getRuntimeIntegrationStatus();

	event.locals.runtime = runtime;

	if (runtime.mode === 'e2e-mock' && isE2EMode()) {
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
