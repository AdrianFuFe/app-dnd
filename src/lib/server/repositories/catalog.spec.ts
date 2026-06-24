import { describe, expect, it, vi } from 'vitest';
import {
	listCharacterCreationCatalog,
	resolveCharacterCreationCatalogSelections
} from './catalog';

describe('listCharacterCreationCatalog', () => {
	it('loads species and class options for character creation', async () => {
		const speciesOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'species-1',
					slug: 'elfo',
					name: 'Elfo',
					summary: 'Agile and perceptive.',
					base_speed: 30
				}
			],
			error: null
		});
		const speciesSelect = vi.fn().mockReturnValue({ order: speciesOrder });

		const classesOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'class-1',
					slug: 'clerigo',
					name: 'Clerigo',
					summary: 'Divine support caster.',
					hit_die: 8
				}
			],
			error: null
		});
		const classesSelect = vi.fn().mockReturnValue({ order: classesOrder });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const catalog = await listCharacterCreationCatalog({ from } as never);

		expect(catalog).toEqual({
			speciesOptions: [
				{
					id: 'species-1',
					slug: 'elfo',
					name: 'Elfo',
					summary: 'Agile and perceptive.',
					baseSpeed: 30
				}
			],
			classOptions: [
				{
					id: 'class-1',
					slug: 'clerigo',
					name: 'Clerigo',
					summary: 'Divine support caster.',
					hitDie: 8
				}
			]
		});
	});
});

describe('resolveCharacterCreationCatalogSelections', () => {
	it('maps selected IDs back to trusted stored fields', async () => {
		const speciesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'species-1',
				name: 'Elfo'
			},
			error: null
		});
		const speciesEq = vi.fn().mockReturnValue({ single: speciesSingle });
		const speciesSelect = vi.fn().mockReturnValue({ eq: speciesEq });

		const classesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'class-1',
				name: 'Clerigo'
			},
			error: null
		});
		const classesEq = vi.fn().mockReturnValue({ single: classesSingle });
		const classesSelect = vi.fn().mockReturnValue({ eq: classesEq });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const selection = await resolveCharacterCreationCatalogSelections({ from } as never, {
			speciesId: 'species-1',
			classId: 'class-1'
		});

		expect(selection).toEqual({
			speciesId: 'species-1',
			race: 'Elfo',
			classId: 'class-1',
			className: 'Clerigo'
		});
	});

	it('rejects unknown selected IDs', async () => {
		const speciesSingle = vi.fn().mockResolvedValue({
			data: null,
			error: new Error('missing')
		});
		const speciesEq = vi.fn().mockReturnValue({ single: speciesSingle });
		const speciesSelect = vi.fn().mockReturnValue({ eq: speciesEq });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'character_classes') {
				return { select: vi.fn() };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		await expect(
			resolveCharacterCreationCatalogSelections({ from } as never, {
				speciesId: 'missing-species'
			})
		).rejects.toThrow('Please choose a valid species from the catalog.');
	});
});
