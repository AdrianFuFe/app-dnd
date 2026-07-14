import type {
	CharacterGuidedBaselineSnapshot,
	CharacterNoteItem,
	CharacterSpellItem
} from '$lib/types/domain/character';

export const GUIDED_BUILD_GRANTS_TITLE = 'Guided build grants';
export const GUIDED_BUILD_CHOICES_TITLE = 'Guided build choices';
export const GUIDED_FOLLOW_UP_CHOICES_TITLE = 'Guided follow-up choices';
const GUIDED_CHOSEN_SPELLS_PREFIX = 'Chosen spells: ';

export type GuidedSpellOriginSummary = {
	grantedSpellNames: string[];
	chosenSpellNames: string[];
	preparedSpellNames: string[];
};

export type GuidedOriginSummary = {
	lineageSummary: string;
	classSummary: string;
	backgroundSummary: string;
	statusSummary: string;
	grantLines: string[];
	choiceLines: string[];
	grantedSpellNames: string[];
	chosenSpellNames: string[];
	preparedSpellNames: string[];
};

export function isGuidedCharacterOrigin(noteItems: Array<Pick<CharacterNoteItem, 'title'>>): boolean {
	return noteItems.some(
		(note) =>
			note.title === GUIDED_BUILD_GRANTS_TITLE || note.title === GUIDED_BUILD_CHOICES_TITLE
	);
}

export function splitGuidedNoteLines(value: string | undefined): string[] {
	if (!value) {
		return [];
	}

	return value
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}

export function deriveGuidedSpellOriginSummary(
	noteItems: Array<Pick<CharacterNoteItem, 'title' | 'content'>>,
	spellItems: CharacterSpellItem[]
): GuidedSpellOriginSummary {
	const chosenSpellNames = extractChosenGuidedSpellNames(noteItems);
	const chosenSpellLookup = new Set(chosenSpellNames.map(normalizeGuidedSpellName));
	const grantedSpellNames = dedupeByNormalizedName(
		spellItems
			.map((item) => item.name.trim())
			.filter((name) => name.length > 0)
			.filter((name) => !chosenSpellLookup.has(normalizeGuidedSpellName(name)))
	);
	const preparedSpellNames = dedupeByNormalizedName(
		spellItems
			.filter((item) => item.isPrepared)
			.map((item) => item.name.trim())
			.filter((name) => name.length > 0)
	);

	return {
		grantedSpellNames,
		chosenSpellNames,
		preparedSpellNames
	};
}

export function summarizeGuidedCharacterOrigin(character: {
	race?: string;
	subrace?: string;
	className?: string;
	subclass?: string;
	background?: string;
	contentMode: string;
	noteItems: Array<{ title: string; content: string }>;
	spellItems: Array<{ name: string; isPrepared: boolean }>;
	contentProfileMetadata?: {
		guidedBaseline?: Pick<CharacterGuidedBaselineSnapshot, 'identity' | 'noteItems' | 'spellItems'>;
	};
}): GuidedOriginSummary | null {
	const guidedBaseline = character.contentProfileMetadata?.guidedBaseline;
	const originNoteItems = guidedBaseline?.noteItems ?? character.noteItems;
	const originSpellItems = guidedBaseline?.spellItems ?? character.spellItems;

	if (!isGuidedCharacterOrigin(originNoteItems)) {
		return null;
	}

	const grantsNote = originNoteItems.find((note) => note.title === GUIDED_BUILD_GRANTS_TITLE);
	const choicesNote = originNoteItems.find((note) => note.title === GUIDED_BUILD_CHOICES_TITLE);
	const identity = guidedBaseline?.identity;
	const lineageParts = [character.race, character.subrace].some(Boolean)
		? [character.race, character.subrace].filter(Boolean)
		: [identity?.race, identity?.subrace].filter(Boolean);
	const classParts = [character.className, character.subclass].some(Boolean)
		? [character.className, character.subclass].filter(Boolean)
		: [identity?.className, identity?.subclass].filter(Boolean);
	const backgroundSummary = character.background || identity?.background || '';
	const spellOriginSummary = deriveGuidedSpellOriginSummary(
		originNoteItems,
		originSpellItems.map((spell) => ({
			name: spell.name,
			isPrepared: spell.isPrepared
		}))
	);

	return {
		lineageSummary: lineageParts.join(' / '),
		classSummary: classParts.join(' / '),
		backgroundSummary,
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

export function extractChosenGuidedSpellNames(
	noteItems: Array<Pick<CharacterNoteItem, 'title' | 'content'>>
) {
	const names: string[] = [];

	for (const note of noteItems) {
		if (note.title !== GUIDED_BUILD_CHOICES_TITLE) {
			continue;
		}

		for (const line of splitGuidedNoteLines(note.content)) {
			if (!line.startsWith(GUIDED_CHOSEN_SPELLS_PREFIX)) {
				continue;
			}

			for (const part of line.slice(GUIDED_CHOSEN_SPELLS_PREFIX.length).split(',')) {
				const name = part.trim();
				if (name.length > 0) {
					names.push(name);
				}
			}
		}
	}

	return dedupeByNormalizedName(names);
}

function dedupeByNormalizedName(names: string[]) {
	const deduped: string[] = [];
	const seen = new Set<string>();

	for (const name of names) {
		const normalized = normalizeGuidedSpellName(name);
		if (!normalized || seen.has(normalized)) {
			continue;
		}

		seen.add(normalized);
		deduped.push(name);
	}

	return deduped;
}

function normalizeGuidedSpellName(value: string) {
	return value.trim().toLowerCase();
}
