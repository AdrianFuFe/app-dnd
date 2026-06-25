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
const optionalNumberSchema = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return undefined;
	}

	return value;
}, z.coerce.number().min(0).optional());
const booleanSchema = z.preprocess((value) => {
	if (value === true || value === 'true' || value === 'on' || value === 1 || value === '1') {
		return true;
	}

	if (
		value === false ||
		value === 'false' ||
		value === '' ||
		value === null ||
		value === undefined ||
		value === 0 ||
		value === '0'
	) {
		return false;
	}

	return value;
}, z.boolean());

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

export const characterInventoryItemSchema = z.object({
	name: requiredTextSchema,
	quantity: z.coerce.number().int().min(0),
	description: optionalTextSchema,
	weight: optionalNumberSchema,
	value: optionalTextSchema,
	isEquipped: booleanSchema
});

export const characterInventoryItemsSchema = z.preprocess((value) => {
	if (typeof value === 'string') {
		const trimmed = value.trim();

		if (trimmed.length === 0) {
			return [];
		}

		try {
			return JSON.parse(trimmed);
		} catch {
			return value;
		}
	}

	if (value === undefined || value === null) {
		return [];
	}

	return value;
}, z.array(characterInventoryItemSchema));

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
	notes: optionalTextSchema
});

export const characterCreateInputSchema = z
	.object({
		...characterIdentitySchema.shape,
		...characterAbilityScoresSchema.shape,
		...characterCombatStatsShape,
		...characterTextSectionsSchema.shape,
		inventoryItems: characterInventoryItemsSchema.default([])
	})
	.refine(({ currentHp, maxHp }) => currentHp <= maxHp, {
		message: 'Current HP cannot exceed max HP.',
		path: ['currentHp']
	});

export type CharacterCreateInput = z.infer<typeof characterCreateInputSchema>;
export type CharacterIdentityInput = z.infer<typeof characterIdentitySchema>;
export type CharacterAbilityScoresInput = z.infer<typeof characterAbilityScoresSchema>;
export type CharacterCombatStatsInput = z.infer<typeof characterCombatStatsSchema>;
export type CharacterInventoryItemInput = z.infer<typeof characterInventoryItemSchema>;
export type CharacterTextSectionsInput = z.infer<typeof characterTextSectionsSchema>;

export { abilityNames };
