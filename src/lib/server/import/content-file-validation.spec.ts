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
		expect(result.validFiles).toHaveLength(3);
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
				contentType: 'species',
				items: []
			})
		);

		const result = validateContentDataDirectory(tempDirectoryPath);

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.message).toContain('Unsupported contentType "species"');
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
});
