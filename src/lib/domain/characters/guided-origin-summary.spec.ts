import { describe, expect, it } from 'vitest';
import {
	extractChosenGuidedSpellNames,
	GUIDED_BUILD_CHOICES_TITLE,
	GUIDED_BUILD_GRANTS_TITLE,
	deriveGuidedSpellOriginSummary,
	isGuidedCharacterOrigin,
	splitGuidedNoteLines
} from './guided-origin-summary';

describe('guided-origin-summary', () => {
	it('detects guided-origin notes', () => {
		expect(
			isGuidedCharacterOrigin([
				{ title: GUIDED_BUILD_GRANTS_TITLE },
				{ title: 'General Notes' }
			])
		).toBe(true);

		expect(isGuidedCharacterOrigin([{ title: 'General Notes' }])).toBe(false);
	});

	it('splits guided note lines safely', () => {
		expect(splitGuidedNoteLines(' Line one \n\nLine two ')).toEqual(['Line one', 'Line two']);
		expect(splitGuidedNoteLines(undefined)).toEqual([]);
	});

	it('separates granted, chosen, and currently prepared spells', () => {
		const summary = deriveGuidedSpellOriginSummary(
			[
				{
					title: GUIDED_BUILD_CHOICES_TITLE,
					content:
						'Chosen spells: Light\nChosen spells: Mage Hand, Minor Illusion, Prestidigitation'
				}
			],
			[
				{ spellId: 'spell-1', name: 'Light', isPrepared: false },
				{ spellId: 'spell-2', name: 'Mage Hand', isPrepared: false },
				{ spellId: 'spell-3', name: 'Minor Illusion', isPrepared: false },
				{ spellId: 'spell-4', name: 'Prestidigitation', isPrepared: false },
				{ spellId: 'spell-5', name: 'Magic Missile', isPrepared: true },
				{ spellId: 'spell-6', name: 'Shield', isPrepared: true }
			]
		);

		expect(summary).toEqual({
			grantedSpellNames: ['Magic Missile', 'Shield'],
			chosenSpellNames: ['Light', 'Mage Hand', 'Minor Illusion', 'Prestidigitation'],
			preparedSpellNames: ['Magic Missile', 'Shield']
		});
	});

	it('dedupes repeated chosen spell rows without losing order', () => {
		const summary = deriveGuidedSpellOriginSummary(
			[
				{
					title: GUIDED_BUILD_CHOICES_TITLE,
					content: 'Chosen spells: Light, Light\nChosen spells: Shield'
				}
			],
			[
				{ spellId: 'spell-1', name: 'Light', isPrepared: false },
				{ spellId: 'spell-2', name: 'Shield', isPrepared: true }
			]
		);

		expect(summary.chosenSpellNames).toEqual(['Light', 'Shield']);
		expect(summary.grantedSpellNames).toEqual([]);
		expect(summary.preparedSpellNames).toEqual(['Shield']);
	});

	it('extracts chosen guided spell names from preserved note rows', () => {
		expect(
			extractChosenGuidedSpellNames([
				{
					title: GUIDED_BUILD_CHOICES_TITLE,
					content:
						'Chosen spells: Light\nChosen languages: Comun\nChosen spells: Shield, Magic Missile'
				}
			])
		).toEqual(['Light', 'Shield', 'Magic Missile']);
	});
});
