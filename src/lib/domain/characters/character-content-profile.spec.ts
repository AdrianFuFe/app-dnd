import { describe, expect, it } from 'vitest';
import {
	createCharacterManualOverride,
	deriveCharacterContentProfile,
	summarizeCharacterCustomizationReasons
} from './character-content-profile';

describe('deriveCharacterContentProfile', () => {
	it('keeps canon mode when linked content stays canonical inside one ruleset', () => {
		expect(
			deriveCharacterContentProfile({
				baseRulesetCode: 'dnd-2014-srd',
				linkedContentSelections: [
					{
						entityType: 'species',
						entityId: 'species-1',
						entityName: 'Elf',
						rulesetCode: 'dnd-2014-srd',
						contentMode: 'canon'
					},
					{
						entityType: 'class',
						entityId: 'class-1',
						entityName: 'Cleric',
						rulesetCode: 'dnd-2014-srd',
						contentMode: 'canon'
					}
				]
			})
		).toEqual({
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'canon',
			customizationReasons: []
		});
	});

	it('switches to custom mode when linked content is custom for the same ruleset', () => {
		expect(
			deriveCharacterContentProfile({
				baseRulesetCode: 'dnd-2014-srd',
				linkedContentSelections: [
					{
						entityType: 'background',
						entityId: 'background-1',
						entityName: 'Sage Variant',
						rulesetCode: 'dnd-2014-srd',
						contentMode: 'custom'
					}
				]
			})
		).toEqual({
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'custom',
			customizationReasons: [
				{
					type: 'linked-custom-content',
					entityType: 'background',
					entityId: 'background-1',
					entityName: 'Sage Variant'
				}
			]
		});
	});

	it('rejects linked content from a different ruleset', () => {
		expect(() =>
			deriveCharacterContentProfile({
				baseRulesetCode: 'dnd-2014-srd',
				linkedContentSelections: [
					{
						entityType: 'species',
						entityId: 'species-1',
						entityName: 'Custom Species',
						rulesetCode: 'custom',
						contentMode: 'custom'
					}
				]
			})
		).toThrow(
			'Selected species "Custom Species" does not match the dnd-2014-srd ruleset.'
		);
	});

	it('switches to custom mode when manual overrides are present', () => {
		expect(
			deriveCharacterContentProfile({
				baseRulesetCode: 'dnd-2014-srd',
				linkedContentSelections: [],
				manualOverrides: [createCharacterManualOverride('armor_class')]
			})
		).toEqual({
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'custom',
			customizationReasons: [{ type: 'manual-override', field: 'armor_class' }]
		});
	});

	it('summarizes customization reasons for preview surfaces', () => {
		expect(
			summarizeCharacterCustomizationReasons([
				{
					type: 'linked-custom-content',
					entityType: 'background',
					entityId: 'background-1',
					entityName: 'Sage Variant'
				},
				{
					type: 'manual-override',
					field: 'armor_class'
				}
			])
		).toEqual(['Uses custom background: Sage Variant', 'Manual override: Armor Class']);
	});
});
