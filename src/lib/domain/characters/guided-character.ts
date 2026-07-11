import type {
	ContentMode,
	RulesetCode
} from '$lib/types/content/content';
import type {
	EquipmentCatalogEntry,
	ProficiencyVocabularyEntry,
	RulesVocabularyEntry,
	SharedRulesVocabularyCatalog,
	SpellCatalogEntry
} from '$lib/types/content/expanded-content-catalog';
import type {
	CharacterAttackItem,
	CharacterCreateInput,
	CharacterFeatItem,
	CharacterInventoryItem,
	CharacterNoteItem,
	CharacterSpellItem
} from '$lib/types/domain/character';
import type { Ability, GameMechanic } from '$lib/types/domain/game-mechanics';
import type { CharacterGuidedInput } from '$lib/schemas/characters/character-guided.schema';
import {
	createCharacterManualOverride,
	deriveCharacterContentProfile,
	summarizeCharacterCustomizationReasons,
	type CharacterLinkedContentSelection
} from './character-content-profile';

export type GuidedCharacterOptionBase = {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	rulesetCode: RulesetCode;
	contentMode: ContentMode;
	mechanics: GameMechanic[];
};

export type GuidedCharacterSpeciesOption = GuidedCharacterOptionBase & {
	baseSpeed: number | null;
};

export type GuidedCharacterSubspeciesOption = GuidedCharacterOptionBase & {
	speciesSlug: string;
};

export type GuidedCharacterClassOption = GuidedCharacterOptionBase & {
	hitDie: number;
	startingEquipment: GuidedEquipmentEntry[];
};

export type GuidedCharacterGrantedSpellLevelGroup = {
	level: number;
	spellSlugs: string[];
};

export type GuidedCharacterSubclassOption = GuidedCharacterOptionBase & {
	classSlug: string;
	grantedSpellsByLevel: GuidedCharacterGrantedSpellLevelGroup[];
};

export type GuidedCharacterBackgroundOption = GuidedCharacterOptionBase & {
	startingEquipment: GuidedEquipmentEntry[];
};

export type GuidedEquipmentItemEntry = {
	type: 'item';
	id: string;
	quantity?: number;
	note?: string;
};

export type GuidedEquipmentChoiceEntry = {
	type: 'choice';
	options: string[];
	note?: string;
};

export type GuidedEquipmentEntry = GuidedEquipmentItemEntry | GuidedEquipmentChoiceEntry;

export type GuidedCharacterCatalog = {
	speciesOptions: GuidedCharacterSpeciesOption[];
	subspeciesOptions: GuidedCharacterSubspeciesOption[];
	classOptions: GuidedCharacterClassOption[];
	subclassOptions: GuidedCharacterSubclassOption[];
	backgroundOptions: GuidedCharacterBackgroundOption[];
	spellCatalog: SpellCatalogEntry[];
	equipmentCatalog: EquipmentCatalogEntry[];
	vocabularies: SharedRulesVocabularyCatalog;
};

export type GuidedLanguageChoicePoint = {
	key: string;
	count: number;
	options: RulesVocabularyEntry[];
	selected: string[];
};

export type GuidedProficiencyChoicePoint = {
	key: string;
	proficiencyType: 'skill' | 'tool';
	count: number;
	options: ProficiencyVocabularyEntry[];
	selected: string[];
};

export type GuidedChoiceResolution = {
	languageChoices: GuidedLanguageChoicePoint[];
	proficiencyChoices: GuidedProficiencyChoicePoint[];
	equipmentChoices: GuidedEquipmentChoicePoint[];
};

export type GuidedEquipmentChoicePoint = {
	key: string;
	count: number;
	options: EquipmentCatalogEntry[];
	selected: string[];
};

