import { z } from 'zod';
import { spellItemSchema } from './spell.schema.ts';

const optionalTextSchema = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}, z.string().trim().min(1).optional());

const spellLevelSchema = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return Number.NaN;
	}

	return Number(trimmed);
}, z.number().int().min(0).max(9));

export const privateSpellFormFieldNames = [
	'name',
	'level',
	'school',
	'summary',
	'description',
	'castingTime',
	'range',
	'components',
	'materials',
	'duration',
	'classSlugsText',
	'concentration',
	'ritual'
] as const;

export type PrivateSpellFormFieldName = (typeof privateSpellFormFieldNames)[number];

export type PrivateSpellFormValues = {
	name: string;
	level: string;
	school: string;
	summary: string;
	description: string;
	castingTime: string;
	range: string;
	components: string;
	materials: string;
	duration: string;
	classSlugsText: string;
	concentration: boolean;
	ritual: boolean;
};

type PrivateSpellFormValueSource = Partial<Record<PrivateSpellFormFieldName, unknown>>;

export type PrivateSpellCreateInput = {
	slug: string;
	name: string;
	level: number;
	school: string;
	summary?: string;
	description?: string;
	castingTime?: string;
	range?: string;
	components?: string;
	materials?: string;
	duration?: string;
	classSlugs: string[];
	concentration: boolean;
	ritual: boolean;
};

export type PrivateSpellFormFieldErrors = Partial<Record<PrivateSpellFormFieldName, string[]>>;

export function createPrivateSpellFormValues(
	source: PrivateSpellFormValueSource = {}
): PrivateSpellFormValues {
	return {
		name: toFormString(source.name),
		level: toFormString(source.level),
		school: toFormString(source.school),
		summary: toFormString(source.summary),
		description: toFormString(source.description),
		castingTime: toFormString(source.castingTime),
		range: toFormString(source.range),
		components: toFormString(source.components),
		materials: toFormString(source.materials),
		duration: toFormString(source.duration),
		classSlugsText: toFormString(source.classSlugsText),
		concentration: toFormBoolean(source.concentration),
		ritual: toFormBoolean(source.ritual)
	};
}

export function createPrivateSpellFormValuesFromInput(input: {
	name: string;
	level: number;
	school: string;
	summary: string | null;
	description: string | null;
	castingTime: string | null;
	range: string | null;
	components: string | null;
	materials: string | null;
	duration: string | null;
	classSlugs: string[];
	concentration: boolean;
	ritual: boolean;
}): PrivateSpellFormValues {
	return createPrivateSpellFormValues({
		name: input.name,
		level: String(input.level),
		school: input.school,
		summary: input.summary ?? '',
		description: input.description ?? '',
		castingTime: input.castingTime ?? '',
		range: input.range ?? '',
		components: input.components ?? '',
		materials: input.materials ?? '',
		duration: input.duration ?? '',
		classSlugsText: input.classSlugs.join('\n'),
		concentration: input.concentration,
		ritual: input.ritual
	});
}

function toFormString(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (typeof value === 'number') {
		return String(value);
	}

	return '';
}

function toFormBoolean(value: unknown): boolean {
	if (typeof value === 'boolean') {
		return value;
	}

	return value === 'true' || value === 'on' || value === '1';
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

function parseClassSlugsText(value?: string): string[] {
	if (!value) {
		return [];
	}

	return value
		.split(/\r?\n|,/)
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

export const privateSpellFormSchema = z
	.object({
		name: z.string().trim().min(1),
		level: spellLevelSchema,
		school: z.string().trim().min(1),
		summary: optionalTextSchema,
		description: optionalTextSchema,
		castingTime: optionalTextSchema,
		range: optionalTextSchema,
		components: optionalTextSchema,
		materials: optionalTextSchema,
		duration: optionalTextSchema,
		classSlugsText: optionalTextSchema,
		concentration: z.boolean(),
		ritual: z.boolean()
	})
	.transform<PrivateSpellCreateInput>((input, context) => {
		const slug = createSlugFromName(input.name);

		if (slug.length === 0) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Name must contain letters or numbers that can become a slug.',
				path: ['name']
			});
			return z.NEVER;
		}

		const result = spellItemSchema.safeParse({
			slug,
			name: input.name,
			level: input.level,
			school: input.school,
			summary: input.summary,
			description: input.description,
			castingTime: input.castingTime,
			range: input.range,
			components: input.components,
			materials: input.materials ?? null,
			duration: input.duration,
			classSlugs: parseClassSlugsText(input.classSlugsText),
			concentration: input.concentration,
			ritual: input.ritual,
			visibility: 'private',
			mechanics: []
		});

		if (!result.success) {
			for (const issue of result.error.issues) {
				const path =
					issue.path[0] === 'classSlugs'
						? (['classSlugsText'] as (string | number)[])
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
			level: result.data.level,
			school: result.data.school,
			summary: result.data.summary ?? undefined,
			description: result.data.description ?? undefined,
			castingTime: result.data.castingTime ?? undefined,
			range: result.data.range ?? undefined,
			components: result.data.components ?? undefined,
			materials: result.data.materials ?? undefined,
			duration: result.data.duration ?? undefined,
			classSlugs: result.data.classSlugs,
			concentration: result.data.concentration ?? false,
			ritual: result.data.ritual ?? false
		};
	});

export function flattenPrivateSpellFormErrors(error: z.ZodError): PrivateSpellFormFieldErrors {
	const fieldErrors: PrivateSpellFormFieldErrors = {};

	for (const issue of error.issues) {
		const path = issue.path[0];

		if (!privateSpellFormFieldNames.includes(path as PrivateSpellFormFieldName)) {
			continue;
		}

		const field = path as PrivateSpellFormFieldName;
		fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
	}

	return fieldErrors;
}
