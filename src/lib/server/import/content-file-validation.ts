import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { contentFileBaseSchema } from '../../schemas/content/common-content.schema.ts';
import { getContentFileSchema } from '../../schemas/content/content-file-schema-registry.ts';

export interface ValidatedContentFile {
	filePath: string;
	contentType: string;
	itemCount: number;
}

interface ValidatedCatalogItem {
	filePath: string;
	item: CatalogReferenceItem;
}

interface CatalogReferenceItem {
	slug: string;
	classSlug?: string;
	classSlugs?: string[];
	prerequisites?: string[];
	speciesSlug?: string;
	subspeciesSlugs?: string[];
	mechanics?: Array<{
		type: string;
		spellId?: string;
		featureId?: string;
	}>;
	progression?: Array<{
		level: number;
		features: string[];
	}>;
	grantedSpellsByLevel?: Array<{
		level: number;
		spellSlugs: string[];
	}>;
	features?: Array<{
		level: number;
		featureId?: string;
		name: string;
	}>;
}

function toFeatureId(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function getCatalogFilePath(dataDirectoryPath: string, contentType: string): string {
	const fileNameByContentType: Record<string, string> = {
		background: 'backgrounds.json',
		'character-class': 'classes.json',
		feat: 'feats.json',
		species: 'species.json',
		spell: 'spells.json',
		subclass: 'subclasses.json',
		subspecies: 'subspecies.json'
	};

	return path.join(
		dataDirectoryPath,
		'srd-5-1',
		fileNameByContentType[contentType] ?? `${contentType}.json`
	);
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
	const validItemsByContentType = new Map<string, ValidatedCatalogItem[]>();

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
			const existingItems = validItemsByContentType.get(validationResult.data.contentType) ?? [];
			const nextItems = (validationResult.data.items as CatalogReferenceItem[]).map((item) => ({
				filePath,
				item
			}));
			validItemsByContentType.set(validationResult.data.contentType, [
				...existingItems,
				...nextItems
			]);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown validation error';

			result.issues.push({ filePath, message });
		}
	}

	const spellSlugs = new Set(
		(validItemsByContentType.get('spell') ?? []).map(({ item }) => item.slug)
	);
	const classSlugs = new Set(
		(validItemsByContentType.get('character-class') ?? []).map(({ item }) => item.slug)
	);
	const speciesSlugs = new Set(
		(validItemsByContentType.get('species') ?? []).map(({ item }) => item.slug)
	);
	const subspeciesSlugs = new Set(
		(validItemsByContentType.get('subspecies') ?? []).map(({ item }) => item.slug)
	);
	const featSlugs = new Set(
		(validItemsByContentType.get('feat') ?? []).map(({ item }) => item.slug)
	);
	const subclasses = validItemsByContentType.get('subclass') ?? [];
	const classItems = validItemsByContentType.get('character-class') ?? [];
	const featItems = validItemsByContentType.get('feat') ?? [];
	const speciesItems = validItemsByContentType.get('species') ?? [];
	const subspeciesItems = validItemsByContentType.get('subspecies') ?? [];
	const spells = validItemsByContentType.get('spell') ?? [];

	for (const [contentType, entries] of validItemsByContentType.entries()) {
		const filePathBySlug = new Map<string, string>();

		for (const { filePath, item } of entries) {
			const previousFilePath = filePathBySlug.get(item.slug);

			if (previousFilePath) {
				result.issues.push({
					filePath,
					message: `Duplicate ${contentType} slug "${item.slug}" also defined in ${path.relative(dataDirectoryPath, previousFilePath)}`
				});
				continue;
			}

			filePathBySlug.set(item.slug, filePath);
		}
	}

	for (const { item: subclass } of subclasses) {
		if (subclass.classSlug && !classSlugs.has(subclass.classSlug)) {
			result.issues.push({
				filePath: path.join(dataDirectoryPath, 'srd-5-1', 'subclasses.json'),
				message: `Unknown class slug "${subclass.classSlug}" referenced by subclass "${subclass.slug}"`
			});
		}
	}

	for (const { item: spell } of spells) {
		for (const classSlug of spell.classSlugs ?? []) {
			if (!classSlugs.has(classSlug)) {
				result.issues.push({
					filePath: path.join(dataDirectoryPath, 'srd-5-1', 'spells.json'),
					message: `Unknown class slug "${classSlug}" referenced by spell "${spell.slug}"`
				});
			}
		}
	}

	for (const { filePath, item: characterClass } of classItems) {
		const progressionFeatureIds = new Set(
			(characterClass.progression ?? []).flatMap((level) => level.features ?? [])
		);

		for (const mechanic of characterClass.mechanics ?? []) {
			if (
				mechanic.type === 'feature' &&
				mechanic.featureId &&
				!progressionFeatureIds.has(mechanic.featureId)
			) {
				result.issues.push({
					filePath,
					message: `Unknown feature id "${mechanic.featureId}" referenced by class "${characterClass.slug}"`
				});
			}
		}
	}

	for (const { filePath, item: subclass } of subclasses) {
		const subclassFeatureIds = new Set(
			(subclass.features ?? []).map((feature) => feature.featureId ?? toFeatureId(feature.name))
		);

		for (const mechanic of subclass.mechanics ?? []) {
			if (
				mechanic.type === 'feature' &&
				mechanic.featureId &&
				!subclassFeatureIds.has(mechanic.featureId)
			) {
				result.issues.push({
					filePath,
					message: `Unknown feature id "${mechanic.featureId}" referenced by subclass "${subclass.slug}"`
				});
			}
		}
	}

	for (const { filePath, item: feat } of featItems) {
		for (const prerequisite of feat.prerequisites ?? []) {
			const [kind, slug] = prerequisite.split(':', 2);

			if (!kind || !slug) {
				continue;
			}

			if (kind === 'class' && !classSlugs.has(slug)) {
				result.issues.push({
					filePath,
					message: `Unknown class slug "${slug}" referenced by feat prerequisite in "${feat.slug}"`
				});
			}

			if (kind === 'species' && !speciesSlugs.has(slug)) {
				result.issues.push({
					filePath,
					message: `Unknown species slug "${slug}" referenced by feat prerequisite in "${feat.slug}"`
				});
			}

			if (kind === 'subspecies' && !subspeciesSlugs.has(slug)) {
				result.issues.push({
					filePath,
					message: `Unknown subspecies slug "${slug}" referenced by feat prerequisite in "${feat.slug}"`
				});
			}

			if (kind === 'spell' && !spellSlugs.has(slug)) {
				result.issues.push({
					filePath,
					message: `Unknown spell slug "${slug}" referenced by feat prerequisite in "${feat.slug}"`
				});
			}

			if (kind === 'feat' && !featSlugs.has(slug)) {
				result.issues.push({
					filePath,
					message: `Unknown feat slug "${slug}" referenced by feat prerequisite in "${feat.slug}"`
				});
			}
		}
	}

	for (const [contentType, items] of validItemsByContentType.entries()) {
		for (const { item } of items) {
			for (const mechanic of item.mechanics ?? []) {
				if (
					mechanic.type === 'spell_grant' &&
					mechanic.spellId &&
					!spellSlugs.has(mechanic.spellId)
				) {
					result.issues.push({
						filePath: getCatalogFilePath(dataDirectoryPath, contentType),
						message: `Unknown spell slug "${mechanic.spellId}" referenced by spell_grant mechanic in "${item.slug}"`
					});
				}
			}
		}
	}

	for (const { item: species } of speciesItems) {
		for (const subspeciesSlug of species.subspeciesSlugs ?? []) {
			if (!subspeciesSlugs.has(subspeciesSlug)) {
				result.issues.push({
					filePath: path.join(dataDirectoryPath, 'srd-5-1', 'species.json'),
					message: `Unknown subspecies slug "${subspeciesSlug}" referenced by species "${species.slug}"`
				});
			}
		}
	}

	for (const { item: subspecies } of subspeciesItems) {
		if (subspecies.speciesSlug && !speciesSlugs.has(subspecies.speciesSlug)) {
			result.issues.push({
				filePath: path.join(dataDirectoryPath, 'srd-5-1', 'subspecies.json'),
				message: `Unknown species slug "${subspecies.speciesSlug}" referenced by subspecies "${subspecies.slug}"`
			});
		}
	}

	for (const { item: subclass } of subclasses) {
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
