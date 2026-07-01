import type { ZodType } from 'zod';
import { backgroundFileSchema } from './background.schema.ts';
import { characterClassFileSchema } from './character-class.schema.ts';
import { equipmentFileSchema } from './equipment.schema.ts';
import { featFileSchema } from './feat.schema.ts';
import { speciesFileSchema } from './species.schema.ts';
import { spellFileSchema } from './spell.schema.ts';
import { subspeciesFileSchema } from './subspecies.schema.ts';
import { subclassFileSchema } from './subclass.schema.ts';

export interface ContentFileSchemaResult {
	contentType: string;
	items: unknown[];
}

export const contentFileSchemaRegistry = {
	background: backgroundFileSchema,
	'character-class': characterClassFileSchema,
	equipment: equipmentFileSchema,
	feat: featFileSchema,
	species: speciesFileSchema,
	spell: spellFileSchema,
	subspecies: subspeciesFileSchema,
	subclass: subclassFileSchema
} satisfies Record<string, ZodType<ContentFileSchemaResult>>;

export type SupportedContentFileType = keyof typeof contentFileSchemaRegistry;

export function getContentFileSchema(contentType: string): ZodType<ContentFileSchemaResult> | null {
	return contentFileSchemaRegistry[contentType as SupportedContentFileType] ?? null;
}
