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
		expect(result.validFiles).toHaveLength(8);
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
				contentType: 'feat',
				items: []
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Unsupported contentType "feat"');
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
});
