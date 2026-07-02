import { describe, expect, it } from 'vitest';
import { formatMechanicSummaryLines, hasMechanicSummary } from './mechanic-summary-display';

describe('hasMechanicSummary', () => {
	it('returns false when no derived mechanics are present', () => {
		expect(
			hasMechanicSummary({
				spellcastingAbilities: [],
				languageGrants: [],
				proficiencyGrants: [],
				proficiencyChoices: []
			})
		).toBe(false);
	});

	it('returns true when any derived mechanic is present', () => {
		expect(
			hasMechanicSummary({
				spellcastingAbilities: ['wisdom'],
				languageGrants: [],
				proficiencyGrants: [],
				proficiencyChoices: []
			})
		).toBe(true);
	});
});

describe('formatMechanicSummaryLines', () => {
	it('formats readable summary lines for the live form panels', () => {
		expect(
			formatMechanicSummaryLines({
				spellcastingAbilities: ['intelligence'],
				languageGrants: [
					{ kind: 'fixed', language: 'comun' },
					{ kind: 'choice', count: 1 }
				],
				proficiencyGrants: [
					{ proficiencyType: 'weapon', value: 'longsword' },
					{ proficiencyType: 'saving_throw', value: 'wisdom' }
				],
				proficiencyChoices: [
					{
						proficiencyType: 'skill',
						count: 2,
						options: ['arcana', 'history']
					}
				]
			})
		).toEqual([
			'Spellcasting ability: Intelligence',
			'Languages: Comun; Choose 1 language',
			'Proficiencies: Weapon Longsword; Saving Throw Wisdom',
			'Choose 2 Skill proficiencies: Arcana, History'
		]);
	});
});
