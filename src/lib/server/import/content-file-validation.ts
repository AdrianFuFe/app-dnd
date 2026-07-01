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
	armorProficiencies?: string[];
	baseSpeed?: number;
	classSlug?: string;
	classSlugs?: string[];
	equipment?: Array<
		| {
				type: 'item';
				id: string;
		  }
		| {
				type: 'choice';
				options: string[];
		  }
	>;
	languages?: Array<{
		type: 'fixed' | 'choice';
		language?: string;
		count?: number;
		scope?: 'any';
	}>;
	primaryAbilities?: string[];
	prerequisites?: string[];
	savingThrowProficiencies?: string[];
	skillChoices?: {
		count: number;
		options: string[];
	};
	skillProficiencies?: string[];
	spellcastingAbility?: string | null;
	startingEquipment?: Array<
		| {
				type: 'item';
				id: string;
		  }
		| {
				type: 'choice';
				options: string[];
		  }
	>;
	speciesSlug?: string;
	subspeciesSlugs?: string[];
	toolProficiencies?: string[];
	weaponProficiencies?: string[];
	mechanics?: Array<{
		type: string;
		spellId?: string;
		featureId?: string;
		ability?: string;
		proficiencyType?: string;
		text?: string;
		value?: string;
		count?: number;
		options?: string[];
		language?: string;
		range?: number;
	}>;
	progression?: Array<{
		level: number;
		features: string[];
	}>;
	grantedSpellsByLevel?: Array<{
		level: number;
		spellSlugs: string[];
	}>;
	category?: string;
	features?: Array<{
		level: number;
		featureId?: string;
		name: string;
		mechanics?: Array<{
			type: string;
			proficiencyType?: string;
			text?: string;
			value?: string;
		}>;
	}>;
}

