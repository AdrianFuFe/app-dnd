import { z } from 'zod';
import { featItemSchema } from './feat.schema.ts';

const optionalTextSchema = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}, z.string().trim().min(1).optional());

export const privateFeatFormFieldNames = [
	'name',
	'summary',
	'description',
	'prerequisitesText'
] as const;

export type PrivateFeatFormFieldName = (typeof privateFeatFormFieldNames)[number];

export type PrivateFeatFormValues = Record<PrivateFeatFormFieldName, string>;

type PrivateFeatFormValueSource = Partial<Record<PrivateFeatFormFieldName, unknown>>;

export type PrivateFeatCreateInput = {
	slug: string;
	name: string;
	summary?: string;
	description?: string;
	prerequisites: string[];
};

export type PrivateFeatFormFieldErrors = Partial<Record<PrivateFeatFormFieldName, string[]>>;

export function createPrivateFeatFormValues(
	source: PrivateFeatFormValueSource = {}
): PrivateFeatFormValues {
	return {
		name: toFormString(source.name),
		summary: toFormString(source.summary),
		description: toFormString(source.description),
		prerequisitesText: toFormString(source.prerequisitesText)
	};
}

export function createPrivateFeatFormValuesFromInput(input: {
	name: string;
	summary: string | null;
	description: string | null;
	prerequisites: string[];
}): PrivateFeatFormValues {
	return createPrivateFeatFormValues({
		name: input.name,
		summary: input.summary ?? '',
		description: input.description ?? '',
		prerequisitesText: input.prerequisites.join('\n')
	});
}

function toFormString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function createSlugFromName(name: string): string {
	return name
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}

function parsePrerequisitesText(value?: string): string[] {
	if (!value) {
		return [];
	}

	return value
		.split(/\r?\n|,/)
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

export const privateFeatFormSchema = z
	.object({
		name: z.string().trim().min(1),
		summary: optionalTextSchema,
		description: optionalTextSchema,
		prerequisitesText: optionalTextSchema
	})
	.transform<PrivateFeatCreateInput>((input, context) => {
		const slug = createSlugFromName(input.name);

		if (slug.length === 0) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Name must contain letters or numbers that can become a slug.',
				path: ['name']
			});
			return z.NEVER;
		}

		const result = featItemSchema.safeParse({
			slug,
			name: input.name,
			summary: input.summary,
			description: input.description,
			visibility: 'private',
			mechanics: [],
			prerequisites: parsePrerequisitesText(input.prerequisitesText)
		});

		if (!result.success) {
			for (const issue of result.error.issues) {
				const path =
					issue.path[0] === 'prerequisites'
						? (['prerequisitesText'] as (string | number)[])
						: issue.path;

				context.addIssue({
					...issue,
					path
				});
			}

			return z.NEVER;
		}

		return {
			slug: result.data.slug,
			name: result.data.name,
			summary: result.data.summary ?? undefined,
			description: result.data.description ?? undefined,
			prerequisites: result.data.prerequisites
		};
	});

export function flattenPrivateFeatFormErrors(error: z.ZodError): PrivateFeatFormFieldErrors {
	const fieldErrors: PrivateFeatFormFieldErrors = {};

	for (const issue of error.issues) {
		const path = issue.path[0];

		if (!privateFeatFormFieldNames.includes(path as PrivateFeatFormFieldName)) {
			continue;
		}

		const field = path as PrivateFeatFormFieldName;
		fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
	}

	return fieldErrors;
}
