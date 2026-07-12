import { error, fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	createCharacterFormValues,
	createCharacterFormValuesFromInput
} from '$lib/domain/characters/character-form';
import { deriveManualCharacterContentProfile } from '$lib/domain/characters/manual-character-content-profile';
import { characterCreateInputSchema } from '$lib/schemas/characters/character.schema';
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
import { getCharacterForUser, updateCharacter } from '$lib/server/repositories/characters';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.session) {
		throw redirect(302, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	if (!locals.supabase) {
		throw error(500, 'Supabase is not configured yet.');
	}

	const [catalog, expandedContentCatalog, character] = await Promise.all([
		listCharacterCreationCatalog(locals.supabase),
		listExpandedContentCatalog(locals.supabase),
		getCharacterForUser(locals.supabase, locals.session.user.id, params.characterId)
	]);

	if (!character) {
		throw error(404, 'Character not found.');
	}

	return {
		characterId: character.id,
		characterName: character.name,
		guidedHandoff:
			url.searchParams.get('guided') === '1' || isGuidedCharacterOrigin(character.noteItems),
		values: createCharacterFormValuesFromInput(character),
		catalog,
		featCatalog: expandedContentCatalog.feats,
		spellCatalog: expandedContentCatalog.spells,
		equipmentCatalog: expandedContentCatalog.equipment
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
			const [guidedCatalog, expandedContentCatalog, existingCharacter] = await Promise.all([
				listGuidedCharacterCatalog(locals.supabase),
				listExpandedContentCatalog(locals.supabase),
				getCharacterForUser(locals.supabase, locals.session.user.id, params.characterId)
			]);

			if (!existingCharacter) {
				throw new Error(
					`Character ${params.characterId} was not found for user ${locals.session.user.id}`
				);
			}

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
			const contentProfileResult = deriveManualCharacterContentProfile(
				{
				...parsed.data,
					rulesetCode: existingCharacter.rulesetCode,
					contentMode: existingCharacter.contentMode,
					attackItems,
					featItems,
					spellItems,
					inventoryItems
				},
				{
					guidedCatalog,
					spellCatalog: expandedContentCatalog.spells,
					featCatalog: expandedContentCatalog.feats,
					existingCharacter
				}
			);

			const character = await updateCharacter(
				locals.supabase,
				locals.session.user.id,
				params.characterId,
				{
					...parsed.data,
					rulesetCode: contentProfileResult.profile.rulesetCode,
					contentMode: contentProfileResult.profile.contentMode,
					contentProfileMetadata:
						contentProfileResult.reasonLines.length > 0
							? { reasonLines: contentProfileResult.reasonLines }
							: undefined,
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
				}
			);
			throw redirect(
				303,
				buildCharacterDetailRedirect(character.id, {
					updated: character.name
				})
			);
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

function isGuidedCharacterOrigin(noteItems: Array<{ title: string }>): boolean {
	return noteItems.some(
		(note) => note.title === 'Guided build grants' || note.title === 'Guided build choices'
	);
}

function buildCharacterDetailRedirect(
	characterId: string,
	params: {
		updated?: string;
	}
) {
	const searchParams = new URLSearchParams();

	if (params.updated) {
		searchParams.set('updated', params.updated);
	}

	const query = searchParams.toString();
	return query.length > 0
		? `/app/characters/${characterId}?${query}`
		: `/app/characters/${characterId}`;
}
