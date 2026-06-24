import { z } from 'zod';
import { abilityNames } from '$lib/types/domain/character';

const requiredTextSchema = z.string().trim().min(1);

const optionalTextSchema = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}, z.string().trim().min(1).optional());

const optionalUuidSchema = optionalTextSchema.pipe(z.uuid().optional());

const levelSchema = z.coerce.number().int().min(1).max(20);
const abilityScoreSchema = z.coerce.number().int().min(1).max(30);

export const characterAbilityScoresSchema = z.object({
	strength: abilityScoreSchema,
	dexterity: abilityScoreSchema,
	constitution: abilityScoreSchema,
	intelligence: abilityScoreSchema,
	wisdom: abilityScoreSchema,
	charisma: abilityScoreSchema
});

const characterCombatStatsShape = {
	maxHp: z.coerce.number().int().min(1),
	currentHp: z.coerce.number().int().min(0),
	temporaryHp: z.coerce.number().int().min(0),
	armorClass: z.coerce.number().int().min(0),
	initiative: z.coerce.number().int(),
	speed: z.coerce.number().int().min(0),
	hitDice: optionalTextSchema
};

export const characterCombatStatsSchema = z
	.object(characterCombatStatsShape)
	.refine(({ currentHp, maxHp }) => currentHp <= maxHp, {
		message: 'Current HP cannot exceed max HP.',
		path: ['currentHp']
	});

export const characterIdentitySchema = z.object({
	name: requiredTextSchema,
	speciesId: optionalUuidSchema,
	subspeciesId: optionalUuidSchema,
	classId: optionalUuidSchema,
	subclassId: optionalUuidSchema,
	backgroundId: optionalUuidSchema,
	race: optionalTextSchema,
	subrace: optionalTextSchema,
	className: optionalTextSchema,
	subclass: optionalTextSchema,
	level: levelSchema,
	background: optionalTextSchema,
	story: optionalTextSchema
});

export const characterTextSectionsSchema = z.object({
	attacks: optionalTextSchema,
	spells: optionalTextSchema,
	inventory: optionalTextSchema,
	notes: optionalTextSchema
});

export const characterCreateInputSchema = z
	.object({
		...characterIdentitySchema.shape,
		...characterAbilityScoresSchema.shape,
		...characterCombatStatsShape,
		...characterTextSectionsSchema.shape
	})
	.refine(({ currentHp, maxHp }) => currentHp <= maxHp, {
		message: 'Current HP cannot exceed max HP.',
		path: ['currentHp']
	});

export type CharacterCreateInput = z.infer<typeof characterCreateInputSchema>;
export type CharacterIdentityInput = z.infer<typeof characterIdentitySchema>;
export type CharacterAbilityScoresInput = z.infer<typeof characterAbilityScoresSchema>;
export type CharacterCombatStatsInput = z.infer<typeof characterCombatStatsSchema>;
export type CharacterTextSectionsInput = z.infer<typeof characterTextSectionsSchema>;

export { abilityNames };
