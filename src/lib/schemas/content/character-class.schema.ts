import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';
import { equipmentEntriesSchema } from './equipment-entry.schema.ts';
import { abilitySchema } from './game-mechanics.schema.ts';
import { slugChoiceSchema, slugListSchema } from './selection.schema.ts';

const levelProgressionSchema = z.object({
	level: z.number().int().min(1).max(20),
	features: z.array(z.string().trim().min(1)).default([])
});

export const characterClassItemSchema = contentBaseFieldsSchema.extend({
	hitDie: z.number().int().positive(),
	primaryAbilities: z.array(abilitySchema).min(1),
	savingThrowProficiencies: z.array(abilitySchema).min(1),
	armorProficiencies: slugListSchema.default([]),
	weaponProficiencies: slugListSchema.default([]),
	toolProficiencies: slugListSchema.default([]),
	skillChoices: slugChoiceSchema.optional(),
	startingEquipment: equipmentEntriesSchema.default([]),
	spellcastingAbility: abilitySchema.nullable().optional(),
	progression: z.array(levelProgressionSchema).default([])
});

export const characterClassFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('character-class'),
	items: z.array(characterClassItemSchema)
});