export type GuidedCharacterPreview = {
	abilityScores: Record<Ability, number>;
	abilityBonuses: Array<{ ability: Ability; value: number }>;
	speed: number;
	maxHp: number;
	currentHp: number;
	temporaryHp: number;
	armorClass: number;
	initiative: number;
	hitDice: string;
	derivedCombatStats: {
		maxHp: number;
		currentHp: number;
		temporaryHp: number;
		armorClass: number;
		initiative: number;
		speed: number;
	};
	grantedSpellItems: CharacterSpellItem[];
	grantedFeatureLines: string[];
	resolvedChoiceLines: string[];
	pendingChoiceLines: string[];
	rulesetCode: RulesetCode;
	contentMode: ContentMode;
	customizationReasonLines: string[];
	choiceResolution: GuidedChoiceResolution;
	derivedInventoryItems: CharacterInventoryItem[];
	derivedAttackItems: CharacterAttackItem[];
};

export type GuidedCharacterDraft = {
	character: CharacterCreateInput;
	preview: GuidedCharacterPreview;
};

export type GuidedCharacterFormValues = Record<keyof CharacterGuidedInput, string>;

export function deriveGuidedCharacterDraft(
	catalog: GuidedCharacterCatalog,
	input: CharacterGuidedInput
): GuidedCharacterDraft {
	const { species, subspecies, characterClass, subclass, background, selectedMechanics } =
		resolveGuidedSelections(catalog, input);

	const baseAbilityScores = {
		strength: input.strength,
		dexterity: input.dexterity,
		constitution: input.constitution,
		intelligence: input.intelligence,
		wisdom: input.wisdom,
		charisma: input.charisma
	};

	const abilityBonuses = summarizeAbilityBonuses(selectedMechanics);
	const abilityScores = applyAbilityBonuses(baseAbilityScores, abilityBonuses);
	const dexterityModifier = calculateAbilityModifier(abilityScores.dexterity);
	const constitutionModifier = calculateAbilityModifier(abilityScores.constitution);
	const derivedCombatStats = {
		speed: deriveSpeed(species.baseSpeed, selectedMechanics),
		maxHp: Math.max(1, characterClass.hitDie + constitutionModifier),
		currentHp: Math.max(1, characterClass.hitDie + constitutionModifier),
		temporaryHp: 0,
		armorClass: 10 + dexterityModifier,
		initiative: dexterityModifier
	};
	const manualOverrides = summarizeGuidedCombatOverrides(derivedCombatStats, input);
	const contentProfile = deriveCharacterContentProfile({
		baseRulesetCode: species.rulesetCode,
		linkedContentSelections: createGuidedLinkedContentSelections(
			species,
			subspecies,
			characterClass,
			subclass,
			background
		),
		manualOverrides
	});
	const customizationReasonLines = summarizeCharacterCustomizationReasons(
		contentProfile.customizationReasons
	);
	const combatStats = applyGuidedCombatOverrides(derivedCombatStats, input);
	const hitDice = `1d${characterClass.hitDie}`;
	const grantedSpellItems = deriveGrantedSpellItems(
		characterClass,
		subclass,
		catalog.spellCatalog
	);
	const choiceResolution = resolveChoiceSelections(
		selectedMechanics,
		catalog.vocabularies,
		{
			classEquipment: characterClass.startingEquipment,
			backgroundEquipment: background.startingEquipment,
			equipmentCatalog: catalog.equipmentCatalog
		},
		input,
		true
	);
	const grantedFeatureLines = summarizeGrantedFeatureLines(selectedMechanics);
	const resolvedChoiceLines = summarizeResolvedChoiceLines(
		choiceResolution,
		catalog.equipmentCatalog
	);
	const pendingChoiceLines = summarizePendingChoiceLines(choiceResolution);
	const inventoryItems = deriveInventoryItems(
		characterClass.startingEquipment,
		background.startingEquipment,
		choiceResolution,
		catalog.equipmentCatalog
	);
	const attackItems = deriveAttackItems(catalog.equipmentCatalog, inventoryItems, abilityScores);
	const noteItems = createGuidedNoteItems(
		grantedFeatureLines,
		resolvedChoiceLines,
		pendingChoiceLines
	);
	const featItems: CharacterFeatItem[] = [];

	return {
		character: {
			name: input.name,
			rulesetCode: contentProfile.rulesetCode,
			contentMode: contentProfile.contentMode,
			speciesId: species.id,
			subspeciesId: subspecies?.id,
			classId: characterClass.id,
			subclassId: subclass?.id,
			backgroundId: background.id,
			race: species.name,
			subrace: subspecies?.name,
			className: characterClass.name,
			subclass: subclass?.name,
			level: 1,
			background: background.name,
			story: input.story,
			...abilityScores,
			maxHp: combatStats.maxHp,
			currentHp: combatStats.currentHp,
			temporaryHp: combatStats.temporaryHp,
			armorClass: combatStats.armorClass,
			initiative: combatStats.initiative,
			speed: combatStats.speed,
			hitDice,
			attackItems,
			spellItems: grantedSpellItems,
			featItems,
			inventoryItems,
			noteItems,
			attacks: undefined,
			spells: undefined,
			notes: undefined
		},
		preview: {
			abilityScores,
			abilityBonuses,
			speed: combatStats.speed,
			maxHp: combatStats.maxHp,
			currentHp: combatStats.currentHp,
			temporaryHp: combatStats.temporaryHp,
			armorClass: combatStats.armorClass,
			initiative: combatStats.initiative,
			hitDice,
			derivedCombatStats,
			grantedSpellItems,
			grantedFeatureLines,
			resolvedChoiceLines,
			pendingChoiceLines,
			rulesetCode: contentProfile.rulesetCode,
			contentMode: contentProfile.contentMode,
			customizationReasonLines,
			choiceResolution,
			derivedInventoryItems: inventoryItems,
			derivedAttackItems: attackItems
		}
	};
}

