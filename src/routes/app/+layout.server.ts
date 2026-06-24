import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.session) {
		const redirectTo = `${url.pathname}${url.search}`;
		const next = new URLSearchParams({ redirectTo });

		throw redirect(302, `/auth/login?${next.toString()}`);
	}

	return {
		session: locals.session
	};
};
