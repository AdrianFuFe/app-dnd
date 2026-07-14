import { error, fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	createCharacterFormValues,
	createCharacterFormValuesFromInput
} from '$lib/domain/characters/character-form';
import {
	deriveManualCharacterContentProfile,
	extractGuidedBaselineChangedSections
} from '$lib/domain/characters/manual-character-content-profile';
import {
	deriveGuidedSpellOriginSummary,
	GUIDED_BUILD_CHOICES_TITLE,
	GUIDED_BUILD_GRANTS_TITLE,
	isGuidedCharacterOrigin,
	splitGuidedNoteLines
} from '$lib/domain/characters/guided-origin-summary';
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

	const guidedInventoryAdopted = url.searchParams.get('adoptInventory') === '1';
	const guidedNoteAdopted = url.searchParams.get('adoptNotes') === '1';

	return {
		characterId: character.id,
		characterName: character.name,
		guidedHandoff:
			url.searchParams.get('guided') === '1' || isGuidedCharacterOrigin(character.noteItems),
		guidedInventoryAdopted,
		guidedInventoryAdoptHref: `${buildGuidedEditHref(character.id, {
			adoptInventory: true,
			adoptNotes: guidedNoteAdopted
		})}#inventory`,
		guidedNoteAdopted,
		guidedNoteAdoptHref: `${buildGuidedEditHref(character.id, {
			adoptInventory: guidedInventoryAdopted,
			adoptNotes: true
		})}#notes`,
		guidedInventoryPreviewItems: character.inventoryItems,
		guidedNotePreviewItems: character.noteItems,
		guidedBaseline: character.contentProfileMetadata?.guidedBaseline ?? null,
		guidedOriginSummary: summarizeGuidedCharacterOrigin(character),
		currentEditState: summarizeCurrentEditState(character),
		values: createCharacterFormValuesFromInput(
			restoreCharacterCatalogSelectionsFromNames(character, catalog)
		),
		catalog,
		featCatalog: expandedContentCatalog.feats,
		spellCatalog: expandedContentCatalog.spells,
		equipmentCatalog: expandedContentCatalog.equipment
	};
};

