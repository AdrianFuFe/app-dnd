import { z } from 'zod';
import { isKnownProficiencySlug } from './catalog-vocabularies.schema.ts';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';
import { abilitySchema } from './game-mechanics.schema.ts';

const levelPrerequisitePattern = /^level:(?:[1-9]|1[0-9]|20)$/;
const abilityPrerequisitePattern = new RegExp(
	`^ability:${abilitySchema.options.join('|')}:(?:[1-9]|[12][0-9]|30)$`
);
const proficiencyPrerequisitePattern =
	/^proficiency:(?:skill|weapon|armor|tool|saving_throw):[a-z0-9]+(?:-[a-z0-9]+)*$/;
const catalogReferencePrerequisitePattern =
	/^(?:class|species|subspecies|spell|feat):[a-z0-9]+(?:-[a-z0-9]+)*$/;

const featPrerequisiteSchema = z.string().superRefine((value, context) => {
	if (value === 'spellcasting') {
		return;
	}

	if (value.startsWith('level:')) {
		if (!levelPrerequisitePattern.test(value)) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Use prerequisite format level:<1-20>'
			});
		}
		return;
	}

	if (value.startsWith('ability:')) {
		if (!abilityPrerequisitePattern.test(value)) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Use prerequisite format ability:<ability>:<1-30>'
			});
		}
		return;
	}

	if (value.startsWith('proficiency:')) {
		if (!proficiencyPrerequisitePattern.test(value)) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Use prerequisite format proficiency:<type>:<slug>'
			});
			return;
		}

		const [, proficiencyType, proficiencySlug] = value.split(':', 3);

		if (
			!proficiencyType ||
			!proficiencySlug ||
			!isKnownProficiencySlug(proficiencyType, proficiencySlug)
		) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Unknown ${proficiencyType ?? 'unknown'} proficiency slug`
			});
		}
		return;
	}

	if (
		value.startsWith('class:') ||
		value.startsWith('species:') ||
		value.startsWith('subspecies:') ||
		value.startsWith('spell:') ||
		value.startsWith('feat:')
	) {
		if (!catalogReferencePrerequisitePattern.test(value)) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Use prerequisite format <class|species|subspecies|spell|feat>:<slug>'
			});
		}
		return;
	}

	context.addIssue({
		code: z.ZodIssueCode.custom,
		message:
			'Use prerequisite format spellcasting, level:<1-20>, ability:<ability>:<1-30>, proficiency:<type>:<slug>, or <class|species|subspecies|spell|feat>:<slug>'
	});
});

export const featItemSchema = contentBaseFieldsSchema.extend({
	prerequisites: z.array(featPrerequisiteSchema).default([])
});

export const featFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('feat'),
	items: z.array(featItemSchema)
});
