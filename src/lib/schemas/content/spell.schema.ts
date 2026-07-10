import { z } from 'zod';
import { spellSchoolSlugSchema } from './catalog-vocabularies.schema.ts';
import { contentBaseFieldsSchema, contentFileBaseSchema } from './common-content.schema.ts';

const spellComponentsTokenSchema = z.enum(['V', 'S', 'M']);

const spellComponentsSchema = z
	.string()
	.trim()
	.min(1)
	.superRefine((value, context) => {
		const components = value.split(',').map((component) => component.trim());
		const uniqueComponents = new Set<string>();

		for (const [index, component] of components.entries()) {
			const parsed = spellComponentsTokenSchema.safeParse(component);

			if (!parsed.success) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Use spell components as a comma-separated list of V, S, and M',
					path: [index]
				});
				continue;
			}

			if (uniqueComponents.has(component)) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Duplicate spell component "${component}"`,
					path: [index]
				});
			}

			uniqueComponents.add(component);
		}
	});

export const spellItemSchema = contentBaseFieldsSchema
	.extend({
		level: z.number().int().min(0).max(9),
		school: spellSchoolSlugSchema,
		castingTime: z.string().trim().min(1).optional(),
		range: z.string().trim().min(1).optional(),
		components: spellComponentsSchema.optional(),
		materials: z.string().trim().min(1).nullable().optional(),
		duration: z.string().trim().min(1).optional(),
		concentration: z.boolean().optional(),
		ritual: z.boolean().optional(),
		classSlugs: z.array(z.string().trim().min(1)).default([])
	})
	.superRefine((value, context) => {
		const hasMaterialComponent = value.components
			?.split(',')
			.map((component) => component.trim())
			.includes('M');
		const hasMaterialsText =
			typeof value.materials === 'string' && value.materials.trim().length > 0;

		if (hasMaterialComponent && !hasMaterialsText) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['materials'],
				message: 'Provide materials text when spell components include M'
			});
		}

		if (!hasMaterialComponent && hasMaterialsText) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['materials'],
				message: 'Materials text is only allowed when spell components include M'
			});
		}
	});

export const spellFileSchema = contentFileBaseSchema.extend({
	contentType: z.literal('spell'),
	items: z.array(spellItemSchema)
});
