import { z } from 'zod';
import {
	skillProficiencySlugSchema,
	toolProficiencySlugSchema
} from './catalog-vocabularies.schema.ts';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';
import { equipmentEntriesSchema } from './equipment-entry.schema.ts';
import { languageEntriesSchema } from './language-entry.schema.ts';

export const backgroundItemSchema = contentBaseFieldsSchema.extend({
	skillProficiencies: z.array(skillProficiencySlugSchema).default([]),
	toolProficiencies: z.array(toolProficiencySlugSchema).default([]),
	languages: languageEntriesSchema.default([]),
	equipment: equipmentEntriesSchema.default([]),
	featureName: z.string().trim().min(1).nullable().optional()
});

export const backgroundFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('background'),
	items: z.array(backgroundItemSchema)
});
