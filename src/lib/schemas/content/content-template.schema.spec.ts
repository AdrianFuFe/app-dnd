import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { backgroundFileSchema } from './background.schema.ts';
import { characterClassFileSchema } from './character-class.schema.ts';
import { featFileSchema } from './feat.schema.ts';
import { speciesFileSchema } from './species.schema.ts';
import { spellFileSchema } from './spell.schema.ts';
import { subspeciesFileSchema } from './subspecies.schema.ts';
import { subclassFileSchema } from './subclass.schema.ts';

function readJsonFile<T>(relativePath: string): T {
	const filePath = path.resolve(process.cwd(), relativePath);
	const fileContents = readFileSync(filePath, 'utf-8');

	return JSON.parse(fileContents) as T;
}

describe('content templates', () => {
	it('validates the background template file', () => {
		const template = readJsonFile<unknown>(
			'data/private-content-templates/background.template.json'
		);

		expect(() => backgroundFileSchema.parse(template)).not.toThrow();
	});

	it('validates the spell template file', () => {
		const template = readJsonFile<unknown>(
			'data/private-content-templates/spell.template.json'
		);

		expect(() => spellFileSchema.parse(template)).not.toThrow();
	});

	it('validates the feat template file', () => {
		const template = readJsonFile<unknown>('data/private-content-templates/feat.template.json');

		expect(() => featFileSchema.parse(template)).not.toThrow();
	});

	it('validates the subclass template file', () => {
		const template = readJsonFile<unknown>(
			'data/private-content-templates/subclass.template.json'
		);

		expect(() => subclassFileSchema.parse(template)).not.toThrow();
	});

	it('validates the species template file', () => {
		const template = readJsonFile<unknown>(
			'data/private-content-templates/species.template.json'
		);

		expect(() => speciesFileSchema.parse(template)).not.toThrow();
	});

	it('validates the SRD species starter file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/species.json');

		const parsed = speciesFileSchema.parse(file);

		expect(parsed.items).toHaveLength(2);
		expect(parsed.items[0]?.slug).toBe('elfo');
		expect(parsed.items[0]?.subspeciesSlugs).toEqual(['high-elf']);
		expect(parsed.items[1]?.slug).toBe('humano');
	});

	it('validates the SRD subspecies starter file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/subspecies.json');

		const parsed = subspeciesFileSchema.parse(file);

		expect(parsed.items).toHaveLength(1);
		expect(parsed.items[0]?.slug).toBe('high-elf');
		expect(parsed.items[0]?.speciesSlug).toBe('elfo');
	});

	it('validates the SRD classes starter file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/classes.json');

		const parsed = characterClassFileSchema.parse(file);

		expect(parsed.items).toHaveLength(2);
		expect(parsed.items[0]?.slug).toBe('guerrero');
		expect(parsed.items[1]?.slug).toBe('clerigo');
		expect(parsed.items[1]?.spellcastingAbility).toBe('wisdom');
		expect(parsed.items[1]?.mechanics).toContainEqual({
			type: 'spellcasting',
			ability: 'wisdom'
		});
	});

	it('validates the SRD backgrounds starter file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/backgrounds.json');

		const parsed = backgroundFileSchema.parse(file);

		expect(parsed.items).toHaveLength(2);
		expect(parsed.items[0]?.slug).toBe('acolyte');
		expect(parsed.items[1]?.slug).toBe('soldier');
	});

	it('validates the SRD spells starter file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/spells.json');

		const parsed = spellFileSchema.parse(file);

		expect(parsed.items).toHaveLength(10);
		expect(parsed.items[0]?.slug).toBe('bless');
		expect(parsed.items[9]?.slug).toBe('raise-dead');
	});

	it('validates the SRD feats starter file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/feats.json');

		const parsed = featFileSchema.parse(file);

		expect(parsed.items).toHaveLength(2);
		expect(parsed.items[0]?.slug).toBe('heavily-armored');
		expect(parsed.items[1]?.slug).toBe('resilient-wisdom');
		expect(parsed.items[1]?.mechanics).toContainEqual({
			type: 'proficiency',
			proficiencyType: 'saving_throw',
			value: 'wisdom'
		});
	});

	it('validates the SRD subclasses starter file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/subclasses.json');

		const parsed = subclassFileSchema.parse(file);

		expect(parsed.items).toHaveLength(1);
		expect(parsed.items[0]?.slug).toBe('life-domain');
		expect(parsed.items[0]?.classSlug).toBe('clerigo');
		expect(parsed.items[0]?.grantedSpellsByLevel).toHaveLength(5);
		expect(parsed.items[0]?.grantedSpellsByLevel[0]?.spellSlugs).toEqual([
			'bless',
			'cure-wounds'
		]);
	});
});

