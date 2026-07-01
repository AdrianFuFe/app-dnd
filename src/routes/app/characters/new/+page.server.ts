import { fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDefaultCharacterInput } from '$lib/domain/characters/default-character';
import {
	createCharacterFormValuesFromInput,
	createCharacterFormValues
} from '$lib/domain/characters/character-form';
import { characterCreateInputSchema } from '$lib/schemas/characters/character.schema';
import {
	listCharacterCreationCatalog,
	listExpandedContentCatalog,
	resolveCharacterAttackCatalogSelections,
	resolveCharacterCreationCatalogSelections,
	resolveCharacterFeatCatalogSelections,
	resolveCharacterInventoryCatalogSelections,
	resolveCharacterSpellCatalogSelections
} from '$lib/server/repositories/catalog';
import { createCharacter } from '$lib/server/repositories/characters';

export const load: PageServerLoad = async ({ locals }) => {
	const [catalog, expandedContentCatalog] = locals.supabase
		? await Promise.all([
				listCharacterCreationCatalog(locals.supabase),
				listExpandedContentCatalog(locals.supabase)
			])
		: [
				{
					speciesOptions: [],
					subspeciesOptions: [],
					classOptions: [],
					subclassOptions: [],
					backgroundOptions: []
				},
				{
					spells: [],
					feats: [],
					equipment: []
				}
			];

	return {
		values: createCharacterFormValuesFromInput(createDefaultCharacterInput()),
		catalog,
		featCatalog: expandedContentCatalog.feats,
		spellCatalog: expandedContentCatalog.spells,
		equipmentCatalog: expandedContentCatalog.equipment
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
			const spellItems = await resolveCharacterSpellCatalogSelections(locals.supabase, {
				classId: catalogSelection.classId,
				spellItems: parsed.data.spellItems
			});
			const attackItems = await resolveCharacterAttackCatalogSelections(locals.supabase, {
				attackItems: parsed.data.attackItems
			});
			const featItems = await resolveCharacterFeatCatalogSelections(locals.supabase, {
				featItems: parsed.data.featItems
			});
			const inventoryItems = await resolveCharacterInventoryCatalogSelections(
				locals.supabase,
				{
					inventoryItems: parsed.data.inventoryItems
				}
			);

			const character = await createCharacter(locals.supabase, locals.session.user.id, {
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
				background: catalogSelection.background,
				attackItems,
				featItems,
				spellItems,
				inventoryItems
			});
			const createdName = encodeURIComponent(character.name);

			throw redirect(303, `/app/characters?created=${createdName}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

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
