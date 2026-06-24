import type { PageServerLoad } from './$types';
import { listCharactersForUser } from '$lib/server/repositories/characters';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.supabase) {
		return {
			characters: [],
			createdName: null
		};
	}

	return {
		characters: await listCharactersForUser(locals.supabase, locals.session.user.id),
		createdName: url.searchParams.get('created')
	};
};
