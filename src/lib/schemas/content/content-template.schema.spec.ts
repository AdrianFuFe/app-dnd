import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { backgroundFileSchema } from './background.schema.ts';
import { spellFileSchema } from './spell.schema.ts';
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

	it('validates the subclass template file', () => {
		const template = readJsonFile<unknown>(
			'data/private-content-templates/subclass.template.json'
		);

		expect(() => subclassFileSchema.parse(template)).not.toThrow();
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
});
