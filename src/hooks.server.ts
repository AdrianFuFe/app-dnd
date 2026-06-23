import type { Handle } from '@sveltejs/kit';
import { createRequestSupabaseServerClient, getRequestSession } from '$lib/server/supabase/client';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		const supabase = createRequestSupabaseServerClient({
			cookies: event.cookies
		});

		const safeGetSession = async () => getRequestSession(supabase);
		const session = await safeGetSession();

		event.locals.supabase = supabase;
		event.locals.safeGetSession = safeGetSession;
		event.locals.session = session;
	} catch {
		event.locals.supabase = null as never;
		event.locals.safeGetSession = async () => null;
		event.locals.session = null;
	}

	return resolve(event);
};