export function inspectGuidedCharacterChoices(
	catalog: GuidedCharacterCatalog,
	input: CharacterGuidedInput
): GuidedChoiceResolution {
	const { selectedMechanics, characterClass, background } = resolveGuidedSelections(catalog, input);

	return resolveChoiceSelections(
		selectedMechanics,
		catalog.vocabularies,
		{
			classEquipment: characterClass.startingEquipment,
			backgroundEquipment: background.startingEquipment,
			equipmentCatalog: catalog.equipmentCatalog
		},
		input,
		false
	);
}

export function createDefaultGuidedCharacterInput(): CharacterGuidedInput {
	return {
		name: 'New Character',
		story: undefined,
		speciesId: '',
		subspeciesId: undefined,
		classId: '',
		subclassId: undefined,
		backgroundId: '',
		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10,
		overrideMaxHp: undefined,
		overrideCurrentHp: undefined,
		overrideTemporaryHp: undefined,
		overrideArmorClass: undefined,
		overrideInitiative: undefined,
		overrideSpeed: undefined,
		languageChoices: [],
		proficiencyChoices: [],
		equipmentChoices: []
	};
}

export function createGuidedCharacterFormValues(
	source: Partial<Record<keyof CharacterGuidedInput, unknown>> = {}
): GuidedCharacterFormValues {
	return {
		name: toFormString(source.name),
		story: toFormString(source.story),
		speciesId: toFormString(source.speciesId),
		subspeciesId: toFormString(source.subspeciesId),
		classId: toFormString(source.classId),
		subclassId: toFormString(source.subclassId),
		backgroundId: toFormString(source.backgroundId),
		strength: toFormString(source.strength),
		dexterity: toFormString(source.dexterity),
		constitution: toFormString(source.constitution),
		intelligence: toFormString(source.intelligence),
		wisdom: toFormString(source.wisdom),
		charisma: toFormString(source.charisma),
		overrideMaxHp: toFormString(source.overrideMaxHp),
		overrideCurrentHp: toFormString(source.overrideCurrentHp),
		overrideTemporaryHp: toFormString(source.overrideTemporaryHp),
		overrideArmorClass: toFormString(source.overrideArmorClass),
		overrideInitiative: toFormString(source.overrideInitiative),
		overrideSpeed: toFormString(source.overrideSpeed),
		languageChoices: toStructuredFormString(source.languageChoices),
		proficiencyChoices: toStructuredFormString(source.proficiencyChoices),
		equipmentChoices: toStructuredFormString(source.equipmentChoices)
	};
}

