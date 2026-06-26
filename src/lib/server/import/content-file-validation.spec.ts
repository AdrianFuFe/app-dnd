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
