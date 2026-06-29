import { z } from 'zod';
import { slugSchema } from './common-content.schema.ts';

const fixedLanguageEntrySchema = z.object({
	type: z.literal('fixed'),
	language: slugSchema
});

const chooseLanguageEntrySchema = z.object({
	type: z.literal('choice'),
	count: z.number().int().positive(),
	scope: z.enum(['any']).default('any')
});

export const languageEntrySchema = z.discriminatedUnion('type', [
	fixedLanguageEntrySchema,
	chooseLanguageEntrySchema
]);

export const languageEntriesSchema = z.array(languageEntrySchema);