function restoreCharacterCatalogSelectionsFromNames(
	character: Parameters<typeof createCharacterFormValuesFromInput>[0],
	catalog: Awaited<ReturnType<typeof listCharacterCreationCatalog>>
) {
	const species =
		character.speciesId && character.speciesId.length > 0
			? catalog.speciesOptions.find((option) => option.id === character.speciesId)
			: character.race
				? catalog.speciesOptions.find((option) => option.name === character.race)
				: undefined;
	const subspecies =
		character.subspeciesId && character.subspeciesId.length > 0
			? catalog.subspeciesOptions.find((option) => option.id === character.subspeciesId)
			: character.subrace && species
				? catalog.subspeciesOptions.find(
						(option) => option.name === character.subrace && option.speciesSlug === species.slug
					)
				: undefined;
	const characterClass =
		character.classId && character.classId.length > 0
			? catalog.classOptions.find((option) => option.id === character.classId)
			: character.className
				? catalog.classOptions.find((option) => option.name === character.className)
				: undefined;
	const subclass =
		character.subclassId && character.subclassId.length > 0
			? catalog.subclassOptions.find((option) => option.id === character.subclassId)
			: character.subclass && characterClass
				? catalog.subclassOptions.find(
						(option) => option.name === character.subclass && option.classSlug === characterClass.slug
					)
				: undefined;
	const background =
		character.backgroundId && character.backgroundId.length > 0
			? catalog.backgroundOptions.find((option) => option.id === character.backgroundId)
			: character.background
				? catalog.backgroundOptions.find((option) => option.name === character.background)
				: undefined;

	return {
		...character,
		speciesId: species?.id ?? character.speciesId,
		subspeciesId: subspecies?.id ?? character.subspeciesId,
		classId: characterClass?.id ?? character.classId,
		subclassId: subclass?.id ?? character.subclassId,
		backgroundId: background?.id ?? character.backgroundId
	};
}

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

		const rawFormData = Object.fromEntries(await request.formData());

		const existingCharacter = await getCharacterForUser(
			locals.supabase,
			locals.session.user.id,
			params.characterId
		);

		if (!existingCharacter) {
			return fail(400, {
				formError: 'That character could not be found.',
				fieldErrors: {},
				values: createCharacterFormValues(rawFormData)
			});
		}

		const guidedOrigin = isGuidedCharacterOrigin(existingCharacter.noteItems);
		const normalizedFormData = normalizeGuidedAdoptionFormData(rawFormData, {
			existingCharacter,
			guidedOrigin,
			adoptInventory: url.searchParams.get('adoptInventory') === '1',
			adoptNotes: url.searchParams.get('adoptNotes') === '1'
		});
		const parsed = characterCreateInputSchema.safeParse(normalizedFormData);
		const values = createCharacterFormValues(normalizedFormData);

		if (!parsed.success) {
			return fail(400, {
				formError: 'Please correct the highlighted character fields.',
				fieldErrors: parsed.error.flatten().fieldErrors,
				values
			});
		}

		try {
			const [guidedCatalog, expandedContentCatalog] = await Promise.all([
				listGuidedCharacterCatalog(locals.supabase),
				listExpandedContentCatalog(locals.supabase)
			]);

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
					existingCharacter: {
						...existingCharacter,
						guidedOrigin
					}
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
						contentProfileResult.reasonLines.length > 0 ||
						existingCharacter.contentProfileMetadata?.guidedBaseline
							? {
									reasonLines: contentProfileResult.reasonLines,
									guidedBaseline: existingCharacter.contentProfileMetadata?.guidedBaseline
								}
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
					updated: character.name,
					guided: guidedOrigin ? '1' : undefined
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

function normalizeGuidedAdoptionFormData(
	formData: Record<string, FormDataEntryValue>,
	params: {
		existingCharacter: Parameters<typeof createCharacterFormValuesFromInput>[0];
		guidedOrigin: boolean;
		adoptInventory: boolean;
		adoptNotes: boolean;
	}
) {
	if (!params.guidedOrigin || (!params.adoptInventory && !params.adoptNotes)) {
		return formData;
	}

	const baselineValues = createCharacterFormValuesFromInput(params.existingCharacter);
	const normalized = { ...formData };
	const restorableFields: Array<keyof typeof baselineValues> = [
		'name',
		'speciesId',
		'subspeciesId',
		'classId',
		'subclassId',
		'backgroundId',
		'story',
		'level',
		'strength',
		'dexterity',
		'constitution',
		'intelligence',
		'wisdom',
		'charisma',
		'maxHp',
		'currentHp',
		'temporaryHp',
		'armorClass',
		'initiative',
		'speed',
		'hitDice'
	];
	const restorableStructuredFields: Array<keyof typeof baselineValues> = [
		'attackItems',
		'spellItems',
		'featItems',
		'inventoryItems',
		'noteItems',
		'attacks',
		'spells',
		'notes'
	];

	for (const fieldName of restorableFields) {
		const submittedValue = normalized[fieldName];
		const baselineValue = baselineValues[fieldName];

		if (
			(typeof submittedValue !== 'string' || submittedValue.trim().length === 0) &&
			baselineValue.trim().length > 0
		) {
			normalized[fieldName] = baselineValue;
		}
	}

	for (const fieldName of restorableStructuredFields) {
		const submittedValue = normalized[fieldName];
		const baselineValue = baselineValues[fieldName];

		if (typeof submittedValue !== 'string') {
			continue;
		}

		const submittedTrimmed = submittedValue.trim();
		const baselineTrimmed = baselineValue.trim();

		if (baselineTrimmed.length === 0) {
			continue;
		}

		if (
			submittedTrimmed.length === 0 ||
			(submittedTrimmed === '[]' && baselineTrimmed !== '[]')
		) {
			normalized[fieldName] = baselineValue;
		}
	}

	return normalized;
}

function summarizeGuidedCharacterOrigin(character: {
	race?: string;
	subrace?: string;
	className?: string;
	subclass?: string;
	background?: string;
	contentMode: string;
	noteItems: Array<{ title: string; content: string }>;
	spellItems: Array<{ name: string; isPrepared: boolean }>;
}) {
	if (!isGuidedCharacterOrigin(character.noteItems)) {
		return null;
	}

	const grantsNote = character.noteItems.find((note) => note.title === GUIDED_BUILD_GRANTS_TITLE);
	const choicesNote = character.noteItems.find((note) => note.title === GUIDED_BUILD_CHOICES_TITLE);
	const lineageParts = [character.race, character.subrace].filter(Boolean);
	const classParts = [character.className, character.subclass].filter(Boolean);
	const spellOriginSummary = deriveGuidedSpellOriginSummary(
		character.noteItems,
		character.spellItems.map((spell) => ({
			name: spell.name,
			isPrepared: spell.isPrepared
		}))
	);

	return {
		lineageSummary: lineageParts.join(' / '),
		classSummary: classParts.join(' / '),
		backgroundSummary: character.background ?? '',
		statusSummary:
			character.contentMode === 'canon'
				? 'Still on the canonical guided path.'
				: 'This draft has diverged from the canonical guided path.',
		grantLines: splitGuidedNoteLines(grantsNote?.content),
		choiceLines: splitGuidedNoteLines(choicesNote?.content),
		grantedSpellNames: spellOriginSummary.grantedSpellNames,
		chosenSpellNames: spellOriginSummary.chosenSpellNames,
		preparedSpellNames: spellOriginSummary.preparedSpellNames
	};
}

function summarizeCurrentEditState(character: {
	contentMode: string;
	contentProfileMetadata?: {
		reasonLines?: string[];
	};
}) {
	const reasonLines = character.contentProfileMetadata?.reasonLines ?? [];
	const guidedDivergedSections = extractGuidedBaselineChangedSections(reasonLines);

	return {
		contentMode: character.contentMode,
		statusSummary:
			character.contentMode === 'canon'
				? 'This draft is still aligned with the canonical guided baseline.'
				: 'This draft currently lives on a custom path for the same ruleset.',
		reasonLines,
		guidedDivergedSections
	};
}

function buildCharacterDetailRedirect(
	characterId: string,
	params: {
		updated?: string;
		guided?: '1';
	}
) {
	const searchParams = new URLSearchParams();

	if (params.updated) {
		searchParams.set('updated', params.updated);
	}

	if (params.guided) {
		searchParams.set('guided', params.guided);
	}

	const query = searchParams.toString();
	return query.length > 0
		? `/app/characters/${characterId}?${query}`
		: `/app/characters/${characterId}`;
}

function buildGuidedEditHref(
	characterId: string,
	params: {
		adoptInventory?: boolean;
		adoptNotes?: boolean;
	}
) {
	const searchParams = new URLSearchParams({
		guided: '1'
	});

	if (params.adoptInventory) {
		searchParams.set('adoptInventory', '1');
	}

	if (params.adoptNotes) {
		searchParams.set('adoptNotes', '1');
	}

	return `/app/characters/${characterId}/edit?${searchParams.toString()}`;
}
