import type { PageServerLoad } from './$types';
import {
	listCharacterCreationCatalog,
	listExpandedContentCatalog
} from '$lib/server/repositories/catalog';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.supabase) {
		return {
			characterCatalog: {
				speciesOptions: [],
				subspeciesOptions: [],
				classOptions: [],
				subclassOptions: [],
				backgroundOptions: []
			},
			sharedCatalog: {
				species: [],
				subspecies: [],
				classes: [],
				subclasses: [],
				backgrounds: [],
				spells: [],
				feats: [],
				equipment: []
			}
		};
	}

	return {
		characterCatalog: await listCharacterCreationCatalog(locals.supabase),
		sharedCatalog: await listExpandedContentCatalog(locals.supabase)
	};
};
