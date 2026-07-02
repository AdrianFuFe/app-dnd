import type { ContentMechanicSummary } from '$lib/types/content/mechanic-summary';

export function hasMechanicSummary(summary: ContentMechanicSummary): boolean {
	return (
		summary.spellcastingAbilities.length > 0 ||
		summary.languageGrants.length > 0 ||
		summary.proficiencyGrants.length > 0 ||
		summary.proficiencyChoices.length > 0
	);
}

export function formatMechanicSummaryLines(summary: ContentMechanicSummary): string[] {
	const lines: string[] = [];

	if (summary.spellcastingAbilities.length > 0) {
		lines.push(
			`Spellcasting ability: ${summary.spellcastingAbilities.map(humanizeToken).join(', ')}`
		);
	}

	if (summary.languageGrants.length > 0) {
		lines.push(
			`Languages: ${summary.languageGrants
				.map((grant) =>
					grant.kind === 'fixed'
						? humanizeToken(grant.language)
						: `Choose ${grant.count} ${pluralize('language', grant.count)}`
				)
				.join('; ')}`
		);
	}

	if (summary.proficiencyGrants.length > 0) {
		lines.push(
			`Proficiencies: ${summary.proficiencyGrants
				.map(
					(grant) =>
						`${humanizeToken(grant.proficiencyType)} ${humanizeToken(grant.value)}`
				)
				.join('; ')}`
		);
	}

	for (const choice of summary.proficiencyChoices) {
		lines.push(
			`Choose ${choice.count} ${humanizeToken(choice.proficiencyType)} ${pluralize('proficiency', choice.count)}: ${choice.options
				.map(humanizeToken)
				.join(', ')}`
		);
	}

	return lines;
}

function humanizeToken(value: string): string {
	return value
		.split(/[-_]/)
		.filter((part) => part.length > 0)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function pluralize(value: string, count: number): string {
	if (count === 1) {
		return value;
	}

	if (value.endsWith('y')) {
		return `${value.slice(0, -1)}ies`;
	}

	return `${value}s`;
}
