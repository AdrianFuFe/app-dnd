import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';

export const featItemSchema = contentBaseFieldsSchema.extend({
	prerequisites: z.array(z.string().trim().min(1)).default([])
});

export const featFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('feat'),
	items: z.array(featItemSchema)
});
