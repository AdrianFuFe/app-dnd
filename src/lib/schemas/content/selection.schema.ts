import { z } from 'zod';
import { slugSchema } from './slug.schema.ts';

export const positiveSelectionCountSchema = z.number().int().positive();

export const slugListSchema = z.array(slugSchema);

export const slugOptionsSchema = z.array(slugSchema).min(1);

export const slugChoiceSchema = z.object({
	count: positiveSelectionCountSchema,
	options: slugOptionsSchema
});
