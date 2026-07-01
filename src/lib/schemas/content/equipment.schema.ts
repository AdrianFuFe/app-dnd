import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';

export const equipmentItemSchema = contentBaseFieldsSchema.extend({
	category: z.string().trim().min(1),
	weight: z.number().min(0).nullable().optional(),
	value: z.string().trim().min(1).nullable().optional(),
	damage: z.string().trim().min(1).nullable().optional(),
	damageType: z.string().trim().min(1).nullable().optional(),
	range: z.string().trim().min(1).nullable().optional(),
	properties: z.array(z.string().trim().min(1)).default([]),
	isWeapon: z.boolean().default(false),
	isEquippable: z.boolean().default(false)
});

export const equipmentFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('equipment'),
	items: z.array(equipmentItemSchema)
});
