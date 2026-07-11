import { fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDefaultCharacterInput } from '$lib/domain/characters/default-character';
import {
	createCharacterFormValuesFromInput,
	createCharacterFormValues
} from '$lib/domain/characters/character-form';
import {
	createDefaultGuidedCharacterInput,
	createGuidedCharacterFormValues,
	deriveGuidedCharacterDraft
} from '$lib/domain/characters/guided-character';
import { characterCreateInputSchema } from '$lib/schemas/characters/character.schema';
import { characterGuidedInputSchema } from '$lib/schemas/characters/character-guided.schema';
import {
	listCharacterCreationCatalog,
	listExpandedContentCatalog,
	listGuidedCharacterCatalog,
	resolveCharacterAttackCatalogSelections,
	resolveCharacterCreationCatalogSelections,
	resolveCharacterFeatCatalogSelections,
	resolveCharacterInventoryCatalogSelections,
	resolveCharacterSpellCatalogSelections
} from '$lib/server/repositories/catalog';
import { createCharacter } from '$lib/server/repositories/characters';

export const load: PageServerLoad = async ({ locals }) => {
	const [catalog, expandedContentCatalog, guidedCatalog] = locals.supabase
		? await Promise.all([
				listCharacterCreationCatalog(locals.supabase),
				listExpandedContentCatalog(locals.supabase),
				listGuidedCharacterCatalog(locals.supabase)
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
					species: [],
					subspecies: [],
					classes: [],
					subclasses: [],
					backgrounds: [],
					spells: [],
					feats: [],
					equipment: [],
					vocabularies: {
						abilities: [],
						languages: [],
						damageTypes: [],
						spellSchools: [],
						skillProficiencies: [],
						armorProficiencies: [],
						weaponProficiencies: [],
						toolProficiencies: [],
						savingThrowProficiencies: []
					}
				},
				{
					speciesOptions: [],
					subspeciesOptions: [],
					classOptions: [],
					subclassOptions: [],
					backgroundOptions: [],
					spellCatalog: [],
					equipmentCatalog: [],
					vocabularies: {
						abilities: [],
						languages: [],
						damageTypes: [],
						spellSchools: [],
						skillProficiencies: [],
						armorProficiencies: [],
						weaponProficiencies: [],
						toolProficiencies: [],
						savingThrowProficiencies: []
					}
				}
			];

	return {
		values: createCharacterFormValuesFromInput(createDefaultCharacterInput()),
		guidedValues: createGuidedCharacterFormValues(createDefaultGuidedCharacterInput()),
		catalog,
		guidedCatalog,
		featCatalog: expandedContentCatalog.feats,
		spellCatalog: expandedContentCatalog.spells,
		equipmentCatalog: expandedContentCatalog.equipment
	};
};

export const actions: Actions = {
	guided: async ({ locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/characters/new');
		}

		if (!locals.supabase) {
			return fail(500, {
				guidedFormError: 'Supabase is not configured yet.',
				guidedFieldErrors: {},
				guidedValues: createGuidedCharacterFormValues(createDefaultGuidedCharacterInput())
			});
		}

		const formData = Object.fromEntries(await request.formData());
		const parsed = characterGuidedInputSchema.safeParse(formData);
		const guidedValues = createGuidedCharacterFormValues(formData);

		if (!parsed.success) {
			return fail(400, {
				guidedFormError: 'Please correct the highlighted guided fields.',
				guidedFieldErrors: parsed.error.flatten().fieldErrors,
				guidedValues
			});
		}

		try {
			const guidedCatalog = await listGuidedCharacterCatalog(locals.supabase);
			const guidedDraft = deriveGuidedCharacterDraft(guidedCatalog, parsed.data);
			const catalogSelection = await resolveCharacterCreationCatalogSelections(
				locals.supabase,
				{
					speciesId: guidedDraft.character.speciesId,
					subspeciesId: guidedDraft.character.subspeciesId,
					classId: guidedDraft.character.classId,
					subclassId: guidedDraft.character.subclassId,
					backgroundId: guidedDraft.character.backgroundId
				}
			);
			const spellItems = await resolveCharacterSpellCatalogSelections(locals.supabase, {
				classId: catalogSelection.classId,
				subclassId: catalogSelection.subclassId,
				spellItems: guidedDraft.character.spellItems
			});

			const character = await createCharacter(locals.supabase, locals.session.user.id, {
				...guidedDraft.character,
				...catalogSelection,
				spellItems
			});
			const createdName = encodeURIComponent(character.name);

			throw redirect(
				303,
				`/app/characters/${character.id}?created=${createdName}&guided=1`
			);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			return fail(400, {
				guidedFormError:
					error instanceof Error
						? error.message
						: 'The guided character could not be saved. Please try again.',
				guidedFieldErrors: {},
				guidedValues
			});
		}
	},
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
				subclassId: catalogSelection.subclassId,
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
