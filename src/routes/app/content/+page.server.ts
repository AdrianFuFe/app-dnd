import type { PageServerLoad } from './$types';
import { listExpandedContentCatalog } from '$lib/server/repositories/catalog';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.supabase) {
		return {
			catalog: {
				spells: [],
				feats: []
			}
		};
	}

	return {
		catalog: await listExpandedContentCatalog(locals.supabase)
	};
};
