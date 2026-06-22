import { describe, expect, it } from 'vitest';
import { calculateAbilityModifier } from './ability-modifier';

describe('calculateAbilityModifier', () => {
	it('returns 0 for ability score 10', () => {
		expect(calculateAbilityModifier(10)).toBe(0);
	});

	it('returns 2 for ability score 14', () => {
		expect(calculateAbilityModifier(14)).toBe(2);
	});

	it('returns -1 for ability score 8', () => {
		expect(calculateAbilityModifier(8)).toBe(-1);
	});
});
