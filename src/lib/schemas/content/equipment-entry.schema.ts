import { z } from 'zod';
import { slugSchema } from './slug.schema.ts';

const equipmentItemEntrySchema = z.object({
	type: z.literal('item'),
	id: slugSchema,
	quantity: z.number().int().positive().optional(),
	note: z.string().trim().min(1).optional()
});

const equipmentChoiceEntrySchema = z.object({
	type: z.literal('choice'),
	options: z.array(slugSchema).min(1),
	note: z.string().trim().min(1).optional()
});

export const equipmentEntrySchema = z.discriminatedUnion('type', [
	equipmentItemEntrySchema,
	equipmentChoiceEntrySchema
]);

export const equipmentEntriesSchema = z.array(equipmentEntrySchema);
