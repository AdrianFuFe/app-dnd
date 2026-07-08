import { z } from 'zod';
import {
	damageTypeSchema,
	isKnownProficiencySlug,
	languageSlugSchema
} from './catalog-vocabularies.schema.ts';
import { positiveSelectionCountSchema, slugOptionsSchema } from './selection.schema.ts';
import { slugSchema } from './slug.schema.ts';

export const abilitySchema = z.enum([
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma'
]);

const proficiencyTypeSchema = z.enum(['skill', 'weapon', 'armor', 'tool', 'saving_throw']);

const restTypeSchema = z.enum(['short_rest', 'long_rest']);

export const gameMechanicSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('ability_bonus'),
		ability: abilitySchema,
		value: z.number().int()
	}),
	z.object({
		type: z.literal('choose_ability_bonus'),
		count: positiveSelectionCountSchema,
		value: z.number().int(),
		allowed: z.array(abilitySchema).optional()
	}),
	z.object({
		type: z.literal('speed'),
		value: z.number().int().nonnegative()
	}),
	z.object({
		type: z.literal('darkvision'),
		range: z.number().int().nonnegative()
	}),
	z.object({
		type: z.literal('language'),
		mode: z.literal('fixed'),
		language: languageSlugSchema
	}),
	z.object({
		type: z.literal('choose_language'),
		count: positiveSelectionCountSchema
	}),
	z.object({
		type: z.literal('proficiency'),
		proficiencyType: proficiencyTypeSchema,
		value: slugSchema
	}).superRefine((value, context) => {
		if (!isKnownProficiencySlug(value.proficiencyType, value.value)) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['value'],
				message: `Unknown ${value.proficiencyType} proficiency slug`
			});
		}
	}),
	z.object({
		type: z.literal('choose_proficiency'),
		proficiencyType: z.enum(['skill', 'tool']),
		count: positiveSelectionCountSchema,
		options: slugOptionsSchema
	}).superRefine((value, context) => {
		for (const [index, option] of value.options.entries()) {
			if (!isKnownProficiencySlug(value.proficiencyType, option)) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['options', index],
					message: `Unknown ${value.proficiencyType} proficiency slug`
				});
			}
		}
	}),
	z.object({
		type: z.literal('resistance'),
		damageType: damageTypeSchema
	}),
	z.object({
		type: z.literal('spell_grant'),
		spellId: z.string().trim().min(1),
		ability: abilitySchema.optional()
	}),
	z.object({
		type: z.literal('spellcasting'),
		ability: abilitySchema
	}),
	z.object({
		type: z.literal('resource'),
		name: z.string().trim().min(1),
		maxFormula: z.string().trim().min(1),
		resetOn: restTypeSchema
	}),
	z.object({
		type: z.literal('feature'),
		featureId: z.string().trim().min(1)
	}),
	z.object({
		type: z.literal('source_derivation'),
		source: z.enum(['srd-5-1', 'srd-5-2', 'user-private', 'homebrew']),
		contentType: z.enum(['feat', 'spell']),
		slug: slugSchema,
		name: z.string().trim().min(1)
	}),
	z.object({
		type: z.literal('note'),
		text: z.string().trim().min(1)
	})
]);

export const gameMechanicsSchema = z.array(gameMechanicSchema);
