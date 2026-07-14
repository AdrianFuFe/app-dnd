import { error, fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listExpandedContentCatalog } from '$lib/server/repositories/catalog';
import { deleteCharacter, getCharacterForUser } from '$lib/server/repositories/characters';
import {
	deriveGuidedSpellOriginSummary,
	GUIDED_BUILD_CHOICES_TITLE,
	GUIDED_BUILD_GRANTS_TITLE,
	isGuidedCharacterOrigin,
	splitGuidedNoteLines
} from '$lib/domain/characters/guided-origin-summary';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.session) {
		throw redirect(302, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	if (!locals.supabase) {
		throw error(500, 'Supabase is not configured yet.');
	}

	const [character, expandedContentCatalog] = await Promise.all([
		getCharacterForUser(locals.supabase, locals.session.user.id, params.characterId),
		listExpandedContentCatalog(locals.supabase)
	]);

	if (!character) {
		throw error(404, 'Character not found.');
	}

	return {
		character,
		equipmentCatalog: expandedContentCatalog.equipment,
		createdName: url.searchParams.get('created'),
		guidedHandoff:
			url.searchParams.get('guided') === '1' || isGuidedCharacterOrigin(character.noteItems),
		guidedOriginSummary: summarizeGuidedCharacterOrigin(character),
		updatedName: url.searchParams.get('updated')
	};
};

export const actions: Actions = {
	delete: async ({ locals, params, request, url }) => {
		if (!locals.session) {
			throw redirect(302, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
		}

		if (!locals.supabase) {
			return fail(500, {
				formError: 'Supabase is not configured yet.'
			});
		}

		try {
			const existingCharacter = await getCharacterForUser(
				locals.supabase,
				locals.session.user.id,
				params.characterId
			);

			if (!existingCharacter) {
				return fail(404, {
					formError: 'That character could not be found.'
				});
			}

			const formData = await request.formData();
			const confirmDelete = formData.get('confirmDelete');
			const confirmNameEntry = formData.get('confirmName');
			const confirmName = typeof confirmNameEntry === 'string' ? confirmNameEntry.trim() : '';

			if (confirmDelete !== 'on' || confirmName !== existingCharacter.name) {
				return fail(400, {
					formError: 'Confirm the delete checkbox and type the exact character name.'
				});
			}

			const character = await deleteCharacter(
				locals.supabase,
				locals.session.user.id,
				params.characterId
			);
			const deletedName = encodeURIComponent(character.name);

			throw redirect(303, `/app/characters?deleted=${deletedName}`);
		} catch (caught) {
			if (isRedirect(caught)) {
				throw caught;
			}

			const isMissingCharacter =
				caught instanceof Error &&
				caught.message ===
					`Character ${params.characterId} was not found for user ${locals.session.user.id}`;

			return fail(isMissingCharacter ? 404 : 500, {
				formError: isMissingCharacter
					? 'That character could not be found.'
					: 'The character could not be deleted. Please try again.'
			});
		}
	}
};

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
