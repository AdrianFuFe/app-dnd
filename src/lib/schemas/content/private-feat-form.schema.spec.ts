import { describe, expect, it } from 'vitest';
import {
	createPrivateFeatFormValues,
	flattenPrivateFeatFormErrors,
	privateFeatFormSchema
} from './private-feat-form.schema.ts';

describe('createPrivateFeatFormValues', () => {
	it('normalizes unknown values to empty strings', () => {
		expect(
			createPrivateFeatFormValues({
				name: 'Observant Echo',
				summary: null,
				description: undefined,
				prerequisitesText: 42
			})
		).toEqual({
			name: 'Observant Echo',
			summary: '',
			description: '',
			prerequisitesText: ''
		});
	});
});

describe('privateFeatFormSchema', () => {
	it('derives a slug and parses line-based prerequisites', () => {
		const result = privateFeatFormSchema.parse({
			name: 'Observant Echo',
			summary: 'Sharper pattern recall.',
			description: 'Lets the character notice faint clues.',
			prerequisitesText: 'level:4\nability:intelligence:13'
		});

		expect(result).toEqual({
			slug: 'observant-echo',
			name: 'Observant Echo',
			summary: 'Sharper pattern recall.',
			description: 'Lets the character notice faint clues.',
			prerequisites: ['level:4', 'ability:intelligence:13']
		});
	});

	it('reports invalid feat prerequisites against the textarea field', () => {
		const result = privateFeatFormSchema.safeParse({
			name: 'Bad Feat',
			summary: '',
			description: '',
			prerequisitesText: 'medium-armor proficiency'
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(flattenPrivateFeatFormErrors(result.error).prerequisitesText?.[0]).toContain(
			'Use prerequisite format'
		);
	});
});
