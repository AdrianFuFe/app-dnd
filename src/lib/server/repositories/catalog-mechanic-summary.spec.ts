import { describe, expect, it } from 'vitest';
import { summarizeCatalogMechanics } from './catalog-mechanic-summary';

describe('summarizeCatalogMechanics', () => {
	it('collects spellcasting, language, and proficiency summaries from mechanics', () => {
		expect(
			summarizeCatalogMechanics([
				{ type: 'spellcasting', ability: 'wisdom' },
				{ type: 'language', mode: 'fixed', language: 'comun' },
				{ type: 'choose_language', count: 2 },
				{ type: 'proficiency', proficiencyType: 'skill', value: 'insight' },
				{
					type: 'choose_proficiency',
					proficiencyType: 'skill',
					count: 2,
					options: ['arcana', 'history']
				}
			])
		).toEqual({
			spellcastingAbilities: ['wisdom'],
			languageGrants: [
				{ kind: 'fixed', language: 'comun' },
				{ kind: 'choice', count: 2 }
			],
			proficiencyGrants: [{ proficiencyType: 'skill', value: 'insight' }],
			proficiencyChoices: [
				{
					proficiencyType: 'skill',
					count: 2,
					options: ['arcana', 'history']
				}
			]
		});
	});

	it('returns an empty summary when mechanics do not validate', () => {
		expect(summarizeCatalogMechanics([{ type: 'spellcasting' }])).toEqual({
			spellcastingAbilities: [],
			languageGrants: [],
			proficiencyGrants: [],
			proficiencyChoices: []
		});
	});
});
