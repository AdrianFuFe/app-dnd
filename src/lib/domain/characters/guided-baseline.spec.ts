import { describe, expect, it } from 'vitest';
import {
	arraySignature,
	attackBaselineSignature,
	createCharacterGuidedBaselineSnapshot,
	extractGuidedEquipmentNamesFromNotes,
	guidedBaselineAttacksAreAligned,
	guidedBaselineEquipmentNames,
	guidedBaselineIncludesInventoryItem,
	guidedBaselineNotesAreAligned,
	guidedBaselineSpellsAreAligned,
	inventoryBaselineSignature,
	noteBaselineSignature,
	spellBaselineSignature
} from './guided-baseline';

describe('guided-baseline', () => {
	it('creates stable signatures for baseline comparisons', () => {
		expect(
			attackBaselineSignature({
				equipmentId: 'mace',
				name: 'Mace',
				attackBonus: '+4',
				damage: '1d6',
				damageType: 'Bludgeoning',
				range: '5 ft.',
				description: 'Simple melee weapon'
			})
		).toBe(
			attackBaselineSignature({
				equipmentId: ' mace ',
				name: ' mace ',
				attackBonus: ' +4 ',
				damage: '1d6',
				damageType: 'bludgeoning',
				range: '5 ft.',
				description: 'simple melee weapon'
			})
		);

		expect(
			spellBaselineSignature({
				spellId: 'light',
				name: 'Light',
				level: 0,
				school: 'Evocation',
				castingTime: '1 action',
				range: 'Touch',
				components: 'V, M',
				duration: '1 hour',
				description: 'A light appears.',
				isPrepared: false
			})
		).toBe(
			spellBaselineSignature({
				spellId: ' light ',
				name: ' light ',
				level: '0',
				school: 'evocation',
				castingTime: '1 action',
				range: 'touch',
				components: 'v, m',
				duration: '1 hour',
				description: 'a light appears.',
				isPrepared: false
			})
		);

		expect(
			inventoryBaselineSignature({
				equipmentId: 'mace',
				name: 'Mace',
				quantity: 1,
				description: 'Holy symbol carved into the grip.',
				weight: 4,
				value: '5 gp',
				isEquipped: true
			})
		).toBe(
			inventoryBaselineSignature({
				equipmentId: 'mace',
				name: ' mace ',
				quantity: '1',
				description: 'holy symbol carved into the grip.',
				weight: '4',
				value: '5 gp',
				isEquipped: true
			})
		);

		expect(
			noteBaselineSignature({
				title: 'Guided build grants',
				content: 'Language: Comun'
			})
		).toBe(
			noteBaselineSignature({
				title: ' guided build grants ',
				content: ' language: comun '
			})
		);
	});

	it('detects alignment and inclusion against a persisted baseline snapshot', () => {
		const baseline = createCharacterGuidedBaselineSnapshot({
			attackItems: [
				{ equipmentId: 'mace', name: 'Mace', attackBonus: '+4', damage: '1d6' }
			],
			spellItems: [
				{ spellId: 'light', name: 'Light', level: 0, isPrepared: false },
				{ spellId: 'shield', name: 'Shield', level: 1, isPrepared: true }
			],
			inventoryItems: [
				{ equipmentId: 'mace', name: 'Mace', quantity: 1, isEquipped: true }
			],
			noteItems: [{ title: 'Guided build grants', content: 'Language: Comun' }]
		});

		expect(
			guidedBaselineAttacksAreAligned(
				[{ equipmentId: 'mace', name: 'Mace', attackBonus: '+4', damage: '1d6' }],
				baseline
			)
		).toBe(true);

		expect(
			guidedBaselineSpellsAreAligned(
				[
					{ spellId: 'shield', name: 'Shield', level: 1, isPrepared: true },
					{ spellId: 'light', name: 'Light', level: 0, isPrepared: false }
				],
				baseline
			)
		).toBe(true);

		expect(
			guidedBaselineNotesAreAligned(
				[{ title: 'Guided build grants', content: 'Language: Comun' }],
				baseline
			)
		).toBe(true);

		expect(
			guidedBaselineIncludesInventoryItem(baseline, {
				equipmentId: 'mace',
				name: 'Mace',
				quantity: '1',
				isEquipped: true
			})
		).toBe(true);
	});

	it('extracts equipment names from notes and from baseline inventory', () => {
		expect(
			[...extractGuidedEquipmentNamesFromNotes([
				{
					content:
						'Chosen equipment: Mace, Shield\nStarting equipment: 2x Torch\nStarting equipment: Choose 1: Chain Mail, Scale Mail'
				}
			])]
		).toEqual(['mace', 'shield', 'torch', 'chain mail', 'scale mail']);

		const baseline = createCharacterGuidedBaselineSnapshot({
			attackItems: [],
			spellItems: [],
			inventoryItems: [
				{ name: 'Mace', quantity: 1, isEquipped: true },
				{ name: 'Shield', quantity: 1, isEquipped: false }
			],
			noteItems: []
		});

		expect([...guidedBaselineEquipmentNames(baseline)]).toEqual(['mace', 'shield']);
	});

	it('sorts array signatures so order changes do not count as divergence', () => {
		expect(arraySignature(['b', 'a', 'c'])).toBe(arraySignature(['c', 'b', 'a']));
	});
});