function toFeatureId(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function toSortedUnique(values: string[]): string[] {
	return [...new Set(values)].sort();
}

function arraysEqual(left: string[], right: string[]): boolean {
	return left.length === right.length && left.every((value, index) => value === right[index]);
}

const knownEquipmentReferenceIds = new Set([
	'any-simple-weapon',
	'artisan-tools',
	'belt-pouch',
	'bone-dice',
	'cards',
	'chain-mail',
	'common-clothes',
	'dungeoneers-pack',
	'explorers-pack',
	'greataxe',
	'holy-symbol',
	'insignia-of-rank',
	'leather-armor',
	'light-crossbow-and-20-bolts',
	'mace',
	'martial-weapon-and-shield',
	'prayer-book',
	'prayer-wheel',
	'priests-pack',
	'satchel',
	'scale-mail',
	'shield',
	'sticks-of-incense',
	'travelers-clothes',
	'trophy-from-a-fallen-enemy',
	'two-handaxes',
	'two-martial-weapons',
	'vestments',
	'warhammer'
]);

const knownSkillProficiencySlugs = new Set([
	'acrobatics',
	'animal-handling',
	'arcana',
	'athletics',
	'deception',
	'history',
	'insight',
	'intimidation',
	'investigation',
	'medicine',
	'nature',
	'perception',
	'performance',
	'persuasion',
	'religion',
	'sleight-of-hand',
	'stealth',
	'survival'
]);

const knownArmorProficiencySlugs = new Set([
	'light-armor',
	'medium-armor',
	'heavy-armor',
	'all-armor',
	'shields'
]);

const knownWeaponProficiencySlugs = new Set(['simple-weapons', 'martial-weapons']);

const knownSavingThrowProficiencySlugs = new Set([
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma'
]);

function isKnownFeatProficiencyReference(proficiencyType: string, slug: string): boolean {
	if (proficiencyType === 'skill') {
		return knownSkillProficiencySlugs.has(slug);
	}

	if (proficiencyType === 'armor') {
		return knownArmorProficiencySlugs.has(slug);
	}

	if (proficiencyType === 'weapon') {
		return knownWeaponProficiencySlugs.has(slug);
	}

	if (proficiencyType === 'saving_throw') {
		return knownSavingThrowProficiencySlugs.has(slug);
	}

	return true;
}

function validateEquipmentReferences(
	result: ContentValidationResult,
	filePath: string,
	contentLabel: string,
	contentSlug: string,
	equipmentEntries: CatalogReferenceItem['equipment'] | CatalogReferenceItem['startingEquipment'],
	knownEquipmentIds: Set<string>
): void {
	for (const entry of equipmentEntries ?? []) {
		if (entry.type === 'item' && !knownEquipmentIds.has(entry.id)) {
			result.issues.push({
				filePath,
				message: `Unknown equipment id "${entry.id}" referenced by ${contentLabel} "${contentSlug}"`
			});
		}

		if (entry.type === 'choice') {
			for (const option of entry.options) {
				if (!knownEquipmentIds.has(option)) {
					result.issues.push({
						filePath,
						message: `Unknown equipment option id "${option}" referenced by ${contentLabel} "${contentSlug}"`
					});
				}
			}
		}
	}
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
	const equipmentReferenceIds = new Set([
		...knownEquipmentReferenceIds,
		...(validItemsByContentType.get('equipment') ?? []).map(({ item }) => item.slug)
	]);
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
		validateEquipmentReferences(
			result,
			filePath,
			'class',
			characterClass.slug,
			characterClass.startingEquipment,
			equipmentReferenceIds
		);
		const progressionFeatureIds = new Set(
			(characterClass.progression ?? []).flatMap((level) => level.features ?? [])
		);
		const mechanics = characterClass.mechanics ?? [];
		const armorProficienciesFromMechanics = toSortedUnique(
			mechanics
				.filter(
					(mechanic) =>
						mechanic.type === 'proficiency' && mechanic.proficiencyType === 'armor' && mechanic.value
					)
				.map((mechanic) => mechanic.value as string)
		);
		const weaponProficienciesFromMechanics = toSortedUnique(
			mechanics
				.filter(
					(mechanic) =>
						mechanic.type === 'proficiency' &&
						mechanic.proficiencyType === 'weapon' &&
						mechanic.value
					)
				.map((mechanic) => mechanic.value as string)
		);
		const savingThrowProficienciesFromMechanics = toSortedUnique(
			mechanics
				.filter(
					(mechanic) =>
						mechanic.type === 'proficiency' &&
						mechanic.proficiencyType === 'saving_throw' &&
						mechanic.value
					)
				.map((mechanic) => mechanic.value as string)
		);
		const skillChoiceMechanic = mechanics.find(
			(mechanic) =>
				mechanic.type === 'choose_proficiency' && mechanic.proficiencyType === 'skill'
		);
		const spellcastingMechanic = mechanics.find(
			(mechanic) => mechanic.type === 'spellcasting' && mechanic.ability
		);
		const hasArmorMechanics = armorProficienciesFromMechanics.length > 0;
		const hasWeaponMechanics = weaponProficienciesFromMechanics.length > 0;
		const hasSavingThrowMechanics = savingThrowProficienciesFromMechanics.length > 0;

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

		if (
			hasArmorMechanics &&
			!arraysEqual(
				toSortedUnique(characterClass.armorProficiencies ?? []),
				armorProficienciesFromMechanics
			)
		) {
			result.issues.push({
				filePath,
				message: `Class "${characterClass.slug}" armor proficiencies do not match proficiency mechanics`
			});
		}

		if (
			hasWeaponMechanics &&
			!arraysEqual(
				toSortedUnique(characterClass.weaponProficiencies ?? []),
				weaponProficienciesFromMechanics
			)
		) {
			result.issues.push({
				filePath,
				message: `Class "${characterClass.slug}" weapon proficiencies do not match proficiency mechanics`
			});
		}

		if (
			hasSavingThrowMechanics &&
			!arraysEqual(
				toSortedUnique(characterClass.savingThrowProficiencies ?? []),
				savingThrowProficienciesFromMechanics
			)
		) {
			result.issues.push({
				filePath,
				message: `Class "${characterClass.slug}" saving throw proficiencies do not match proficiency mechanics`
			});
		}

		if (characterClass.skillChoices && skillChoiceMechanic) {
			const skillChoiceOptions = toSortedUnique(characterClass.skillChoices.options ?? []);
			const mechanicOptions = toSortedUnique(skillChoiceMechanic?.options ?? []);

			if (
				characterClass.skillChoices.count !== skillChoiceMechanic.count ||
				!arraysEqual(skillChoiceOptions, mechanicOptions)
			) {
				result.issues.push({
					filePath,
					message: `Class "${characterClass.slug}" skill choices do not match choose_proficiency mechanics`
				});
			}
		}

		if (
			spellcastingMechanic &&
			characterClass.spellcastingAbility !== spellcastingMechanic.ability
		) {
			result.issues.push({
				filePath,
				message: `Class "${characterClass.slug}" spellcasting ability does not match spellcasting mechanics`
			});
		}
	}

	for (const { filePath, item: subclass } of subclasses) {
		const normalizedSubclassFeatureIds = (subclass.features ?? []).map(
			(feature) => feature.featureId ?? toFeatureId(feature.name)
		);
		const subclassFeatureIds = new Set(normalizedSubclassFeatureIds);
		const mechanics = subclass.mechanics ?? [];
		const referencedFeatureIds = new Set(
			mechanics
				.filter((mechanic) => mechanic.type === 'feature' && mechanic.featureId)
				.map((mechanic) => mechanic.featureId as string)
		);
		const subclassProficienciesFromMechanics = toSortedUnique(
			mechanics
				.filter(
					(mechanic) => mechanic.type === 'proficiency' && mechanic.proficiencyType && mechanic.value
				)
				.map((mechanic) => `${mechanic.proficiencyType}:${mechanic.value}`)
		);
		const subclassProficienciesFromFeatures = toSortedUnique(
			(subclass.features ?? [])
				.filter((feature) =>
					referencedFeatureIds.has(feature.featureId ?? toFeatureId(feature.name))
				)
				.flatMap((feature) => feature.mechanics ?? [])
				.filter(
					(mechanic) => mechanic.type === 'proficiency' && mechanic.proficiencyType && mechanic.value
				)
				.map((mechanic) => `${mechanic.proficiencyType}:${mechanic.value}`)
		);
		const subclassNotesFromMechanics = toSortedUnique(
			mechanics
				.filter((mechanic) => mechanic.type === 'note' && mechanic.text)
				.map((mechanic) => mechanic.text as string)
		);
		const subclassNotesFromFeatures = toSortedUnique(
			(subclass.features ?? [])
				.filter((feature) =>
					referencedFeatureIds.has(feature.featureId ?? toFeatureId(feature.name))
				)
				.flatMap((feature) => feature.mechanics ?? [])
				.filter((mechanic) => mechanic.type === 'note' && mechanic.text)
				.map((mechanic) => mechanic.text as string)
		);

		if (subclassFeatureIds.size !== normalizedSubclassFeatureIds.length) {
			result.issues.push({
				filePath,
				message: `Subclass "${subclass.slug}" contains duplicate feature ids`
			});
		}

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

		if (
			subclassProficienciesFromMechanics.length > 0 &&
			subclassProficienciesFromFeatures.length > 0 &&
			!arraysEqual(subclassProficienciesFromMechanics, subclassProficienciesFromFeatures)
		) {
			result.issues.push({
				filePath,
				message: `Subclass "${subclass.slug}" proficiencies do not match referenced feature mechanics`
			});
		}

		if (
			subclassNotesFromMechanics.length > 0 &&
			subclassNotesFromFeatures.length > 0 &&
			!arraysEqual(subclassNotesFromMechanics, subclassNotesFromFeatures)
		) {
			result.issues.push({
				filePath,
				message: `Subclass "${subclass.slug}" notes do not match referenced feature mechanics`
			});
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

			if (kind === 'proficiency') {
				const [, proficiencyType, proficiencySlug] = prerequisite.split(':', 3);

				if (
					proficiencyType &&
					proficiencySlug &&
					!isKnownFeatProficiencyReference(proficiencyType, proficiencySlug)
				) {
					result.issues.push({
						filePath,
						message: `Unknown ${proficiencyType} proficiency slug "${proficiencySlug}" referenced by feat prerequisite in "${feat.slug}"`
					});
				}
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
		const speedFromMechanics = (species.mechanics ?? []).find(
			(mechanic) => mechanic.type === 'speed' && typeof mechanic.value === 'number'
		)?.value;
		const fixedLanguages = toSortedUnique(
			(species.languages ?? [])
				.filter((entry) => entry.type === 'fixed' && entry.language)
				.map((entry) => entry.language as string)
		);
		const fixedLanguagesFromMechanics = toSortedUnique(
			(species.mechanics ?? [])
				.filter((mechanic) => mechanic.type === 'language' && mechanic.language)
				.map((mechanic) => mechanic.language as string)
		);
		const chooseLanguageCount = (species.languages ?? [])
			.filter((entry) => entry.type === 'choice')
			.reduce((total, entry) => total + (entry.count ?? 0), 0);
		const chooseLanguageCountFromMechanics = (species.mechanics ?? [])
			.filter((mechanic) => mechanic.type === 'choose_language')
			.reduce((total, mechanic) => total + (mechanic.count ?? 0), 0);
		const hasFixedLanguageMechanics = fixedLanguagesFromMechanics.length > 0;
		const hasChooseLanguageMechanics = chooseLanguageCountFromMechanics > 0;

		if (hasFixedLanguageMechanics && !arraysEqual(fixedLanguages, fixedLanguagesFromMechanics)) {
			result.issues.push({
				filePath: path.join(dataDirectoryPath, 'srd-5-1', 'species.json'),
				message: `Species "${species.slug}" fixed languages do not match language mechanics`
			});
		}

		if (hasChooseLanguageMechanics && chooseLanguageCount !== chooseLanguageCountFromMechanics) {
			result.issues.push({
				filePath: path.join(dataDirectoryPath, 'srd-5-1', 'species.json'),
				message: `Species "${species.slug}" language choices do not match choose_language mechanics`
			});
		}

		if (
			typeof speedFromMechanics === 'number' &&
			species.baseSpeed !== undefined &&
			species.baseSpeed !== speedFromMechanics
		) {
			result.issues.push({
				filePath: path.join(dataDirectoryPath, 'srd-5-1', 'species.json'),
				message: `Species "${species.slug}" base speed does not match speed mechanics`
			});
		}

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

	for (const { filePath, item: background } of validItemsByContentType.get('background') ?? []) {
		validateEquipmentReferences(
			result,
			filePath,
			'background',
			background.slug,
			background.equipment,
			equipmentReferenceIds
		);
		const mechanics = background.mechanics ?? [];
		const skillProficienciesFromMechanics = toSortedUnique(
			mechanics
				.filter(
					(mechanic) =>
						mechanic.type === 'proficiency' &&
						mechanic.proficiencyType === 'skill' &&
						mechanic.value
					)
				.map((mechanic) => mechanic.value as string)
		);
		const toolProficienciesFromMechanics = toSortedUnique(
			mechanics
				.filter(
					(mechanic) =>
						mechanic.type === 'proficiency' &&
						mechanic.proficiencyType === 'tool' &&
						mechanic.value
					)
				.map((mechanic) => mechanic.value as string)
		);
		const fixedLanguages = toSortedUnique(
			(background.languages ?? [])
				.filter((entry) => entry.type === 'fixed' && entry.language)
				.map((entry) => entry.language as string)
		);
		const fixedLanguagesFromMechanics = toSortedUnique(
			mechanics
				.filter((mechanic) => mechanic.type === 'language' && mechanic.language)
				.map((mechanic) => mechanic.language as string)
		);
		const chooseLanguageCount = (background.languages ?? [])
			.filter((entry) => entry.type === 'choice')
			.reduce((total, entry) => total + (entry.count ?? 0), 0);
		const chooseLanguageCountFromMechanics = mechanics
			.filter((mechanic) => mechanic.type === 'choose_language')
			.reduce((total, mechanic) => total + (mechanic.count ?? 0), 0);
		const hasSkillMechanics = skillProficienciesFromMechanics.length > 0;
		const hasToolMechanics = toolProficienciesFromMechanics.length > 0;
		const hasFixedLanguageMechanics = fixedLanguagesFromMechanics.length > 0;
		const hasChooseLanguageMechanics = chooseLanguageCountFromMechanics > 0;

		if (
			hasSkillMechanics &&
			!arraysEqual(
				toSortedUnique(background.skillProficiencies ?? []),
				skillProficienciesFromMechanics
			)
		) {
			result.issues.push({
				filePath,
				message: `Background "${background.slug}" skill proficiencies do not match proficiency mechanics`
			});
		}

		if (
			hasToolMechanics &&
			!arraysEqual(
				toSortedUnique(background.toolProficiencies ?? []),
				toolProficienciesFromMechanics
			)
		) {
			result.issues.push({
				filePath,
				message: `Background "${background.slug}" tool proficiencies do not match proficiency mechanics`
			});
		}

		if (hasFixedLanguageMechanics && !arraysEqual(fixedLanguages, fixedLanguagesFromMechanics)) {
			result.issues.push({
				filePath,
				message: `Background "${background.slug}" fixed languages do not match language mechanics`
			});
		}

		if (hasChooseLanguageMechanics && chooseLanguageCount !== chooseLanguageCountFromMechanics) {
			result.issues.push({
				filePath,
				message: `Background "${background.slug}" language choices do not match choose_language mechanics`
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
