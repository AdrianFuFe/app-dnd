import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { contentFileBaseSchema } from '../../schemas/content/common-content.schema.ts';
import { getContentFileSchema } from '../../schemas/content/content-file-schema-registry.ts';

export interface ValidatedContentFile {
	filePath: string;
	contentType: string;
	itemCount: number;
}

interface CatalogReferenceItem {
	slug: string;
	classSlug?: string;
	classSlugs?: string[];
	speciesSlug?: string;
	subspeciesSlugs?: string[];
	grantedSpellsByLevel?: Array<{
		level: number;
		spellSlugs: string[];
	}>;
}

export interface ContentValidationIssue {
	filePath: string;
	message: string;
}

export interface ContentValidationResult {
	filesScanned: number;
	jsonFilesScanned: number;
	validFiles: ValidatedContentFile[];
	skippedFiles: string[];
	issues: ContentValidationIssue[];
}

function collectFilesRecursively(directoryPath: string): string[] {
	return readdirSync(directoryPath, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directoryPath, entry.name);

		if (entry.isDirectory()) {
			return collectFilesRecursively(fullPath);
		}

		return [fullPath];
	});
}

export function validateContentDataDirectory(dataDirectoryPath: string): ContentValidationResult {
	const allFiles = collectFilesRecursively(dataDirectoryPath);
	const result: ContentValidationResult = {
		filesScanned: allFiles.length,
		jsonFilesScanned: 0,
		validFiles: [],
		skippedFiles: [],
		issues: []
	};
	const validItemsByContentType = new Map<string, CatalogReferenceItem[]>();

	for (const filePath of allFiles) {
		if (path.extname(filePath) !== '.json') {
			result.skippedFiles.push(filePath);
			continue;
		}

		result.jsonFilesScanned += 1;

		try {
			const parsedJson = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown;
			const baseParseResult = contentFileBaseSchema.safeParse(parsedJson);

			if (!baseParseResult.success) {
				result.issues.push({
					filePath,
					message: baseParseResult.error.issues.map((issue) => issue.message).join('; ')
				});
				continue;
			}

			const schema = getContentFileSchema(baseParseResult.data.contentType);

			if (!schema) {
				result.issues.push({
					filePath,
					message: `Unsupported contentType "${baseParseResult.data.contentType}" for local validation`
				});
				continue;
			}

			const validationResult = schema.safeParse(parsedJson);

			if (!validationResult.success) {
				result.issues.push({
					filePath,
					message: validationResult.error.issues
						.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
						.join('; ')
				});
				continue;
			}

			result.validFiles.push({
				filePath,
				contentType: validationResult.data.contentType,
				itemCount: validationResult.data.items.length
			});
			validItemsByContentType.set(
				validationResult.data.contentType,
				validationResult.data.items as CatalogReferenceItem[]
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown validation error';

			result.issues.push({ filePath, message });
		}
	}

	const spellSlugs = new Set(
		(validItemsByContentType.get('spell') ?? []).map((item) => item.slug)
	);
	const classSlugs = new Set(
		(validItemsByContentType.get('character-class') ?? []).map((item) => item.slug)
	);
	const speciesSlugs = new Set(
		(validItemsByContentType.get('species') ?? []).map((item) => item.slug)
	);
	const subspeciesSlugs = new Set(
		(validItemsByContentType.get('subspecies') ?? []).map((item) => item.slug)
	);
	const subclasses = validItemsByContentType.get('subclass') ?? [];
	const speciesItems = validItemsByContentType.get('species') ?? [];
	const subspeciesItems = validItemsByContentType.get('subspecies') ?? [];
	const spells = validItemsByContentType.get('spell') ?? [];

	for (const subclass of subclasses) {
		if (subclass.classSlug && !classSlugs.has(subclass.classSlug)) {
			result.issues.push({
				filePath: path.join(dataDirectoryPath, 'srd-5-1', 'subclasses.json'),
				message: `Unknown class slug "${subclass.classSlug}" referenced by subclass "${subclass.slug}"`
			});
		}
	}

	for (const spell of spells) {
		for (const classSlug of spell.classSlugs ?? []) {
			if (!classSlugs.has(classSlug)) {
				result.issues.push({
					filePath: path.join(dataDirectoryPath, 'srd-5-1', 'spells.json'),
					message: `Unknown class slug "${classSlug}" referenced by spell "${spell.slug}"`
				});
			}
		}
	}

	for (const species of speciesItems) {
		for (const subspeciesSlug of species.subspeciesSlugs ?? []) {
			if (!subspeciesSlugs.has(subspeciesSlug)) {
				result.issues.push({
					filePath: path.join(dataDirectoryPath, 'srd-5-1', 'species.json'),
					message: `Unknown subspecies slug "${subspeciesSlug}" referenced by species "${species.slug}"`
				});
			}
		}
	}

	for (const subspecies of subspeciesItems) {
		if (subspecies.speciesSlug && !speciesSlugs.has(subspecies.speciesSlug)) {
			result.issues.push({
				filePath: path.join(dataDirectoryPath, 'srd-5-1', 'subspecies.json'),
				message: `Unknown species slug "${subspecies.speciesSlug}" referenced by subspecies "${subspecies.slug}"`
			});
		}
	}

	for (const subclass of subclasses) {
		for (const spellGroup of subclass.grantedSpellsByLevel ?? []) {
			for (const spellSlug of spellGroup.spellSlugs) {
				if (!spellSlugs.has(spellSlug)) {
					result.issues.push({
						filePath: path.join(dataDirectoryPath, 'srd-5-1', 'subclasses.json'),
						message: `Unknown spell slug "${spellSlug}" referenced by subclass "${subclass.slug}" at level ${spellGroup.level}`
					});
				}
			}
		}
	}

	return result;
}

export function formatContentValidationResult(result: ContentValidationResult): string {
	const lines = [
		`Content validation summary`,
		`- Files scanned: ${result.filesScanned}`,
		`- JSON files validated: ${result.jsonFilesScanned}`,
		`- Valid content files: ${result.validFiles.length}`,
		`- Skipped non-JSON files: ${result.skippedFiles.length}`,
		`- Issues: ${result.issues.length}`
	];

	if (result.validFiles.length > 0) {
		lines.push('');
		lines.push('Validated files:');
		lines.push(
			...result.validFiles.map(
				(file) =>
					`- ${path.relative(process.cwd(), file.filePath)} (${file.contentType}, ${file.itemCount} items)`
			)
		);
	}

	if (result.issues.length > 0) {
		lines.push('');
		lines.push('Issues:');
		lines.push(
			...result.issues.map(
				(issue) => `- ${path.relative(process.cwd(), issue.filePath)}: ${issue.message}`
			)
		);
	}

	return lines.join('\n');
}
