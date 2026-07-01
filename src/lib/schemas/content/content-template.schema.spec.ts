import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { backgroundFileSchema } from './background.schema.ts';
import { characterClassFileSchema } from './character-class.schema.ts';
import { equipmentFileSchema } from './equipment.schema.ts';
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

	it('validates the equipment template file', () => {
		const template = readJsonFile<unknown>(
			'data/private-content-templates/equipment.template.json'
		);

		expect(() => equipmentFileSchema.parse(template)).not.toThrow();
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
		expect(parsed.items[0]?.languages[0]).toEqual({ type: 'fixed', language: 'comun' });
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
		expect(parsed.items[0]?.startingEquipment[0]).toEqual({ type: 'item', id: 'chain-mail' });
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
		expect(parsed.items[0]?.languages[0]).toEqual({ type: 'choice', count: 2, scope: 'any' });
		expect(parsed.items[0]?.equipment[0]).toEqual({ type: 'item', id: 'holy-symbol' });
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

	it('validates the SRD equipment starter file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/equipment.json');

		const parsed = equipmentFileSchema.parse(file);

		expect(parsed.items).toHaveLength(33);
		expect(parsed.items[0]?.slug).toBe('any-simple-weapon');
		expect(parsed.items[9]?.damageType).toBe('slashing');
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
					prerequisites: ['level:4', 'ability:intelligence:13', 'class:clerigo'],
					mechanics: [{ type: 'ability_bonus', ability: 'intelligence', value: 1 }]
				}
			]
		});

		expect(parsed.items[0]?.prerequisites).toEqual([
			'level:4',
			'ability:intelligence:13',
			'class:clerigo'
		]);
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

	it('accepts explicit subclass feature ids', () => {
		const parsed = subclassFileSchema.parse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'subclass',
			items: [
				{
					slug: 'subclase-prueba',
					name: 'Subclase de Prueba',
					classSlug: 'clerigo',
					features: [
						{
							level: 2,
							featureId: 'preserve-life',
							name: 'Channel Divinity: Preserve Life',
							mechanics: []
						}
					]
				}
			]
		});

		expect(parsed.items[0]?.features[0]?.featureId).toBe('preserve-life');
	});

	it('rejects invalid feat prerequisite formats', () => {
		const result = featFileSchema.safeParse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'feat',
			items: [
				{
					slug: 'dote-prueba',
					name: 'Dote de Prueba',
					prerequisites: ['medium-armor proficiency']
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects unknown proficiency slugs in feat prerequisites', () => {
		const result = featFileSchema.safeParse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'feat',
			items: [
				{
					slug: 'dote-prueba',
					name: 'Dote de Prueba',
					prerequisites: ['proficiency:skill:animal-hndling']
				}
			]
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toContain('Unknown skill proficiency slug');
	});

	it('rejects unknown spell schools in spell entries', () => {
		const result = spellFileSchema.safeParse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'spell',
			items: [
				{
					slug: 'orbe-de-vacio',
					name: 'Orbe de Vacio',
					level: 2,
					school: 'void'
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid spell component strings', () => {
		const result = spellFileSchema.safeParse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'spell',
			items: [
				{
					slug: 'conjuro-prueba',
					name: 'Conjuro de Prueba',
					level: 1,
					school: 'evocation',
					components: 'V, focus'
				}
			]
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toContain(
			'Use spell components as a comma-separated list of V, S, and M'
		);
	});

	it('rejects spell materials text without an M component', () => {
		const result = spellFileSchema.safeParse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'spell',
			items: [
				{
					slug: 'conjuro-prueba',
					name: 'Conjuro de Prueba',
					level: 1,
					school: 'evocation',
					components: 'V, S',
					materials: 'A tiny bell.'
				}
			]
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toContain(
			'Materials text is only allowed when spell components include M'
		);
	});

	it('rejects spell M components without materials text', () => {
		const result = spellFileSchema.safeParse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'spell',
			items: [
				{
					slug: 'conjuro-prueba',
					name: 'Conjuro de Prueba',
					level: 1,
					school: 'evocation',
					components: 'V, M'
				}
			]
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toContain(
			'Provide materials text when spell components include M'
		);
	});

	it('accepts spell materials text when components include M', () => {
		const result = spellFileSchema.safeParse({
			schemaVersion: 1,
			source: 'user-private',
			contentType: 'spell',
			items: [
				{
					slug: 'conjuro-prueba',
					name: 'Conjuro de Prueba',
					level: 1,
					school: 'evocation',
					components: 'V, S, M',
					materials: 'A tiny bell.'
				}
			]
		});

		expect(result.success).toBe(true);
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
					languages: [{ type: 'fixed', language: 'comun' }],
					mechanics: [{ type: 'choose_language', count: 1 }]
				}
			]
		});

		expect(parsed.items[0]?.slug).toBe('humano');
	});

	it('rejects unknown language slugs in structured content files', () => {
		const result = speciesFileSchema.safeParse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'species',
			items: [
				{
					slug: 'humano',
					name: 'Humano',
					languages: [{ type: 'fixed', language: 'common' }]
				}
			]
		});

		expect(result.success).toBe(false);
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

	it('rejects invalid legacy language strings in structured content files', () => {
		const result = backgroundFileSchema.safeParse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'background',
			items: [
				{
					slug: 'acolyte',
					name: 'Acolyte',
					languages: ['choose:any:2']
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid proficiency slugs in background entries', () => {
		const result = backgroundFileSchema.safeParse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'background',
			items: [
				{
					slug: 'acolyte',
					name: 'Acolyte',
					skillProficiencies: ['animal handling']
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid proficiency slugs in mechanics entries', () => {
		const result = backgroundFileSchema.safeParse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'background',
			items: [
				{
					slug: 'soldier',
					name: 'Soldier',
					mechanics: [
						{ type: 'proficiency', proficiencyType: 'tool', value: 'vehicle-air' },
						{
							type: 'choose_proficiency',
							proficiencyType: 'skill',
							count: 1,
							options: ['animal-hndling']
						}
					]
				}
			]
		});

		expect(result.success).toBe(false);
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
					startingEquipment: [
						{ type: 'item', id: 'greataxe' },
						{ type: 'choice', options: ['explorers-pack', 'dungeoneers-pack'] }
					],
					progression: [{ level: 1, features: ['furia'] }]
				}
			]
		});

		expect(parsed.items[0]?.hitDie).toBe(12);
	});

	it('accepts a valid background entry with structured equipment', () => {
		const parsed = backgroundFileSchema.parse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'background',
			items: [
				{
					slug: 'artesano',
					name: 'Artesano',
					equipment: [
						{ type: 'item', id: 'travelers-clothes' },
						{ type: 'item', id: 'artisan-tools' },
						{ type: 'choice', options: ['belt-pouch', 'satchel'], note: 'Contains 5 gp.' }
					]
				}
			]
		});

		expect(parsed.items[0]?.equipment).toHaveLength(3);
	});

	it('rejects unknown damage types in equipment entries', () => {
		const result = equipmentFileSchema.safeParse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'equipment',
			items: [
				{
					slug: 'shadow-blade',
					name: 'Shadow Blade',
					category: 'weapon',
					damage: '1d8',
					damageType: 'shadow'
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid ability names in character class ability fields', () => {
		const result = characterClassFileSchema.safeParse({
			schemaVersion: 1,
			source: 'srd-5-1',
			contentType: 'character-class',
			items: [
				{
					slug: 'barbaro',
					name: 'Barbaro',
					hitDie: 12,
					primaryAbilities: ['luck'],
					savingThrowProficiencies: ['strength', 'constitution']
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid proficiency slugs in character class entries', () => {
		const result = characterClassFileSchema.safeParse({
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
					armorProficiencies: ['light armor']
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid skill choice option slugs in character class entries', () => {
		const result = characterClassFileSchema.safeParse({
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
					skillChoices: {
						count: 2,
						options: ['animal handling']
					}
				}
			]
		});

		expect(result.success).toBe(false);
	});
});
