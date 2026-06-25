import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCharacterForUser } from '$lib/server/repositories/characters';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.session) {
		throw redirect(302, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	if (!locals.supabase) {
		throw error(500, 'Supabase is not configured yet.');
	}

	const character = await getCharacterForUser(
		locals.supabase,
		locals.session.user.id,
		params.characterId
	);

	if (!character) {
		throw error(404, 'Character not found.');
	}

	return {
		character,
		updatedName: url.searchParams.get('updated')
	};
};
