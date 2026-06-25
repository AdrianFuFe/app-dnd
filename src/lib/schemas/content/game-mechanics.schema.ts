import { z } from 'zod';

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
		count: z.number().int().positive(),
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
		language: z.string().trim().min(1)
	}),
	z.object({
		type: z.literal('choose_language'),
		count: z.number().int().positive()
	}),
	z.object({
		type: z.literal('proficiency'),
		proficiencyType: proficiencyTypeSchema,
		value: z.string().trim().min(1)
	}),
	z.object({
		type: z.literal('choose_proficiency'),
		proficiencyType: z.enum(['skill', 'tool']),
		count: z.number().int().positive(),
		options: z.array(z.string().trim().min(1)).min(1)
	}),
	z.object({
		type: z.literal('resistance'),
		damageType: z.string().trim().min(1)
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
		type: z.literal('note'),
		text: z.string().trim().min(1)
	})
]);

export const gameMechanicsSchema = z.array(gameMechanicSchema);
