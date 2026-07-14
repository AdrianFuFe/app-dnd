import { z } from 'zod';

const requiredTextSchema = z.string().trim().min(1);
const optionalTextSchema = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}, z.string().trim().min(1).optional());

const requiredUuidSchema = z.string().trim().uuid();
const optionalUuidSchema = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return undefined;
	}

	return value;
}, z.string().trim().uuid().optional());

const baseAbilityScoreSchema = z.coerce.number().int().min(1).max(20);

const guidedChoiceEntrySchema = z.object({
	key: requiredTextSchema,
	value: requiredTextSchema
});

const guidedChoiceEntriesSchema = z.preprocess((value) => {
	if (typeof value === 'string') {
		const trimmed = value.trim();

		if (trimmed.length === 0) {
			return [];
		}

		try {
			return JSON.parse(trimmed);
		} catch {
			return value;
		}
	}

	if (value === undefined || value === null) {
		return [];
	}

	return value;
}, z.array(guidedChoiceEntrySchema));

export const characterGuidedInputSchema = z.object({
	name: requiredTextSchema,
	story: optionalTextSchema,
	speciesId: requiredUuidSchema,
	subspeciesId: optionalUuidSchema,
	classId: requiredUuidSchema,
	subclassId: optionalUuidSchema,
	backgroundId: requiredUuidSchema,
	strength: baseAbilityScoreSchema,
	dexterity: baseAbilityScoreSchema,
	constitution: baseAbilityScoreSchema,
	intelligence: baseAbilityScoreSchema,
	wisdom: baseAbilityScoreSchema,
	charisma: baseAbilityScoreSchema,
	abilityChoices: guidedChoiceEntriesSchema.default([]),
	languageChoices: guidedChoiceEntriesSchema.default([]),
	proficiencyChoices: guidedChoiceEntriesSchema.default([]),
	equipmentChoices: guidedChoiceEntriesSchema.default([])
});

export type CharacterGuidedInput = z.infer<typeof characterGuidedInputSchema>;