function findRequiredOption<T extends { id: string }>(
	options: T[],
	id: string,
	label: string
): T {
	const option = options.find((entry) => entry.id === id);

	if (!option) {
		throw new Error(`Please choose a valid ${label} from the catalog.`);
	}

	return option;
}

function findOptionalOption<T extends { id: string }>(
	options: T[],
	id: string,
	label: string
): T {
	const option = options.find((entry) => entry.id === id);

	if (!option) {
		throw new Error(`Please choose a valid ${label} from the catalog.`);
	}

	return option;
}

function summarizeAbilityBonuses(mechanics: GameMechanic[]) {
	const abilityBonuses: Array<{ ability: Ability; value: number }> = [];

	for (const mechanic of mechanics) {
		if (mechanic.type !== 'ability_bonus') {
			continue;
		}

		abilityBonuses.push({
			ability: mechanic.ability,
			value: mechanic.value
		});
	}

	return abilityBonuses;
}

function applyAbilityBonuses(
	baseAbilityScores: Record<Ability, number>,
	abilityBonuses: Array<{ ability: Ability; value: number }>
) {
	const nextScores = { ...baseAbilityScores };

	for (const bonus of abilityBonuses) {
		nextScores[bonus.ability] += bonus.value;
	}

	return nextScores;
}

function calculateAbilityModifier(score: number): number {
	return Math.floor((score - 10) / 2);
}

function deriveSpeed(baseSpeed: number | null, mechanics: GameMechanic[]): number {
	let speed = baseSpeed ?? 30;

	for (const mechanic of mechanics) {
		if (mechanic.type === 'speed') {
			speed = mechanic.value;
		}
	}

	return speed;
}

function applyGuidedCombatOverrides(
	derivedCombatStats: GuidedCharacterPreview['derivedCombatStats'],
	input: CharacterGuidedInput
) {
	const maxHp = input.overrideMaxHp ?? derivedCombatStats.maxHp;
	const currentHp = Math.min(input.overrideCurrentHp ?? maxHp, maxHp);

	return {
		maxHp,
		currentHp,
		temporaryHp: input.overrideTemporaryHp ?? derivedCombatStats.temporaryHp,
		armorClass: input.overrideArmorClass ?? derivedCombatStats.armorClass,
		initiative: input.overrideInitiative ?? derivedCombatStats.initiative,
		speed: input.overrideSpeed ?? derivedCombatStats.speed
	};
}

function summarizeGuidedCombatOverrides(
	derivedCombatStats: GuidedCharacterPreview['derivedCombatStats'],
	input: CharacterGuidedInput
) {
	const manualOverrides: Array<{ field: string }> = [];

	if (input.overrideMaxHp !== undefined && input.overrideMaxHp !== derivedCombatStats.maxHp) {
		manualOverrides.push(createCharacterManualOverride('max_hp'));
	}

	if (
		input.overrideCurrentHp !== undefined &&
		input.overrideCurrentHp !== derivedCombatStats.currentHp
	) {
		manualOverrides.push(createCharacterManualOverride('current_hp'));
	}

	if (
		input.overrideTemporaryHp !== undefined &&
		input.overrideTemporaryHp !== derivedCombatStats.temporaryHp
	) {
		manualOverrides.push(createCharacterManualOverride('temporary_hp'));
	}

	if (
		input.overrideArmorClass !== undefined &&
		input.overrideArmorClass !== derivedCombatStats.armorClass
	) {
		manualOverrides.push(createCharacterManualOverride('armor_class'));
	}

	if (
		input.overrideInitiative !== undefined &&
		input.overrideInitiative !== derivedCombatStats.initiative
	) {
		manualOverrides.push(createCharacterManualOverride('initiative'));
	}

	if (input.overrideSpeed !== undefined && input.overrideSpeed !== derivedCombatStats.speed) {
		manualOverrides.push(createCharacterManualOverride('speed'));
	}

	return manualOverrides;
}

