import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDefaultCharacterInput } from '$lib/domain/characters/default-character';
import {
	createCharacterFormValuesFromInput,
	createCharacterFormValues
} from '$lib/domain/characters/character-form';
import { characterCreateInputSchema } from '$lib/schemas/characters/character.schema';
import {
	listCharacterCreationCatalog,
	resolveCharacterCreationCatalogSelections
} from '$lib/server/repositories/catalog';
import { createCharacter } from '$lib/server/repositories/characters';

export const load: PageServerLoad = async ({ locals }) => {
	const catalog = locals.supabase
		? await listCharacterCreationCatalog(locals.supabase)
		: { speciesOptions: [], classOptions: [] };

	return {
		values: createCharacterFormValuesFromInput(createDefaultCharacterInput()),
		catalog
	};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/characters/new');
		}

		if (!locals.supabase) {
			return fail(500, {
				formError: 'Supabase is not configured yet.',
				fieldErrors: {},
				values: createCharacterFormValuesFromInput(createDefaultCharacterInput())
			});
		}

		const formData = Object.fromEntries(await request.formData());
		const parsed = characterCreateInputSchema.safeParse(formData);
		const values = createCharacterFormValues(formData);

		if (!parsed.success) {
			return fail(400, {
				formError: 'Please correct the highlighted character fields.',
				fieldErrors: parsed.error.flatten().fieldErrors,
				values
			});
		}

		try {
			const catalogSelection = await resolveCharacterCreationCatalogSelections(locals.supabase, {
				speciesId: parsed.data.speciesId,
				classId: parsed.data.classId
			});

			const character = await createCharacter(
				locals.supabase,
				locals.session.user.id,
				{
					...parsed.data,
					speciesId: catalogSelection.speciesId,
					race: catalogSelection.race,
					classId: catalogSelection.classId,
					className: catalogSelection.className
				}
			);
			const createdName = encodeURIComponent(character.name);

			throw redirect(303, `/app/characters?created=${createdName}`);
		} catch (error) {
			const isSelectionError =
				error instanceof Error && error.message.startsWith('Please choose a valid');
			const formError =
				error instanceof Error && isSelectionError
					? error.message
					: 'The character could not be saved. Please try again.';

			return fail(isSelectionError ? 400 : 500, {
				formError,
				fieldErrors: {},
				values
			});
		}
	}
};
