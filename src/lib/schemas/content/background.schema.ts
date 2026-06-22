import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';

export const backgroundItemSchema = contentBaseFieldsSchema.extend({
	skillProficiencies: z.array(z.string().trim().min(1)).default([]),
	toolProficiencies: z.array(z.string().trim().min(1)).default([]),
	languages: z.array(z.string().trim().min(1)).default([]),
	equipment: z.array(z.string().trim().min(1)).default([]),
	featureName: z.string().trim().min(1).nullable().optional()
});

export const backgroundFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('background'),
	items: z.array(backgroundItemSchema)
});
