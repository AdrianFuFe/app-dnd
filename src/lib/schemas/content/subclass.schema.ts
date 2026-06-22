import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema';

const subclassFeatureSchema = z.object({
	level: z.number().int().min(1).max(20),
	name: z.string().trim().min(1),
	summary: z.string().trim().min(1).nullable().optional(),
	description: z.string().trim().min(1).nullable().optional(),
	mechanics: contentBaseFieldsSchema.shape.mechanics
});

export const subclassItemSchema = contentBaseFieldsSchema.extend({
	classSlug: z.string().trim().min(1),
	features: z.array(subclassFeatureSchema).default([])
});

export const subclassFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('subclass'),
	items: z.array(subclassItemSchema)
});
