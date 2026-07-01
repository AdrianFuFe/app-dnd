import { z } from 'zod';
import { languageSlugSchema } from './catalog-vocabularies.schema.ts';
import { positiveSelectionCountSchema } from './selection.schema.ts';

const fixedLanguageEntrySchema = z.object({
	type: z.literal('fixed'),
	language: languageSlugSchema
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
