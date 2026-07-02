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

function expectItemBySlug<T extends { slug: string }>(items: T[], slug: string): T {
	const item = items.find((entry) => entry.slug === slug);

	expect(item, `Expected item with slug "${slug}"`).toBeDefined();

	return item!;
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

	it('validates the SRD species catalog file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/species.json');

		const parsed = speciesFileSchema.parse(file);
		const elf = expectItemBySlug(parsed.items, 'elfo');
		const human = expectItemBySlug(parsed.items, 'humano');

		expect(parsed.items).toHaveLength(2);
		expect(elf.languages[0]).toEqual({ type: 'fixed', language: 'comun' });
		expect(elf.subspeciesSlugs).toEqual(['high-elf']);
		expect(human.mechanics).toContainEqual({ type: 'choose_language', count: 1 });
	});

	it('validates the SRD subspecies catalog file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/subspecies.json');

		const parsed = subspeciesFileSchema.parse(file);
		const highElf = expectItemBySlug(parsed.items, 'high-elf');

		expect(parsed.items).toHaveLength(1);
		expect(highElf.speciesSlug).toBe('elfo');
	});

	it('validates the SRD classes catalog file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/classes.json');

		const parsed = characterClassFileSchema.parse(file);
		const fighter = expectItemBySlug(parsed.items, 'guerrero');
		const cleric = expectItemBySlug(parsed.items, 'clerigo');
		const wizard = expectItemBySlug(parsed.items, 'mago');

		expect(parsed.items).toHaveLength(3);
		expect(fighter.startingEquipment[0]).toEqual({ type: 'item', id: 'chain-mail' });
		expect(cleric.spellcastingAbility).toBe('wisdom');
		expect(cleric.mechanics).toContainEqual({
			type: 'spellcasting',
			ability: 'wisdom'
		});
		expect(wizard.weaponProficiencies).toContain('quarterstaff');
		expect(wizard.startingEquipment).toContainEqual({ type: 'item', id: 'spellbook' });
	});

	it('validates the SRD backgrounds catalog file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/backgrounds.json');

		const parsed = backgroundFileSchema.parse(file);
		const acolyte = expectItemBySlug(parsed.items, 'acolyte');
		const soldier = expectItemBySlug(parsed.items, 'soldier');

		expect(parsed.items).toHaveLength(2);
		expect(acolyte.languages[0]).toEqual({ type: 'choice', count: 2, scope: 'any' });
		expect(acolyte.equipment[0]).toEqual({ type: 'item', id: 'holy-symbol' });
		expect(soldier.toolProficiencies).toContain('vehicles-land');
	});

	it('validates the SRD spells catalog file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/spells.json');

		const parsed = spellFileSchema.parse(file);
		const command = expectItemBySlug(parsed.items, 'command');
		const identify = expectItemBySlug(parsed.items, 'identify');
		const bless = expectItemBySlug(parsed.items, 'bless');
		const magicMissile = expectItemBySlug(parsed.items, 'magic-missile');
		const raiseDead = expectItemBySlug(parsed.items, 'raise-dead');

		expect(parsed.items).toHaveLength(25);
		expect(command.classSlugs).toContain('clerigo');
		expect(identify.classSlugs).toContain('mago');
		expect(bless.classSlugs).toContain('clerigo');
		expect(magicMissile.classSlugs).toContain('mago');
		expect(raiseDead.level).toBe(5);
	});

	it('validates the SRD feats catalog file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/feats.json');

		const parsed = featFileSchema.parse(file);
		const heavilyArmored = expectItemBySlug(parsed.items, 'heavily-armored');
		const resilientWisdom = expectItemBySlug(parsed.items, 'resilient-wisdom');
		const observant = expectItemBySlug(parsed.items, 'observant');

		expect(parsed.items).toHaveLength(6);
		expect(heavilyArmored.prerequisites).toContain('proficiency:armor:medium-armor');
		expect(resilientWisdom.mechanics).toContainEqual({
			type: 'proficiency',
			proficiencyType: 'saving_throw',
			value: 'wisdom'
		});
		expect(observant.mechanics).toContainEqual({
			type: 'choose_ability_bonus',
			count: 1,
			value: 1,
			allowed: ['intelligence', 'wisdom']
		});
	});

	it('validates the SRD equipment catalog file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/equipment.json');

		const parsed = equipmentFileSchema.parse(file);
		const anySimpleWeapon = expectItemBySlug(parsed.items, 'any-simple-weapon');
		const greataxe = expectItemBySlug(parsed.items, 'greataxe');

		expect(parsed.items).toHaveLength(33);
		expect(anySimpleWeapon.category).toBe('choice-bundle');
		expect(greataxe.damageType).toBe('slashing');
	});

	it('validates the SRD subclasses catalog file', () => {
		const file = readJsonFile<unknown>('data/srd-5-1/subclasses.json');

		const parsed = subclassFileSchema.parse(file);
		const knowledgeDomain = expectItemBySlug(parsed.items, 'knowledge-domain');
		const lifeDomain = expectItemBySlug(parsed.items, 'life-domain');
		const schoolOfEvocation = expectItemBySlug(parsed.items, 'school-of-evocation');

		expect(parsed.items).toHaveLength(3);
		expect(knowledgeDomain.grantedSpellsByLevel[0]?.spellSlugs).toEqual([
			'command',
			'identify'
		]);
		expect(lifeDomain.classSlug).toBe('clerigo');
		expect(lifeDomain.grantedSpellsByLevel).toHaveLength(5);
		expect(lifeDomain.grantedSpellsByLevel[0]?.spellSlugs).toEqual([
			'bless',
			'cure-wounds'
		]);
		expect(schoolOfEvocation.classSlug).toBe('mago');
		expect(schoolOfEvocation.features).toContainEqual(
			expect.objectContaining({ featureId: 'sculpt-spells', level: 2 })
		);
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
