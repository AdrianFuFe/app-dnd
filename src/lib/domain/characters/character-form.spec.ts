import { describe, expect, it } from 'vitest';
import { createCharacterFormValues, createCharacterFormValuesFromInput } from './character-form';

describe('createCharacterFormValues', () => {
	it('serializes numeric fields to strings for form rendering', () => {
		const values = createCharacterFormValues({
			name: 'Rhea',
			level: 4,
			strength: 12,
			maxHp: 27,
			temporaryHp: 0
		});

		expect(values.name).toBe('Rhea');
		expect(values.level).toBe('4');
		expect(values.strength).toBe('12');
		expect(values.maxHp).toBe('27');
		expect(values.temporaryHp).toBe('0');
		expect(values.notes).toBe('');
	});
});

describe('createCharacterFormValuesFromInput', () => {
	it('keeps optional blank sections empty while preserving required defaults', () => {
		const values = createCharacterFormValuesFromInput({
			name: 'New Character',
			level: 1,
			strength: 10,
			dexterity: 10,
			constitution: 10,
			intelligence: 10,
			wisdom: 10,
			charisma: 10,
			maxHp: 1,
			currentHp: 1,
			temporaryHp: 0,
			armorClass: 10,
			initiative: 0,
			speed: 30
		});

		expect(values.name).toBe('New Character');
		expect(values.level).toBe('1');
		expect(values.race).toBe('');
		expect(values.story).toBe('');
		expect(values.notes).toBe('');
	});
});
