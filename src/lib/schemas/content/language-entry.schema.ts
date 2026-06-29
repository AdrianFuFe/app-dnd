import { z } from 'zod';
import { slugSchema } from './slug.schema.ts';
import { positiveSelectionCountSchema } from './selection.schema.ts';

const fixedLanguageEntrySchema = z.object({
	type: z.literal('fixed'),
	language: slugSchema
});

const chooseLanguageEntrySchema = z.object({
	type: z.literal('choice'),
	count: positiveSelectionCountSchema,
	scope: z.enum(['any']).default('any')
});

export const languageEntrySchema = z.discriminatedUnion('type', [
	fixedLanguageEntrySchema,
	chooseLanguageEntrySchema
]);

export const languageEntriesSchema = z.array(languageEntrySchema);
