import { gameMechanicsSchema } from '$lib/schemas/content/game-mechanics.schema';
import type { GameMechanic } from '$lib/types/domain/game-mechanics';
import type {
	ContentMechanicSummary,
	LanguageGrantSummary,
	ProficiencyChoiceSummary,
	ProficiencyGrantSummary
} from '$lib/types/content/mechanic-summary';

function createEmptySummary(): ContentMechanicSummary {
	return {
		spellcastingAbilities: [],
		languageGrants: [],
		proficiencyGrants: [],
		proficiencyChoices: []
	};
}

function pushUniqueLanguageGrant(
	grants: LanguageGrantSummary[],
	grant: LanguageGrantSummary
): void {
	if (
		grants.some((entry) =>
			entry.kind === 'fixed' && grant.kind === 'fixed'
				? entry.language === grant.language
				: entry.kind === 'choice' && grant.kind === 'choice'
					? entry.count === grant.count
					: false
		)
	) {
		return;
	}

	grants.push(grant);
}

function pushUniqueProficiencyGrant(
	grants: ProficiencyGrantSummary[],
	grant: ProficiencyGrantSummary
): void {
	if (
		grants.some(
			(entry) =>
				entry.proficiencyType === grant.proficiencyType && entry.value === grant.value
		)
	) {
		return;
	}

	grants.push(grant);
}

function pushUniqueProficiencyChoice(
	choices: ProficiencyChoiceSummary[],
	choice: ProficiencyChoiceSummary
): void {
	if (
		choices.some(
			(entry) =>
				entry.proficiencyType === choice.proficiencyType &&
				entry.count === choice.count &&
				entry.options.length === choice.options.length &&
				entry.options.every((option, index) => option === choice.options[index])
		)
	) {
		return;
	}

	choices.push(choice);
}

function normalizeMechanics(mechanics: unknown): GameMechanic[] {
	const parsed = gameMechanicsSchema.safeParse(mechanics);
	return parsed.success ? parsed.data : [];
}

export function summarizeCatalogMechanics(mechanics: unknown): ContentMechanicSummary {
	const summary = createEmptySummary();

	for (const mechanic of normalizeMechanics(mechanics)) {
		if (
			mechanic.type === 'spellcasting' &&
			!summary.spellcastingAbilities.includes(mechanic.ability)
		) {
			summary.spellcastingAbilities.push(mechanic.ability);
			continue;
		}

		if (mechanic.type === 'language') {
			pushUniqueLanguageGrant(summary.languageGrants, {
				kind: 'fixed',
				language: mechanic.language
			});
			continue;
		}

		if (mechanic.type === 'choose_language') {
			pushUniqueLanguageGrant(summary.languageGrants, {
				kind: 'choice',
				count: mechanic.count
			});
			continue;
		}

		if (mechanic.type === 'proficiency') {
			pushUniqueProficiencyGrant(summary.proficiencyGrants, {
				proficiencyType: mechanic.proficiencyType,
				value: mechanic.value
			});
			continue;
		}

		if (mechanic.type === 'choose_proficiency') {
			pushUniqueProficiencyChoice(summary.proficiencyChoices, {
				proficiencyType: mechanic.proficiencyType,
				count: mechanic.count,
				options: [...mechanic.options]
			});
		}
	}

	return summary;
}
