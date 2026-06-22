import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';

export const spellItemSchema = contentBaseFieldsSchema.extend({
	level: z.number().int().min(0).max(9),
	school: z.string().trim().min(1),
	castingTime: z.string().trim().min(1).optional(),
	range: z.string().trim().min(1).optional(),
	components: z.string().trim().min(1).optional(),
	materials: z.string().trim().min(1).nullable().optional(),
	duration: z.string().trim().min(1).optional(),
	concentration: z.boolean().optional(),
	ritual: z.boolean().optional(),
	classSlugs: z.array(z.string().trim().min(1)).default([])
});

export const spellFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('spell'),
	items: z.array(spellItemSchema)
});