function deriveGrantedSpellItems(
	characterClass: GuidedCharacterClassOption,
	subclass: GuidedCharacterSubclassOption | undefined,
	spellCatalog: SpellCatalogEntry[]
): CharacterSpellItem[] {
	const spellIds = new Set<string>();

	for (const mechanic of characterClass.mechanics) {
		if (mechanic.type === 'spell_grant') {
			spellIds.add(mechanic.spellId);
		}
	}

	for (const mechanic of subclass?.mechanics ?? []) {
		if (mechanic.type === 'spell_grant') {
			spellIds.add(mechanic.spellId);
		}
	}

	for (const group of subclass?.grantedSpellsByLevel ?? []) {
		if (group.level <= 1) {
			for (const spellSlug of group.spellSlugs) {
				spellIds.add(spellSlug);
			}
		}
	}

	return [...spellIds]
		.map((spellSlug) => spellCatalog.find((entry) => entry.slug === spellSlug))
		.filter((entry): entry is SpellCatalogEntry => Boolean(entry))
		.sort((left, right) =>
			left.level === right.level ? left.name.localeCompare(right.name) : left.level - right.level
		)
		.map((spell) => ({
			spellId: spell.id,
			name: spell.name,
			level: spell.level,
			school: spell.school,
			castingTime: spell.castingTime ?? undefined,
			range: spell.range ?? undefined,
			components: spell.components ?? undefined,
			duration: spell.duration ?? undefined,
			description: spell.description ?? spell.summary ?? undefined,
			isPrepared: true
		}));
}

function resolveChoiceSelections(
	mechanics: GameMechanic[],
	vocabularies: SharedRulesVocabularyCatalog,
	equipmentContext: {
		classEquipment: GuidedEquipmentEntry[];
		backgroundEquipment: GuidedEquipmentEntry[];
		equipmentCatalog: EquipmentCatalogEntry[];
	},
	input: CharacterGuidedInput,
	strict: boolean
): GuidedChoiceResolution {
	const languageChoices: GuidedLanguageChoicePoint[] = [];
	const proficiencyChoices: GuidedProficiencyChoicePoint[] = [];
	const equipmentChoices: GuidedEquipmentChoicePoint[] = [];

	for (const mechanic of mechanics) {
		if (mechanic.type === 'choose_language') {
			const key = `language:${languageChoices.length}`;
			const selected = input.languageChoices.filter((choice) => choice.key === key).map((choice) => choice.value);

			if (strict) {
				validateSelectionCount(
					selected,
					mechanic.count,
					'language choice',
					selected.every((value) =>
						vocabularies.languages.some((entry) => entry.slug === value)
					)
				);
			}

			languageChoices.push({
				key,
				count: mechanic.count,
				options: vocabularies.languages,
				selected
			});
			continue;
		}

		if (mechanic.type === 'choose_proficiency') {
			const key = `${mechanic.proficiencyType}:${proficiencyChoices.length}`;
			const options = selectProficiencyVocabularyOptions(vocabularies, mechanic.proficiencyType, mechanic.options);
			const selected = input.proficiencyChoices
				.filter((choice) => choice.key === key)
				.map((choice) => choice.value);

			if (strict) {
				validateSelectionCount(
					selected,
					mechanic.count,
					`${mechanic.proficiencyType} proficiency choice`,
					selected.every((value) => options.some((entry) => entry.slug === value))
				);
			}

			proficiencyChoices.push({
				key,
				proficiencyType: mechanic.proficiencyType,
				count: mechanic.count,
				options,
				selected
			});
		}
	}

	for (const entry of [...equipmentContext.classEquipment, ...equipmentContext.backgroundEquipment]) {
		if (entry.type !== 'choice') {
			continue;
		}

		const key = `equipment:${equipmentChoices.length}`;
		const options = entry.options
			.map((slug) => equipmentContext.equipmentCatalog.find((item) => item.slug === slug))
			.filter((item): item is EquipmentCatalogEntry => Boolean(item));
		const selected = input.equipmentChoices
			.filter((choice) => choice.key === key)
			.map((choice) => choice.value);

		if (strict) {
			validateSelectionCount(
				selected,
				1,
				'equipment choice',
				selected.every((value) => options.some((option) => option.slug === value))
			);
		}

		equipmentChoices.push({
			key,
			count: 1,
			options,
			selected
		});
	}

	return {
		languageChoices,
		proficiencyChoices,
		equipmentChoices
	};
}

