import { z } from 'zod';
import {
	armorProficiencySlugSchema,
	savingThrowProficiencySlugSchema,
	skillProficiencySlugSchema,
	toolProficiencySlugSchema,
	weaponProficiencySlugSchema
} from './catalog-vocabularies.schema.ts';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';
import { equipmentEntriesSchema } from './equipment-entry.schema.ts';
import { abilitySchema } from './game-mechanics.schema.ts';

const levelProgressionSchema = z.object({
	level: z.number().int().min(1).max(20),
	features: z.array(z.string().trim().min(1)).default([])
});

const skillChoiceSchema = z.object({
	count: z.number().int().positive(),
	options: z.array(skillProficiencySlugSchema).min(1)
});

export const characterClassItemSchema = contentBaseFieldsSchema.extend({
	hitDie: z.number().int().positive(),
	primaryAbilities: z.array(abilitySchema).min(1),
	savingThrowProficiencies: z.array(savingThrowProficiencySlugSchema).min(1),
	armorProficiencies: z.array(armorProficiencySlugSchema).default([]),
	weaponProficiencies: z.array(weaponProficiencySlugSchema).default([]),
	toolProficiencies: z.array(toolProficiencySlugSchema).default([]),
	skillChoices: skillChoiceSchema.optional(),
	startingEquipment: equipmentEntriesSchema.default([]),
	spellcastingAbility: abilitySchema.nullable().optional(),
	progression: z.array(levelProgressionSchema).default([])
});

export const characterClassFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('character-class'),
	items: z.array(characterClassItemSchema)
});
