import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';

export const speciesItemSchema = contentBaseFieldsSchema.extend({
	size: z.string().trim().min(1).optional(),
	baseSpeed: z.number().int().nonnegative().optional(),
	languages: z.array(z.string().trim().min(1)).default([]),
	subspeciesSlugs: z.array(z.string().trim().min(1)).default([])
});

export const speciesFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('species'),
	items: z.array(speciesItemSchema)
});
