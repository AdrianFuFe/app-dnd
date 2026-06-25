import { describe, expect, it } from 'vitest';
import {
	abilityNames,
	characterCombatStatsSchema,
	characterCreateInputSchema
} from './character.schema.ts';

describe('characterCreateInputSchema', () => {
	it('parses a valid MVP character payload', () => {
		const result = characterCreateInputSchema.parse({
			name: 'Talia Stormstep',
			speciesId: '22222222-2222-4222-8222-222222222222',
			subspeciesId: '44444444-4444-4444-8444-444444444444',
			level: '3',
			race: 'Elf',
			subrace: 'High Elf',
			classId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
			className: 'Wizard',
			subclassId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
			subclass: 'Evocation',
			backgroundId: '55555555-5555-4555-8555-555555555555',
			background: 'Sage',
			story: 'An apprentice archivist turned adventurer.',
			strength: '8',
			dexterity: '14',
			constitution: '13',
			intelligence: '16',
			wisdom: '12',
			charisma: '10',
			maxHp: '20',
			currentHp: '18',
			temporaryHp: '0',
			armorClass: '13',
			initiative: '2',
			speed: '30',
			hitDice: '3d6',
			inventoryItems: JSON.stringify([
				{
					name: 'Spellbook',
					quantity: 1,
					description: 'Marked with field notes.',
					isEquipped: false
				}
			]),
			attacks: 'Quarterstaff +4 to hit, 1d6 bludgeoning',
			spells: 'Magic Missile, Shield, Detect Magic',
			notes: 'Looking for traces of a lost tower.'
		});

		expect(result.level).toBe(3);
		expect(result.subspeciesId).toBe('44444444-4444-4444-8444-444444444444');
		expect(result.subclassId).toBe('ffffffff-ffff-4fff-8fff-ffffffffffff');
		expect(result.intelligence).toBe(16);
		expect(result.currentHp).toBe(18);
		expect(result.inventoryItems[0]?.name).toBe('Spellbook');
		expect(result.spells).toContain('Shield');
	});

	it('normalizes blank optional fields to undefined', () => {
		const result = characterCreateInputSchema.parse({
			name: 'Bran',
			speciesId: '',
			subspeciesId: ' ',
			level: 1,
			race: ' ',
			subrace: '',
			classId: '',
			subclassId: ' ',
			className: '',
			subclass: ' ',
			backgroundId: '',
			background: '',
			story: ' ',
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
			speed: 30,
			hitDice: '',
			inventoryItems: '',
			attacks: ' ',
			spells: '',
			notes: ' '
		});

		expect(result.race).toBeUndefined();
		expect(result.subspeciesId).toBeUndefined();
		expect(result.subclassId).toBeUndefined();
		expect(result.story).toBeUndefined();
		expect(result.inventoryItems).toEqual([]);
		expect(result.attacks).toBeUndefined();
	});

	it('rejects levels outside the 1 to 20 range', () => {
		const result = characterCreateInputSchema.safeParse({
			name: 'Invalid Hero',
			level: 21,
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

		expect(result.success).toBe(false);
	});
});

describe('characterCombatStatsSchema', () => {
	it('rejects current hp values above max hp', () => {
		const result = characterCombatStatsSchema.safeParse({
			maxHp: 12,
			currentHp: 13,
			temporaryHp: 0,
			armorClass: 14,
			initiative: 2,
			speed: 30
		});

		expect(result.success).toBe(false);
	});
});

describe('abilityNames', () => {
	it('exposes the six core abilities in order', () => {
		expect(abilityNames).toEqual([
			'strength',
			'dexterity',
			'constitution',
			'intelligence',
			'wisdom',
			'charisma'
		]);
	});
});
