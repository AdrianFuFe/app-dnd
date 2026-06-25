import { describe, expect, it, vi } from 'vitest';
import { listCharacterCreationCatalog, resolveCharacterCreationCatalogSelections } from './catalog';

describe('listCharacterCreationCatalog', () => {
	it('loads structured catalog options for character creation', async () => {
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

		const subspeciesOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'subspecies-1',
					slug: 'high-elf',
					species_slug: 'elfo',
					name: 'High Elf',
					summary: 'Arcane focused.'
				}
			],
			error: null
		});
		const subspeciesSelect = vi.fn().mockReturnValue({ order: subspeciesOrder });

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

		const subclassOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'subclass-1',
					slug: 'life-domain',
					class_slug: 'clerigo',
					name: 'Life Domain',
					summary: 'Healing focused.'
				}
			],
			error: null
		});
		const subclassSelect = vi.fn().mockReturnValue({ order: subclassOrder });

		const backgroundOrder = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'background-1',
					slug: 'sage',
					name: 'Sage',
					summary: 'Academic researcher.'
				}
			],
			error: null
		});
		const backgroundSelect = vi.fn().mockReturnValue({ order: backgroundOrder });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'subspecies') {
				return { select: subspeciesSelect };
			}

			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'subclasses') {
				return { select: subclassSelect };
			}

			if (table === 'backgrounds') {
				return { select: backgroundSelect };
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
			subspeciesOptions: [
				{
					id: 'subspecies-1',
					slug: 'high-elf',
					speciesSlug: 'elfo',
					name: 'High Elf',
					summary: 'Arcane focused.'
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
			],
			subclassOptions: [
				{
					id: 'subclass-1',
					slug: 'life-domain',
					classSlug: 'clerigo',
					name: 'Life Domain',
					summary: 'Healing focused.'
				}
			],
			backgroundOptions: [
				{
					id: 'background-1',
					slug: 'sage',
					name: 'Sage',
					summary: 'Academic researcher.'
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
				slug: 'elfo',
				name: 'Elfo'
			},
			error: null
		});
		const speciesEq = vi.fn().mockReturnValue({ single: speciesSingle });
		const speciesSelect = vi.fn().mockReturnValue({ eq: speciesEq });

		const subspeciesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'subspecies-1',
				species_slug: 'elfo',
				name: 'High Elf'
			},
			error: null
		});
		const subspeciesEq = vi.fn().mockReturnValue({ single: subspeciesSingle });
		const subspeciesSelect = vi.fn().mockReturnValue({ eq: subspeciesEq });

		const classesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'class-1',
				slug: 'clerigo',
				name: 'Clerigo'
			},
			error: null
		});
		const classesEq = vi.fn().mockReturnValue({ single: classesSingle });
		const classesSelect = vi.fn().mockReturnValue({ eq: classesEq });

		const subclassSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'subclass-1',
				class_slug: 'clerigo',
				name: 'Life Domain'
			},
			error: null
		});
		const subclassEq = vi.fn().mockReturnValue({ single: subclassSingle });
		const subclassSelect = vi.fn().mockReturnValue({ eq: subclassEq });

		const backgroundSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'background-1',
				name: 'Sage'
			},
			error: null
		});
		const backgroundEq = vi.fn().mockReturnValue({ single: backgroundSingle });
		const backgroundSelect = vi.fn().mockReturnValue({ eq: backgroundEq });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'subspecies') {
				return { select: subspeciesSelect };
			}

			if (table === 'character_classes') {
				return { select: classesSelect };
			}

			if (table === 'subclasses') {
				return { select: subclassSelect };
			}

			if (table === 'backgrounds') {
				return { select: backgroundSelect };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const selection = await resolveCharacterCreationCatalogSelections({ from } as never, {
			speciesId: 'species-1',
			subspeciesId: 'subspecies-1',
			classId: 'class-1',
			subclassId: 'subclass-1',
			backgroundId: 'background-1'
		});

		expect(selection).toEqual({
			speciesId: 'species-1',
			race: 'Elfo',
			subspeciesId: 'subspecies-1',
			subrace: 'High Elf',
			classId: 'class-1',
			className: 'Clerigo',
			subclassId: 'subclass-1',
			subclass: 'Life Domain',
			backgroundId: 'background-1',
			background: 'Sage'
		});
	});

	it('rejects a subspecies that does not match the selected species', async () => {
		const speciesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'species-1',
				slug: 'elfo',
				name: 'Elfo'
			},
			error: null
		});
		const speciesEq = vi.fn().mockReturnValue({ single: speciesSingle });
		const speciesSelect = vi.fn().mockReturnValue({ eq: speciesEq });

		const subspeciesSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'subspecies-1',
				species_slug: 'humano',
				name: 'High Elf'
			},
			error: null
		});
		const subspeciesEq = vi.fn().mockReturnValue({ single: subspeciesSingle });
		const subspeciesSelect = vi.fn().mockReturnValue({ eq: subspeciesEq });

		const from = vi.fn((table: string) => {
			if (table === 'species') {
				return { select: speciesSelect };
			}

			if (table === 'subspecies') {
				return { select: subspeciesSelect };
			}

			if (
				table === 'character_classes' ||
				table === 'subclasses' ||
				table === 'backgrounds'
			) {
				return { select: vi.fn() };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		await expect(
			resolveCharacterCreationCatalogSelections({ from } as never, {
				speciesId: 'species-1',
				subspeciesId: 'subspecies-1'
			})
		).rejects.toThrow('Please choose a valid subspecies for the selected species.');
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

			if (
				table === 'subspecies' ||
				table === 'character_classes' ||
				table === 'subclasses' ||
				table === 'backgrounds'
			) {
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
