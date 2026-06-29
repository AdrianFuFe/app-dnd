import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';

const subclassFeatureSchema = z.object({
	level: z.number().int().min(1).max(20),
	featureId: z.string().trim().min(1).optional(),
	name: z.string().trim().min(1),
	summary: z.string().trim().min(1).nullable().optional(),
	description: z.string().trim().min(1).nullable().optional(),
	mechanics: contentBaseFieldsSchema.shape.mechanics
});

const grantedSpellsByLevelSchema = z.object({
	level: z.number().int().min(1).max(20),
	spellSlugs: z.array(z.string().trim().min(1)).min(1)
});

export const subclassItemSchema = contentBaseFieldsSchema.extend({
	classSlug: z.string().trim().min(1),
	grantedSpellsByLevel: z.array(grantedSpellsByLevelSchema).default([]),
	features: z.array(subclassFeatureSchema).default([])
});

export const subclassFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('subclass'),
	items: z.array(subclassItemSchema)
});
