import { z } from 'zod';
import { gameMechanicsSchema } from './game-mechanics.schema.ts';

export const contentSourceSchema = z.enum(['srd-5-1', 'srd-5-2', 'user-private', 'homebrew']);

export const contentVisibilitySchema = z.enum(['private', 'campaign', 'shared', 'public']);

export const contentTypeSchema = z.enum([
	'species',
	'subspecies',
	'character-class',
	'subclass',
	'background',
	'spell',
	'equipment',
	'condition',
	'feat',
	'monster'
]);

export const slugSchema = z
	.string()
	.trim()
	.min(1)
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		'Slug must use lowercase letters, numbers, and hyphens only'
	);

export const contentBaseFieldsSchema = z.object({
	slug: slugSchema,
	name: z.string().trim().min(1),
	summary: z.string().trim().min(1).nullable().optional(),
	description: z.string().trim().min(1).nullable().optional(),
	visibility: contentVisibilitySchema.default('private'),
	mechanics: gameMechanicsSchema.default([])
});

export const contentFileBaseSchema = z.object({
	schemaVersion: z.literal(1),
	source: contentSourceSchema,
	contentType: contentTypeSchema,
	items: z.array(z.unknown())
});
