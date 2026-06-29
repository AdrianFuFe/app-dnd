import { z } from 'zod';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';
import { abilitySchema } from './game-mechanics.schema.ts';

const featPrerequisiteSchema = z.union([
	z.literal('spellcasting'),
	z.string().regex(/^level:(?:[1-9]|1[0-9]|20)$/, 'Use prerequisite format level:<1-20>'),
	z
		.string()
		.regex(
			new RegExp(
				`^ability:${abilitySchema.options.join('|')}:(?:[1-9]|[12][0-9]|30)$`
			),
			'Use prerequisite format ability:<ability>:<1-30>'
		),
	z
		.string()
		.regex(
			/^proficiency:(?:skill|weapon|armor|tool|saving_throw):[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'Use prerequisite format proficiency:<type>:<slug>'
		),
	z
		.string()
		.regex(
			/^(?:class|species|subspecies|spell|feat):[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'Use prerequisite format <class|species|subspecies|spell|feat>:<slug>'
		)
]);

export const featItemSchema = contentBaseFieldsSchema.extend({
	prerequisites: z.array(featPrerequisiteSchema).default([])
});

export const featFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('feat'),
	items: z.array(featItemSchema)
});