describe('content schema examples', () => {
	it('accepts a valid private spell entry', () => {
		const parsed = spellFileSchema.parse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'spell',
			items: [
				{
					slug: 'orbe-de-prueba',
					name: 'Orbe de Prueba',
					level: 1,
					school: 'evocation',
					summary: 'Conjuro de prueba para validacion.',
					visibility: 'private',
					mechanics: [{ type: 'note', text: 'Pendiente de automatizar.' }]
				}
			]
		});

		expect(parsed.items).toHaveLength(1);
	});

	it('accepts a valid private feat entry', () => {
		const parsed = featFileSchema.parse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'feat',
			items: [
				{
					slug: 'mente-disciplinada',
					name: 'Mente Disciplinada',
					summary: 'Dote privada de ejemplo para validacion.',
					visibility: 'private',
					prerequisites: ['level-4'],
					mechanics: [{ type: 'ability_bonus', ability: 'intelligence', value: 1 }]
				}
			]
		});

		expect(parsed.items[0]?.prerequisites).toEqual(['level-4']);
	});

	it('rejects an invalid slug in content items', () => {
		const result = backgroundFileSchema.safeParse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'background',
			items: [
				{
					slug: 'Slug Invalido',
					name: 'Trasfondo invalido'
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects subclass features outside level range', () => {
		const result = subclassFileSchema.safeParse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'subclass',
			items: [
				{
					slug: 'subclase-prueba',
					name: 'Subclase de Prueba',
					classSlug: 'fighter',
					features: [
						{
							level: 21,
							name: 'Rasgo imposible',
							mechanics: []
						}
					]
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('accepts subclass granted spells by level', () => {
		const parsed = subclassFileSchema.parse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'subclass',
			items: [
				{
					slug: 'subclase-prueba',
					name: 'Subclase de Prueba',
					classSlug: 'clerigo',
					grantedSpellsByLevel: [
						{
							level: 1,
							spellSlugs: ['bless', 'cure-wounds']
						}
					]
				}
			]
		});

		expect(parsed.items[0]?.grantedSpellsByLevel[0]?.spellSlugs).toContain('bless');
	});

	it('accepts a valid species entry', () => {
		const parsed = speciesFileSchema.parse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'species',
			items: [
				{
					slug: 'humano',
					name: 'Humano',
					size: 'medium',
					baseSpeed: 30,
					languages: ['comun'],
					mechanics: [{ type: 'choose_language', count: 1 }]
				}
			]
		});

		expect(parsed.items[0]?.slug).toBe('humano');
	});

	it('accepts a valid subspecies entry', () => {
		const parsed = subspeciesFileSchema.parse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'subspecies',
			items: [
				{
					slug: 'high-elf',
					name: 'High Elf',
					speciesSlug: 'elfo',
					mechanics: [{ type: 'ability_bonus', ability: 'intelligence', value: 1 }]
				}
			]
		});

		expect(parsed.items[0]?.speciesSlug).toBe('elfo');
	});

	it('accepts a valid character class entry', () => {
		const parsed = characterClassFileSchema.parse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'character-class',
			items: [
				{
					slug: 'barbaro',
					name: 'Barbaro',
					hitDie: 12,
					primaryAbilities: ['strength'],
					savingThrowProficiencies: ['strength', 'constitution'],
					startingEquipment: ['arma marcial', 'paquete de explorador'],
					progression: [{ level: 1, features: ['furia'] }]
				}
			]
		});

		expect(parsed.items[0]?.hitDie).toBe(12);
	});
});
