import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';

export const subspeciesItemSchema = contentBaseFieldsSchema.extend({
	speciesSlug: z.string().trim().min(1)
});

export const subspeciesFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('subspecies'),
	items: z.array(subspeciesItemSchema)
});
