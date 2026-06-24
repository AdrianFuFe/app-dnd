import { describe, expect, it, vi } from 'vitest';
import { createCharacter, listCharactersForUser } from './characters';

describe('listCharactersForUser', () => {
	it('maps character rows into list items', async () => {
		const order = vi.fn().mockResolvedValue({
			data: [
				{
					id: 'char-1',
					name: 'Talia Stormstep',
					level: 3,
					race: 'Elf',
					class_name: 'Wizard',
					updated_at: '2026-06-24T10:00:00.000Z'
				}
			],
			error: null
		});

		const eq = vi.fn().mockReturnValue({ order });
		const select = vi.fn().mockReturnValue({ eq });
		const from = vi.fn().mockReturnValue({ select });

		const characters = await listCharactersForUser({ from } as never, 'user-1');

		expect(from).toHaveBeenCalledWith('characters');
		expect(select).toHaveBeenCalledWith('id, name, level, race, class_name, updated_at');
		expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
		expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
		expect(characters).toEqual([
			{
				id: 'char-1',
				name: 'Talia Stormstep',
				level: 3,
				race: 'Elf',
				className: 'Wizard',
				updatedAt: '2026-06-24T10:00:00.000Z'
			}
		]);
	});
});

describe('createCharacter', () => {
	it('writes the character row and the three MVP child slices', async () => {
		const charactersSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Talia Stormstep'
			},
			error: null
		});
		const charactersSelect = vi.fn().mockReturnValue({ single: charactersSingle });
		const charactersInsert = vi.fn().mockReturnValue({ select: charactersSelect });

		const statsInsert = vi.fn().mockResolvedValue({ error: null });
		const combatInsert = vi.fn().mockResolvedValue({ error: null });
		const textInsert = vi.fn().mockResolvedValue({ error: null });

		const from = vi.fn((table: string) => {
			if (table === 'characters') {
				return {
					insert: charactersInsert
				};
			}

			if (table === 'character_stats') {
				return {
					insert: statsInsert
				};
			}

			if (table === 'character_combat_stats') {
				return {
					insert: combatInsert
				};
			}

			if (table === 'character_text_sections') {
				return {
					insert: textInsert
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const result = await createCharacter({ from } as never, 'user-1', {
			name: 'Talia Stormstep',
			race: 'Elf',
			className: 'Wizard',
			level: 3,
			story: 'Archivist turned explorer.',
			strength: 8,
			dexterity: 14,
			constitution: 13,
			intelligence: 16,
			wisdom: 12,
			charisma: 10,
			maxHp: 20,
			currentHp: 18,
			temporaryHp: 0,
			armorClass: 13,
			initiative: 2,
			speed: 30,
			hitDice: '3d6',
			spells: 'Magic Missile'
		});

		expect(result).toEqual({
			id: 'char-1',
			name: 'Talia Stormstep'
		});
		expect(charactersInsert).toHaveBeenCalledWith(
			expect.objectContaining({
				user_id: 'user-1',
				name: 'Talia Stormstep',
				race: 'Elf',
				class_name: 'Wizard',
				level: 3,
				story: 'Archivist turned explorer.'
			})
		);
		expect(statsInsert).toHaveBeenCalledWith(
			expect.objectContaining({
				character_id: 'char-1',
				intelligence: 16
			})
		);
		expect(combatInsert).toHaveBeenCalledWith(
			expect.objectContaining({
				character_id: 'char-1',
				max_hp: 20,
				hit_dice: '3d6'
			})
		);
		expect(textInsert).toHaveBeenCalledWith(
			expect.objectContaining({
				character_id: 'char-1',
				spells: 'Magic Missile'
			})
		);
	});

	it('attempts to roll back the parent character if a child insert fails', async () => {
		const deleteEqUserId = vi.fn().mockResolvedValue({ error: null });
		const deleteEqId = vi.fn().mockReturnValue({ eq: deleteEqUserId });
		const deleteCharacter = vi.fn().mockReturnValue({ eq: deleteEqId });

		const charactersSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Broken Draft'
			},
			error: null
		});
		const charactersSelect = vi.fn().mockReturnValue({ single: charactersSingle });
		const charactersInsert = vi.fn().mockReturnValue({ select: charactersSelect });

		const from = vi.fn((table: string) => {
			if (table === 'characters') {
				return {
					insert: charactersInsert,
					delete: deleteCharacter
				};
			}

			if (table === 'character_stats') {
				return {
					insert: vi.fn().mockResolvedValue({ error: new Error('stats failed') })
				};
			}

			if (table === 'character_combat_stats' || table === 'character_text_sections') {
				return {
					insert: vi.fn().mockResolvedValue({ error: null })
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		await expect(
			createCharacter({ from } as never, 'user-1', {
				name: 'Broken Draft',
				level: 1,
				strength: 10,
				dexterity: 10,
				constitution: 10,
				intelligence: 10,
				wisdom: 10,
				charisma: 10,
				maxHp: 1,
				currentHp: 1,
				temporaryHp: 0,
				armorClass: 10,
				initiative: 0,
				speed: 30
			})
		).rejects.toThrow('Failed to create character details for user user-1');

		expect(deleteCharacter).toHaveBeenCalled();
		expect(deleteEqId).toHaveBeenCalledWith('id', 'char-1');
		expect(deleteEqUserId).toHaveBeenCalledWith('user_id', 'user-1');
	});
});