function resolveGuidedSelections(catalog: GuidedCharacterCatalog, input: CharacterGuidedInput) {
	const species = findRequiredOption(catalog.speciesOptions, input.speciesId, 'species');
	const subspecies = input.subspeciesId
		? findOptionalOption(catalog.subspeciesOptions, input.subspeciesId, 'subspecies')
		: undefined;
	const characterClass = findRequiredOption(catalog.classOptions, input.classId, 'class');
	const subclass = input.subclassId
		? findOptionalOption(catalog.subclassOptions, input.subclassId, 'subclass')
		: undefined;
	const background = findRequiredOption(
		catalog.backgroundOptions,
		input.backgroundId,
		'background'
	);

	if (subspecies && subspecies.speciesSlug !== species.slug) {
		throw new Error('Please choose a valid subspecies for the selected species.');
	}

	if (subclass && subclass.classSlug !== characterClass.slug) {
		throw new Error('Please choose a valid subclass for the selected class.');
	}

	return {
		species,
		subspecies,
		characterClass,
		subclass,
		background,
		selectedMechanics: [
			...species.mechanics,
			...(subspecies?.mechanics ?? []),
			...characterClass.mechanics,
			...(subclass?.mechanics ?? []),
			...background.mechanics
		]
	};
}

function createGuidedLinkedContentSelections(
	species: GuidedCharacterSpeciesOption,
	subspecies: GuidedCharacterSubspeciesOption | undefined,
	characterClass: GuidedCharacterClassOption,
	subclass: GuidedCharacterSubclassOption | undefined,
	background: GuidedCharacterBackgroundOption
): CharacterLinkedContentSelection[] {
	return [
		{
			entityType: 'species',
			entityId: species.id,
			entityName: species.name,
			rulesetCode: species.rulesetCode,
			contentMode: species.contentMode
		},
		...(subspecies
			? [
					{
						entityType: 'subspecies' as const,
						entityId: subspecies.id,
						entityName: subspecies.name,
						rulesetCode: subspecies.rulesetCode,
						contentMode: subspecies.contentMode
					}
				]
			: []),
		{
			entityType: 'class',
			entityId: characterClass.id,
			entityName: characterClass.name,
			rulesetCode: characterClass.rulesetCode,
			contentMode: characterClass.contentMode
		},
		...(subclass
			? [
					{
						entityType: 'subclass' as const,
						entityId: subclass.id,
						entityName: subclass.name,
						rulesetCode: subclass.rulesetCode,
						contentMode: subclass.contentMode
					}
				]
			: []),
		{
			entityType: 'background',
			entityId: background.id,
			entityName: background.name,
			rulesetCode: background.rulesetCode,
			contentMode: background.contentMode
		}
	];
}

function validateSelectionCount(
	selected: string[],
	requiredCount: number,
	label: string,
	allOptionsValid: boolean
) {
	const uniqueSelections = [...new Set(selected)];

	if (!allOptionsValid) {
		throw new Error(`Please choose only valid options for each ${label}.`);
	}

	if (uniqueSelections.length !== selected.length) {
		throw new Error(`Please avoid duplicate picks in each ${label}.`);
	}

	if (selected.length < requiredCount) {
		throw new Error(`Please complete every required ${label}.`);
	}

	if (selected.length > requiredCount) {
		throw new Error(`Please keep each ${label} within the allowed number of picks.`);
	}
}

function selectProficiencyVocabularyOptions(
	vocabularies: SharedRulesVocabularyCatalog,
	proficiencyType: 'skill' | 'tool',
	allowedSlugs: string[]
) {
	const source =
		proficiencyType === 'skill' ? vocabularies.skillProficiencies : vocabularies.toolProficiencies;

	return source.filter((entry) => allowedSlugs.includes(entry.slug));
}

