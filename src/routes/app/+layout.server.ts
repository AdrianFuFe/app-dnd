import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getAuthorizationContext } from '$lib/server/permissions/authorization';
import { ensureProfileForSession } from '$lib/server/profiles/sync';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.session) {
		const redirectTo = `${url.pathname}${url.search}`;
		const next = new URLSearchParams({ redirectTo });

		throw redirect(302, `/auth/login?${next.toString()}`);
	}

	await ensureProfileForSession(locals.supabase, locals.session);
	const authorization = await getAuthorizationContext(locals.supabase, locals.session.user.id);

	return {
		authorization,
		session: locals.session
	};
};
