import { error, fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	createCharacterFormValues,
	createCharacterFormValuesFromInput
} from '$lib/domain/characters/character-form';
import { characterCreateInputSchema } from '$lib/schemas/characters/character.schema';
import {
	listCharacterCreationCatalog,
	resolveCharacterCreationCatalogSelections
} from '$lib/server/repositories/catalog';
import { getCharacterForUser, updateCharacter } from '$lib/server/repositories/characters';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.session) {
		throw redirect(302, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	if (!locals.supabase) {
		throw error(500, 'Supabase is not configured yet.');
	}

	const [catalog, character] = await Promise.all([
		listCharacterCreationCatalog(locals.supabase),
		getCharacterForUser(locals.supabase, locals.session.user.id, params.characterId)
	]);

	if (!character) {
		throw error(404, 'Character not found.');
	}

	return {
		characterId: character.id,
		characterName: character.name,
		values: createCharacterFormValuesFromInput(character),
		catalog
	};
};

export const actions: Actions = {
	default: async ({ locals, params, request, url }) => {
		if (!locals.session) {
			throw redirect(302, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
		}

		if (!locals.supabase) {
			return fail(500, {
				formError: 'Supabase is not configured yet.',
				fieldErrors: {},
				values: createCharacterFormValues()
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
			const catalogSelection = await resolveCharacterCreationCatalogSelections(
				locals.supabase,
				{
					speciesId: parsed.data.speciesId,
					subspeciesId: parsed.data.subspeciesId,
					classId: parsed.data.classId,
					subclassId: parsed.data.subclassId,
					backgroundId: parsed.data.backgroundId
				}
			);

			const character = await updateCharacter(
				locals.supabase,
				locals.session.user.id,
				params.characterId,
				{
					...parsed.data,
					speciesId: catalogSelection.speciesId,
					race: catalogSelection.race,
					subspeciesId: catalogSelection.subspeciesId,
					subrace: catalogSelection.subrace,
					classId: catalogSelection.classId,
					className: catalogSelection.className,
					subclassId: catalogSelection.subclassId,
					subclass: catalogSelection.subclass,
					backgroundId: catalogSelection.backgroundId,
					background: catalogSelection.background
				}
			);
			const updatedName = encodeURIComponent(character.name);

			throw redirect(303, `/app/characters/${character.id}?updated=${updatedName}`);
		} catch (caught) {
			if (isRedirect(caught)) {
				throw caught;
			}

			const isSelectionError =
				caught instanceof Error && caught.message.startsWith('Please choose a valid');
			const isMissingCharacter =
				caught instanceof Error &&
				caught.message ===
					`Character ${params.characterId} was not found for user ${locals.session.user.id}`;
			const formError =
				caught instanceof Error && isSelectionError
					? caught.message
					: isMissingCharacter
						? 'That character could not be found.'
						: 'The character could not be updated. Please try again.';

			return fail(isSelectionError || isMissingCharacter ? 400 : 500, {
				formError,
				fieldErrors: {},
				values
			});
		}
	}
};