function summarizeGrantedFeatureLines(mechanics: GameMechanic[]): string[] {
	const lines: string[] = [];

	for (const mechanic of mechanics) {
		if (
			mechanic.type === 'language' &&
			!lines.includes(`Language: ${humanizeToken(mechanic.language)}`)
		) {
			lines.push(`Language: ${humanizeToken(mechanic.language)}`);
			continue;
		}

		if (mechanic.type === 'proficiency') {
			const line = `${humanizeToken(mechanic.proficiencyType)} proficiency: ${humanizeToken(mechanic.value)}`;

			if (!lines.includes(line)) {
				lines.push(line);
			}
		}
	}

	return lines;
}

function summarizeResolvedChoiceLines(
	choiceResolution: GuidedChoiceResolution,
	equipmentCatalog: EquipmentCatalogEntry[]
): string[] {
	const lines: string[] = [];

	for (const choice of choiceResolution.languageChoices) {
		if (choice.selected.length === 0) {
			continue;
		}

		lines.push(`Chosen languages: ${choice.selected.map(humanizeToken).join(', ')}`);
	}

	for (const choice of choiceResolution.proficiencyChoices) {
		if (choice.selected.length === 0) {
			continue;
		}

		lines.push(
			`Chosen ${humanizeToken(choice.proficiencyType)} proficiencies: ${choice.selected
				.map(humanizeToken)
				.join(', ')}`
		);
	}

	for (const choice of choiceResolution.equipmentChoices) {
		if (choice.selected.length === 0) {
			continue;
		}

		lines.push(
			`Chosen equipment: ${choice.selected
				.map(
					(slug) =>
						equipmentCatalog.find((entry) => entry.slug === slug)?.name ?? humanizeToken(slug)
				)
				.join(', ')}`
		);
	}

	return lines;
}

function summarizePendingChoiceLines(choiceResolution: GuidedChoiceResolution): string[] {
	const lines: string[] = [];

	for (const choice of choiceResolution.languageChoices) {
		const remaining = choice.count - choice.selected.length;

		if (remaining > 0) {
			lines.push(
				`Choose ${remaining} more ${remaining === 1 ? 'language' : 'languages'} for ${humanizeToken(choice.key)}.`
			);
		}
	}

	for (const choice of choiceResolution.proficiencyChoices) {
		const remaining = choice.count - choice.selected.length;

		if (remaining > 0) {
			lines.push(
				`Choose ${remaining} more ${humanizeToken(choice.proficiencyType)} ${remaining === 1 ? 'proficiency' : 'proficiencies'} for ${humanizeToken(choice.key)}.`
			);
		}
	}

	for (const choice of choiceResolution.equipmentChoices) {
		const remaining = choice.count - choice.selected.length;

		if (remaining > 0) {
			lines.push(`Choose ${remaining} more equipment package for ${humanizeToken(choice.key)}.`);
		}
	}

	return lines;
}

function createGuidedNoteItems(
	grantedFeatureLines: string[],
	resolvedChoiceLines: string[],
	pendingChoiceLines: string[]
): CharacterNoteItem[] {
	const noteItems: CharacterNoteItem[] = [];

	if (grantedFeatureLines.length > 0) {
		noteItems.push({
			title: 'Guided build grants',
			content: grantedFeatureLines.join('\n')
		});
	}

	if (resolvedChoiceLines.length > 0) {
		noteItems.push({
			title: 'Guided build choices',
			content: resolvedChoiceLines.join('\n')
		});
	}

	if (pendingChoiceLines.length > 0) {
		noteItems.push({
			title: 'Guided follow-up choices',
			content: pendingChoiceLines.join('\n')
		});
	}

	return noteItems;
}

