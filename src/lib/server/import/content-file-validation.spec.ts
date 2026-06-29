import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateContentDataDirectory } from './content-file-validation.ts';

const temporaryDirectories: string[] = [];

afterEach(() => {
	for (const directoryPath of temporaryDirectories.splice(0)) {
		rmSync(directoryPath, { force: true, recursive: true });
	}
});

function createTemporaryDataDirectory(): string {
	const directoryPath = mkdtempSync(path.join(os.tmpdir(), 'app-dnd-content-validation-'));
	temporaryDirectories.push(directoryPath);

	return directoryPath;
}

describe('validateContentDataDirectory', () => {
	it('validates the current project data directory', () => {
		const dataDirectoryPath = path.resolve(process.cwd(), 'data');
		const result = validateContentDataDirectory(dataDirectoryPath);

		expect(result.issues).toHaveLength(0);
		expect(result.validFiles).toHaveLength(12);
	});

	it('reports unsupported content types', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const nestedDirectoryPath = path.join(tempDirectoryPath, 'private-content-templates');
		mkdirSync(nestedDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(nestedDirectoryPath, 'unsupported.template.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'user-private',
				contentType: 'condition',
				items: []
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Unsupported contentType "condition"');
	});

	it('reports malformed JSON files', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const nestedDirectoryPath = path.join(tempDirectoryPath, 'private-content-templates');
		mkdirSync(nestedDirectoryPath, { recursive: true });
		writeFileSync(path.join(nestedDirectoryPath, 'broken.template.json'), '{');

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Expected property name or');
	});

	it('reports missing spell references from subclasses', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'classes.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'character-class',
				items: [
					{
						slug: 'clerigo',
						name: 'Clerigo',
						hitDie: 8,
						primaryAbilities: ['wisdom'],
						savingThrowProficiencies: ['wisdom', 'charisma']
					}
				]
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'spells.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'spell',
				items: []
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'subclasses.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'subclass',
				items: [
					{
						slug: 'subclase-prueba',
						name: 'Subclase de Prueba',
						classSlug: 'clerigo',
						grantedSpellsByLevel: [{ level: 1, spellSlugs: ['bless'] }]
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Unknown spell slug "bless"');
	});

	it('accepts spell references when spells are split across multiple files of the same content type', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		const homebrewDirectoryPath = path.join(tempDirectoryPath, 'homebrew');
		mkdirSync(srdDirectoryPath, { recursive: true });
		mkdirSync(homebrewDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'classes.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'character-class',
				items: [
					{
						slug: 'clerigo',
						name: 'Clerigo',
						hitDie: 8,
						primaryAbilities: ['wisdom'],
						savingThrowProficiencies: ['wisdom', 'charisma']
					}
				]
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'spells.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'spell',
				items: []
			})
		);
		writeFileSync(
			path.join(homebrewDirectoryPath, 'spells.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'homebrew',
				contentType: 'spell',
				items: [
					{
						slug: 'bless',
						name: 'Bless',
						level: 1,
						school: 'enchantment',
						classSlugs: ['clerigo']
					}
				]
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'subclasses.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'subclass',
				items: [
					{
						slug: 'subclase-prueba',
						name: 'Subclase de Prueba',
						classSlug: 'clerigo',
						grantedSpellsByLevel: [{ level: 1, spellSlugs: ['bless'] }]
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(0);
	});

	it('reports missing class references from subclasses', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'classes.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'character-class',
				items: []
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'subclasses.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'subclass',
				items: [
					{
						slug: 'subclase-prueba',
						name: 'Subclase de Prueba',
						classSlug: 'clerigo',
						grantedSpellsByLevel: []
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Unknown class slug "clerigo"');
	});

	it('reports missing class references from spells', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'classes.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'character-class',
				items: []
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'spells.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'spell',
				items: [
					{
						slug: 'bless',
						name: 'Bless',
						level: 1,
						school: 'enchantment',
						classSlugs: ['clerigo']
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Unknown class slug "clerigo"');
	});

	it('reports missing feature references from class mechanics', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'classes.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'character-class',
				items: [
					{
						slug: 'guerrero',
						name: 'Guerrero',
						hitDie: 10,
						primaryAbilities: ['strength'],
						savingThrowProficiencies: ['strength', 'constitution'],
						progression: [{ level: 1, features: ['second-wind'] }],
						mechanics: [{ type: 'feature', featureId: 'fighting-style' }]
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain(
			'Unknown feature id "fighting-style" referenced by class "guerrero"'
		);
	});

	it('reports duplicate slugs across files of the same content type', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		const homebrewDirectoryPath = path.join(tempDirectoryPath, 'homebrew');
		mkdirSync(srdDirectoryPath, { recursive: true });
		mkdirSync(homebrewDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'spells.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'spell',
				items: [
					{
						slug: 'bless',
						name: 'Bless',
						level: 1,
						school: 'enchantment',
						classSlugs: []
					}
				]
			})
		);
		writeFileSync(
			path.join(homebrewDirectoryPath, 'spells.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'homebrew',
				contentType: 'spell',
				items: [
					{
						slug: 'bless',
						name: 'Bless mejorado',
						level: 1,
						school: 'enchantment',
						classSlugs: []
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Duplicate spell slug "bless"');
	});

	it('reports missing feature references from subclass mechanics', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'classes.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'character-class',
				items: [
					{
						slug: 'clerigo',
						name: 'Clerigo',
						hitDie: 8,
						primaryAbilities: ['wisdom'],
						savingThrowProficiencies: ['wisdom', 'charisma']
					}
				]
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'subclasses.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'subclass',
				items: [
					{
						slug: 'life-domain',
						name: 'Life Domain',
						classSlug: 'clerigo',
						features: [{ level: 1, name: 'Bonus Proficiency', mechanics: [] }],
						mechanics: [{ type: 'feature', featureId: 'disciple-of-life' }]
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain(
			'Unknown feature id "disciple-of-life" referenced by subclass "life-domain"'
		);
	});

	it('reports missing spell references from feat mechanics', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'spells.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'spell',
				items: []
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'feats.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'feat',
				items: [
					{
						slug: 'dote-prueba',
						name: 'Dote de Prueba',
						mechanics: [{ type: 'spell_grant', spellId: 'bless' }]
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Unknown spell slug "bless"');
	});

	it('accepts valid catalog references in feat prerequisites', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'classes.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'character-class',
				items: [
					{
						slug: 'clerigo',
						name: 'Clerigo',
						hitDie: 8,
						primaryAbilities: ['wisdom'],
						savingThrowProficiencies: ['wisdom', 'charisma']
					}
				]
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'species.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'species',
				items: [{ slug: 'elfo', name: 'Elfo' }]
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'spells.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'spell',
				items: [{ slug: 'bless', name: 'Bless', level: 1, school: 'enchantment' }]
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'feats.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'feat',
				items: [
					{
						slug: 'resilient-wisdom',
						name: 'Resilient (Wisdom)',
						prerequisites: []
					},
					{
						slug: 'dote-prueba',
						name: 'Dote de Prueba',
						prerequisites: [
							'class:clerigo',
							'species:elfo',
							'spell:bless',
							'feat:resilient-wisdom'
						]
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(0);
	});

	it('reports missing catalog references from feat prerequisites', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'feats.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'feat',
				items: [
					{
						slug: 'dote-prueba',
						name: 'Dote de Prueba',
						prerequisites: [
							'class:clerigo',
							'species:elfo',
							'subspecies:high-elf',
							'spell:bless',
							'feat:resilient-wisdom'
						]
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(5);
		expect(result.issues[0]?.message).toContain('Unknown class slug "clerigo"');
		expect(result.issues[1]?.message).toContain('Unknown species slug "elfo"');
		expect(result.issues[2]?.message).toContain('Unknown subspecies slug "high-elf"');
		expect(result.issues[3]?.message).toContain('Unknown spell slug "bless"');
		expect(result.issues[4]?.message).toContain('Unknown feat slug "resilient-wisdom"');
	});

	it('reports missing subspecies references from species', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'species.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'species',
				items: [
					{
						slug: 'elfo',
						name: 'Elfo',
						subspeciesSlugs: ['high-elf']
					}
				]
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'subspecies.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'subspecies',
				items: []
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Unknown subspecies slug "high-elf"');
	});

	it('reports missing species references from subspecies', () => {
		const tempDirectoryPath = createTemporaryDataDirectory();
		const srdDirectoryPath = path.join(tempDirectoryPath, 'srd-5-1');
		mkdirSync(srdDirectoryPath, { recursive: true });
		writeFileSync(
			path.join(srdDirectoryPath, 'species.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'species',
				items: []
			})
		);
		writeFileSync(
			path.join(srdDirectoryPath, 'subspecies.json'),
			JSON.stringify({
				schemaVersion: 1,
				source: 'srd-5-1',
				contentType: 'subspecies',
				items: [
					{
						slug: 'high-elf',
						name: 'High Elf',
						speciesSlug: 'elfo'
					}
				]
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Unknown species slug "elfo"');
	});
});
