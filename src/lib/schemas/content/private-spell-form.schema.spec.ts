import { describe, expect, it } from 'vitest';
import {
	createPrivateSpellFormValues,
	flattenPrivateSpellFormErrors,
	privateSpellFormSchema
} from './private-spell-form.schema.ts';

describe('createPrivateSpellFormValues', () => {
	it('normalizes unknown values to defaults', () => {
		expect(
			createPrivateSpellFormValues({
				name: 'Arc Light',
				level: 1,
				school: null,
				summary: undefined,
				concentration: 'on',
				ritual: 0
			})
		).toEqual({
			name: 'Arc Light',
			level: '1',
			school: '',
			summary: '',
			description: '',
			castingTime: '',
			range: '',
			components: '',
			materials: '',
			duration: '',
			classSlugsText: '',
			concentration: true,
			ritual: false
		});
	});
});

describe('privateSpellFormSchema', () => {
	it('derives a slug and parses spell-specific fields', () => {
		const result = privateSpellFormSchema.parse({
			name: 'Arc Light',
			level: '1',
			school: 'evocation',
			summary: 'Focused arcane flash.',
			description: 'A guided burst of light.',
			castingTime: '1 action',
			range: '60 feet',
			components: 'V, S, M',
			materials: 'A polished copper wire.',
			duration: 'Instantaneous',
			classSlugsText: 'mago\nclerigo',
			concentration: true,
			ritual: false
		});

		expect(result).toEqual({
			slug: 'arc-light',
			name: 'Arc Light',
			level: 1,
			school: 'evocation',
			summary: 'Focused arcane flash.',
			description: 'A guided burst of light.',
			castingTime: '1 action',
			range: '60 feet',
			components: 'V, S, M',
			materials: 'A polished copper wire.',
			duration: 'Instantaneous',
			classSlugs: ['mago', 'clerigo'],
			concentration: true,
			ritual: false
		});
	});

	it('reports spell material validation against the materials field', () => {
		const result = privateSpellFormSchema.safeParse({
			name: 'Arc Light',
			level: '1',
			school: 'evocation',
			summary: '',
			description: '',
			castingTime: '',
			range: '',
			components: 'V, S',
			materials: 'A polished copper wire.',
			duration: '',
			classSlugsText: '',
			concentration: false,
			ritual: false
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(flattenPrivateSpellFormErrors(result.error).materials?.[0]).toContain(
			'only allowed when spell components include M'
		);
	});
});