function deriveInventoryItems(
	classEquipment: GuidedEquipmentEntry[],
	backgroundEquipment: GuidedEquipmentEntry[],
	choiceResolution: GuidedChoiceResolution,
	equipmentCatalog: EquipmentCatalogEntry[]
): CharacterInventoryItem[] {
	const inventoryItems: CharacterInventoryItem[] = [];
	let equipmentChoiceIndex = 0;

	for (const entry of [...classEquipment, ...backgroundEquipment]) {
		if (entry.type === 'item') {
			const equipment = equipmentCatalog.find((item) => item.slug === entry.id);

			if (!equipment) {
				continue;
			}

			inventoryItems.push(
				createInventoryItemFromEquipment(equipment, entry.quantity ?? 1, entry.note)
			);
			continue;
		}

		const choice = choiceResolution.equipmentChoices[equipmentChoiceIndex];
		equipmentChoiceIndex += 1;

		for (const selectedSlug of choice?.selected ?? []) {
			const equipment = equipmentCatalog.find((item) => item.slug === selectedSlug);

			if (!equipment) {
				continue;
			}

			inventoryItems.push(createInventoryItemFromEquipment(equipment, 1, entry.note));
		}
	}

	return inventoryItems;
}

function createInventoryItemFromEquipment(
	equipment: EquipmentCatalogEntry,
	quantity: number,
	note?: string
): CharacterInventoryItem {
	const baseDescription = equipment.description ?? equipment.summary ?? '';
	const description =
		note && note.trim().length > 0
			? `${baseDescription}${baseDescription.length > 0 ? '\n\n' : ''}${note}`
			: baseDescription || undefined;

	return {
		equipmentId: equipment.id,
		name: equipment.name,
		quantity,
		description,
		weight: equipment.weight ?? undefined,
		value: equipment.value ?? undefined,
		isEquipped: Boolean(equipment.isEquippable)
	};
}

function deriveAttackItems(
	equipmentCatalog: EquipmentCatalogEntry[],
	inventoryItems: CharacterInventoryItem[],
	abilityScores: Record<Ability, number>
): CharacterAttackItem[] {
	const strengthModifier = calculateAbilityModifier(abilityScores.strength);
	const dexterityModifier = calculateAbilityModifier(abilityScores.dexterity);
	const proficiencyBonus = 2;
	const attacks: CharacterAttackItem[] = [];
	const seenKeys = new Set<string>();

	for (const item of inventoryItems) {
		const equipment = item.equipmentId
			? equipmentCatalog.find((entry) => entry.id === item.equipmentId)
			: equipmentCatalog.find((entry) => entry.name === item.name);

		if (!equipment?.isWeapon) {
			continue;
		}

		const dedupeKey = item.equipmentId ?? item.name;
		if (seenKeys.has(dedupeKey)) {
			continue;
		}

		seenKeys.add(dedupeKey);
		const attackModifier = selectWeaponAttackModifier(equipment, strengthModifier, dexterityModifier);

		attacks.push({
			equipmentId: equipment.id,
			name: equipment.name,
			attackBonus: formatModifier(attackModifier + proficiencyBonus),
			damage: equipment.damage ?? undefined,
			damageType: equipment.damageType ?? undefined,
			range: equipment.range ?? undefined,
			description: equipment.description ?? equipment.summary ?? undefined
		});
	}

	return attacks;
}

function selectWeaponAttackModifier(
	equipment: EquipmentCatalogEntry,
	strengthModifier: number,
	dexterityModifier: number
): number {
	const range = equipment.range?.toLowerCase() ?? '';
	const properties = equipment.properties.map((property) => property.toLowerCase());
	const isFinesse = properties.some((property) => property.includes('finesse'));
	const isRanged =
		range.includes('ranged') ||
		range.includes('ammunition') ||
		range.includes('feet') ||
		/\d/.test(range);

	if (isRanged) {
		return dexterityModifier;
	}

	if (isFinesse) {
		return Math.max(strengthModifier, dexterityModifier);
	}

	return strengthModifier;
}

function formatModifier(value: number): string {
	return value >= 0 ? `+${value}` : String(value);
}

function humanizeToken(value: string): string {
	return value
		.split(/[-_:]/)
		.filter((part) => part.length > 0)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function toFormString(value: unknown): string {
	if (typeof value === 'number') {
		return String(value);
	}

	if (typeof value === 'string') {
		return value;
	}

	return '';
}

function toStructuredFormString(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (Array.isArray(value)) {
		return JSON.stringify(value);
	}

	return '[]';
}
