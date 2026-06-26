import { describe, expect, it, vi } from 'vitest';
import {
	createCharacter,
	deleteCharacter,
	getCharacterForUser,
	listCharactersForUser,
	updateCharacter
} from './characters';

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
	it('writes the structured child slices and structured inventory items', async () => {
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
		const attacksInsert = vi.fn().mockResolvedValue({ error: null });
		const inventoryInsert = vi.fn().mockResolvedValue({ error: null });

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

			if (table === 'character_attacks') {
				return {
					insert: attacksInsert
				};
			}

			if (table === 'character_inventory_items') {
				return {
					insert: inventoryInsert
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
			attackItems: [
				{
					name: 'Quarterstaff',
					attackBonus: '+4',
					damage: '1d6',
					damageType: 'bludgeoning',
					range: 'Melee'
				}
			],
			inventoryItems: [
				{
					name: 'Spellbook',
					quantity: 1,
					isEquipped: false
				}
			],
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
				attacks: 'Quarterstaff | +4 | 1d6 bludgeoning | Melee',
				inventory: 'Spellbook',
				spells: 'Magic Missile'
			})
		);
		expect(attacksInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				name: 'Quarterstaff',
				attack_bonus: '+4'
			})
		]);
		expect(inventoryInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				name: 'Spellbook',
				quantity: 1
			})
		]);
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

			if (
				table === 'character_combat_stats' ||
				table === 'character_text_sections' ||
				table === 'character_attacks' ||
				table === 'character_inventory_items'
			) {
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
				speed: 30,
				attackItems: [],
				inventoryItems: []
			})
		).rejects.toThrow('Failed to create character details for user user-1');

		expect(deleteCharacter).toHaveBeenCalled();
		expect(deleteEqId).toHaveBeenCalledWith('id', 'char-1');
		expect(deleteEqUserId).toHaveBeenCalledWith('user_id', 'user-1');
	});
});

describe('getCharacterForUser', () => {
	it('returns the merged parent and child slices for an owned character', async () => {
		const characterMaybeSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Talia Stormstep',
				species_id: 'species-1',
				subspecies_id: null,
				class_id: 'class-1',
				subclass_id: null,
				background_id: null,
				race: 'Elf',
				subrace: null,
				class_name: 'Wizard',
				subclass: 'Evocation',
				level: 3,
				background: 'Sage',
				story: 'Archivist turned explorer.',
				updated_at: '2026-06-24T10:00:00.000Z'
			},
			error: null
		});
		const characterEqUser = vi.fn().mockReturnValue({ maybeSingle: characterMaybeSingle });
		const characterEqId = vi.fn().mockReturnValue({ eq: characterEqUser });
		const characterSelect = vi.fn().mockReturnValue({ eq: characterEqId });

		const statsMaybeSingle = vi.fn().mockResolvedValue({
			data: {
				strength: 8,
				dexterity: 14,
				constitution: 13,
				intelligence: 16,
				wisdom: 12,
				charisma: 10
			},
			error: null
		});
		const statsEq = vi.fn().mockReturnValue({ maybeSingle: statsMaybeSingle });
		const statsSelect = vi.fn().mockReturnValue({ eq: statsEq });

		const combatMaybeSingle = vi.fn().mockResolvedValue({
			data: {
				max_hp: 20,
				current_hp: 18,
				temporary_hp: 0,
				armor_class: 13,
				initiative: 2,
				speed: 30,
				hit_dice: '3d6'
			},
			error: null
		});
		const combatEq = vi.fn().mockReturnValue({ maybeSingle: combatMaybeSingle });
		const combatSelect = vi.fn().mockReturnValue({ eq: combatEq });

		const textMaybeSingle = vi.fn().mockResolvedValue({
			data: {
				attacks: 'Quarterstaff',
				spells: 'Magic Missile',
				inventory: 'Spellbook',
				notes: 'Tracks ley lines.'
			},
			error: null
		});
		const textEq = vi.fn().mockReturnValue({ maybeSingle: textMaybeSingle });
		const textSelect = vi.fn().mockReturnValue({ eq: textEq });

		const attacksEq = vi.fn().mockResolvedValue({
			data: [
				{
					name: 'Quarterstaff',
					attack_bonus: '+4',
					damage: '1d6',
					damage_type: 'bludgeoning',
					range: 'Melee',
					description: null
				}
			],
			error: null
		});
		const attacksSelect = vi.fn().mockReturnValue({ eq: attacksEq });

		const inventoryEq = vi.fn().mockResolvedValue({
			data: [
				{
					name: 'Spellbook',
					quantity: 1,
					description: null,
					weight: null,
					value: null,
					is_equipped: false
				}
			],
			error: null
		});
		const inventorySelect = vi.fn().mockReturnValue({ eq: inventoryEq });

		const from = vi.fn((table: string) => {
			if (table === 'characters') {
				return {
					select: characterSelect
				};
			}

			if (table === 'character_stats') {
				return {
					select: statsSelect
				};
			}

			if (table === 'character_combat_stats') {
				return {
					select: combatSelect
				};
			}

			if (table === 'character_text_sections') {
				return {
					select: textSelect
				};
			}

			if (table === 'character_attacks') {
				return {
					select: attacksSelect
				};
			}

			if (table === 'character_inventory_items') {
				return {
					select: inventorySelect
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const character = await getCharacterForUser({ from } as never, 'user-1', 'char-1');

		expect(character).toEqual({
			id: 'char-1',
			name: 'Talia Stormstep',
			speciesId: 'species-1',
			classId: 'class-1',
			race: 'Elf',
			className: 'Wizard',
			subclass: 'Evocation',
			level: 3,
			background: 'Sage',
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
			attackItems: [
				{
					name: 'Quarterstaff',
					attackBonus: '+4',
					damage: '1d6',
					damageType: 'bludgeoning',
					range: 'Melee'
				}
			],
			inventoryItems: [
				{
					name: 'Spellbook',
					quantity: 1,
					isEquipped: false
				}
			],
			attacks: 'Quarterstaff',
			spells: 'Magic Missile',
			notes: 'Tracks ley lines.',
			updatedAt: '2026-06-24T10:00:00.000Z'
		});
		expect(characterEqId).toHaveBeenCalledWith('id', 'char-1');
		expect(characterEqUser).toHaveBeenCalledWith('user_id', 'user-1');
	});

	it('falls back to legacy text inventory when no child rows exist yet', async () => {
		const characterMaybeSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Legacy Pack',
				species_id: null,
				subspecies_id: null,
				class_id: null,
				subclass_id: null,
				background_id: null,
				race: null,
				subrace: null,
				class_name: null,
				subclass: null,
				level: 1,
				background: null,
				story: null,
				updated_at: '2026-06-24T10:00:00.000Z'
			},
			error: null
		});
		const characterEqUser = vi.fn().mockReturnValue({ maybeSingle: characterMaybeSingle });
		const characterEqId = vi.fn().mockReturnValue({ eq: characterEqUser });
		const characterSelect = vi.fn().mockReturnValue({ eq: characterEqId });

		const statsEq = vi.fn().mockReturnValue({
			maybeSingle: vi.fn().mockResolvedValue({
				data: {
					strength: 10,
					dexterity: 10,
					constitution: 10,
					intelligence: 10,
					wisdom: 10,
					charisma: 10
				},
				error: null
			})
		});
		const combatEq = vi.fn().mockReturnValue({
			maybeSingle: vi.fn().mockResolvedValue({
				data: {
					max_hp: 1,
					current_hp: 1,
					temporary_hp: 0,
					armor_class: 10,
					initiative: 0,
					speed: 30,
					hit_dice: null
				},
				error: null
			})
		});
		const textEq = vi.fn().mockReturnValue({
			maybeSingle: vi.fn().mockResolvedValue({
				data: {
					attacks: null,
					spells: null,
					inventory: 'Rope, Torch',
					notes: null
				},
				error: null
			})
		});
		const inventoryEq = vi.fn().mockResolvedValue({
			data: [],
			error: null
		});
		const attacksEq = vi.fn().mockResolvedValue({
			data: [],
			error: null
		});

		const from = vi.fn((table: string) => {
			if (table === 'characters') {
				return { select: characterSelect };
			}

			if (table === 'character_stats') {
				return { select: vi.fn().mockReturnValue({ eq: statsEq }) };
			}

			if (table === 'character_combat_stats') {
				return { select: vi.fn().mockReturnValue({ eq: combatEq }) };
			}

			if (table === 'character_text_sections') {
				return { select: vi.fn().mockReturnValue({ eq: textEq }) };
			}

			if (table === 'character_attacks') {
				return { select: vi.fn().mockReturnValue({ eq: attacksEq }) };
			}

			if (table === 'character_inventory_items') {
				return { select: vi.fn().mockReturnValue({ eq: inventoryEq }) };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const character = await getCharacterForUser({ from } as never, 'user-1', 'char-1');

		expect(character?.attackItems).toEqual([]);
		expect(character?.inventoryItems).toEqual([
			{ name: 'Rope', quantity: 1, isEquipped: false },
			{ name: 'Torch', quantity: 1, isEquipped: false }
		]);
	});

	it('keeps a legacy comma-based attack note as one structured row', async () => {
		const characterMaybeSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Legacy Blade',
				species_id: null,
				subspecies_id: null,
				class_id: null,
				subclass_id: null,
				background_id: null,
				race: null,
				subrace: null,
				class_name: null,
				subclass: null,
				level: 1,
				background: null,
				story: null,
				updated_at: '2026-06-24T10:00:00.000Z'
			},
			error: null
		});
		const characterEqUser = vi.fn().mockReturnValue({ maybeSingle: characterMaybeSingle });
		const characterEqId = vi.fn().mockReturnValue({ eq: characterEqUser });
		const characterSelect = vi.fn().mockReturnValue({ eq: characterEqId });

		const from = vi.fn((table: string) => {
			if (table === 'characters') {
				return { select: characterSelect };
			}

			if (table === 'character_stats') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: {
									strength: 10,
									dexterity: 10,
									constitution: 10,
									intelligence: 10,
									wisdom: 10,
									charisma: 10
								},
								error: null
							})
						})
					})
				};
			}

			if (table === 'character_combat_stats') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: {
									max_hp: 1,
									current_hp: 1,
									temporary_hp: 0,
									armor_class: 10,
									initiative: 0,
									speed: 30,
									hit_dice: null
								},
								error: null
							})
						})
					})
				};
			}

			if (table === 'character_text_sections') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: {
									attacks: 'Quarterstaff +4 to hit, 1d6 bludgeoning',
									spells: null,
									inventory: null,
									notes: null
								},
								error: null
							})
						})
					})
				};
			}

			if (table === 'character_attacks') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					})
				};
			}

			if (table === 'character_inventory_items') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					})
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const character = await getCharacterForUser({ from } as never, 'user-1', 'char-1');

		expect(character?.attackItems).toEqual([
			{ name: 'Quarterstaff +4 to hit, 1d6 bludgeoning' }
		]);
	});

	it('returns null when the owned character does not exist', async () => {
		const maybeSingle = vi.fn().mockResolvedValue({
			data: null,
			error: null
		});
		const eqUser = vi.fn().mockReturnValue({ maybeSingle });
		const eqId = vi.fn().mockReturnValue({ eq: eqUser });
		const select = vi.fn().mockReturnValue({ eq: eqId });
		const from = vi.fn().mockReturnValue({ select });

		const character = await getCharacterForUser({ from } as never, 'user-1', 'missing');

		expect(character).toBeNull();
	});
});

describe('updateCharacter', () => {
	it('updates the parent row, structured child slices, and structured inventory items', async () => {
		const charactersMaybeSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Talia Stormstep'
			},
			error: null
		});
		const charactersSelect = vi.fn().mockReturnValue({ maybeSingle: charactersMaybeSingle });
		const charactersEqUser = vi.fn().mockReturnValue({ select: charactersSelect });
		const charactersEqId = vi.fn().mockReturnValue({ eq: charactersEqUser });
		const charactersUpdate = vi.fn().mockReturnValue({ eq: charactersEqId });

		const statsEq = vi.fn().mockResolvedValue({ error: null });
		const statsUpdate = vi.fn().mockReturnValue({ eq: statsEq });
		const combatEq = vi.fn().mockResolvedValue({ error: null });
		const combatUpdate = vi.fn().mockReturnValue({ eq: combatEq });
		const textEq = vi.fn().mockResolvedValue({ error: null });
		const textUpdate = vi.fn().mockReturnValue({ eq: textEq });
		const attacksSelectEq = vi.fn().mockResolvedValue({
			data: [
				{
					name: 'Quarterstaff',
					attack_bonus: '+4',
					damage: '1d6',
					damage_type: 'bludgeoning',
					range: 'Melee',
					description: null
				}
			],
			error: null
		});
		const attacksSelect = vi.fn().mockReturnValue({ eq: attacksSelectEq });
		const attacksDeleteEq = vi.fn().mockResolvedValue({ error: null });
		const attacksDelete = vi.fn().mockReturnValue({ eq: attacksDeleteEq });
		const attacksInsert = vi.fn().mockResolvedValue({ error: null });
		const inventoryDeleteEq = vi.fn().mockResolvedValue({ error: null });
		const inventoryDelete = vi.fn().mockReturnValue({ eq: inventoryDeleteEq });
		const inventoryInsert = vi.fn().mockResolvedValue({ error: null });

		const from = vi.fn((table: string) => {
			if (table === 'characters') {
				return {
					update: charactersUpdate
				};
			}

			if (table === 'character_stats') {
				return {
					update: statsUpdate
				};
			}

			if (table === 'character_combat_stats') {
				return {
					update: combatUpdate
				};
			}

			if (table === 'character_text_sections') {
				return {
					update: textUpdate
				};
			}

			if (table === 'character_attacks') {
				return {
					select: attacksSelect,
					delete: attacksDelete,
					insert: attacksInsert
				};
			}

			if (table === 'character_inventory_items') {
				return {
					delete: inventoryDelete,
					insert: inventoryInsert
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const result = await updateCharacter({ from } as never, 'user-1', 'char-1', {
			name: 'Talia Stormstep',
			race: 'Elf',
			className: 'Wizard',
			level: 4,
			story: 'Now leading the expedition.',
			strength: 8,
			dexterity: 14,
			constitution: 13,
			intelligence: 17,
			wisdom: 12,
			charisma: 10,
			maxHp: 24,
			currentHp: 20,
			temporaryHp: 3,
			armorClass: 14,
			initiative: 2,
			speed: 30,
			hitDice: '4d6',
			attackItems: [
				{
					name: 'Radiant Mace',
					attackBonus: '+5',
					damage: '1d6 + 3',
					damageType: 'radiant',
					range: 'Melee'
				}
			],
			inventoryItems: [
				{
					name: 'Lantern',
					quantity: 1,
					isEquipped: true
				}
			],
			spells: 'Magic Missile'
		});

		expect(result).toEqual({
			id: 'char-1',
			name: 'Talia Stormstep'
		});
		expect(charactersUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'Talia Stormstep',
				level: 4,
				story: 'Now leading the expedition.'
			})
		);
		expect(charactersEqId).toHaveBeenCalledWith('id', 'char-1');
		expect(charactersEqUser).toHaveBeenCalledWith('user_id', 'user-1');
		expect(statsUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				intelligence: 17
			})
		);
		expect(combatUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				max_hp: 24,
				temporary_hp: 3
			})
		);
		expect(textUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				attacks: 'Radiant Mace | +5 | 1d6 + 3 radiant | Melee',
				inventory: 'Lantern (equipped)',
				spells: 'Magic Missile'
			})
		);
		expect(attacksDeleteEq).toHaveBeenCalledWith('character_id', 'char-1');
		expect(attacksInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				name: 'Radiant Mace',
				damage_type: 'radiant'
			})
		]);
		expect(inventoryDeleteEq).toHaveBeenCalledWith('character_id', 'char-1');
		expect(inventoryInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				name: 'Lantern',
				is_equipped: true
			})
		]);
	});

	it('throws when the character is not owned by the user', async () => {
		const maybeSingle = vi.fn().mockResolvedValue({
			data: null,
			error: null
		});
		const select = vi.fn().mockReturnValue({ maybeSingle });
		const eqUser = vi.fn().mockReturnValue({ select });
		const eqId = vi.fn().mockReturnValue({ eq: eqUser });
		const update = vi.fn().mockReturnValue({ eq: eqId });
		const from = vi.fn().mockReturnValue({ update });

		await expect(
			updateCharacter({ from } as never, 'user-1', 'missing', {
				name: 'Missing Draft',
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
				speed: 30,
				attackItems: [],
				inventoryItems: []
			})
		).rejects.toThrow('Character missing was not found for user user-1');
	});

	it('restores existing structured attacks when replacement insert fails', async () => {
		const charactersMaybeSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Talia Stormstep'
			},
			error: null
		});
		const charactersSelect = vi.fn().mockReturnValue({ maybeSingle: charactersMaybeSingle });
		const charactersEqUser = vi.fn().mockReturnValue({ select: charactersSelect });
		const charactersEqId = vi.fn().mockReturnValue({ eq: charactersEqUser });
		const charactersUpdate = vi.fn().mockReturnValue({ eq: charactersEqId });

		const existingAttackRows = [
			{
				name: 'Quarterstaff',
				attack_bonus: '+4',
				damage: '1d6',
				damage_type: 'bludgeoning',
				range: 'Melee',
				description: null
			}
		];

		const attacksSelectEq = vi.fn().mockResolvedValue({
			data: existingAttackRows,
			error: null
		});
		const attacksSelect = vi.fn().mockReturnValue({ eq: attacksSelectEq });
		const attacksDeleteEq = vi.fn().mockResolvedValue({ error: null });
		const attacksDelete = vi.fn().mockReturnValue({ eq: attacksDeleteEq });
		const attacksInsert = vi
			.fn()
			.mockResolvedValueOnce({ error: new Error('insert failed') })
			.mockResolvedValueOnce({ error: null });

		const from = vi.fn((table: string) => {
			if (table === 'characters') {
				return {
					update: charactersUpdate
				};
			}

			if (table === 'character_stats') {
				return {
					update: vi
						.fn()
						.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
				};
			}

			if (table === 'character_combat_stats') {
				return {
					update: vi
						.fn()
						.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
				};
			}

			if (table === 'character_text_sections') {
				return {
					update: vi
						.fn()
						.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
				};
			}

			if (table === 'character_attacks') {
				return {
					select: attacksSelect,
					delete: attacksDelete,
					insert: attacksInsert
				};
			}

			if (table === 'character_inventory_items') {
				return {
					delete: vi
						.fn()
						.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
					insert: vi.fn().mockResolvedValue({ error: null })
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		await expect(
			updateCharacter({ from } as never, 'user-1', 'char-1', {
				name: 'Talia Stormstep',
				race: 'Elf',
				className: 'Wizard',
				level: 4,
				story: 'Now leading the expedition.',
				strength: 8,
				dexterity: 14,
				constitution: 13,
				intelligence: 17,
				wisdom: 12,
				charisma: 10,
				maxHp: 24,
				currentHp: 20,
				temporaryHp: 3,
				armorClass: 14,
				initiative: 2,
				speed: 30,
				hitDice: '4d6',
				attackItems: [
					{
						name: 'Radiant Mace',
						attackBonus: '+5',
						damage: '1d6 + 3',
						damageType: 'radiant',
						range: 'Melee'
					}
				],
				inventoryItems: [],
				spells: 'Magic Missile'
			})
		).rejects.toThrow('Failed to update character details for user user-1');

		expect(attacksSelectEq).toHaveBeenCalledWith('character_id', 'char-1');
		expect(attacksDeleteEq).toHaveBeenCalledWith('character_id', 'char-1');
		expect(attacksInsert).toHaveBeenNthCalledWith(
			2,
			expect.arrayContaining([
				expect.objectContaining({
					character_id: 'char-1',
					name: 'Quarterstaff',
					attack_bonus: '+4'
				})
			])
		);
	});
});

describe('deleteCharacter', () => {
	it('deletes an owned character and returns the deleted identity', async () => {
		const maybeSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Talia Stormstep'
			},
			error: null
		});
		const select = vi.fn().mockReturnValue({ maybeSingle });
		const eqUser = vi.fn().mockReturnValue({ select });
		const eqId = vi.fn().mockReturnValue({ eq: eqUser });
		const deleteRow = vi.fn().mockReturnValue({ eq: eqId });
		const from = vi.fn().mockReturnValue({ delete: deleteRow });

		const result = await deleteCharacter({ from } as never, 'user-1', 'char-1');

		expect(result).toEqual({
			id: 'char-1',
			name: 'Talia Stormstep'
		});
		expect(from).toHaveBeenCalledWith('characters');
		expect(deleteRow).toHaveBeenCalled();
		expect(eqId).toHaveBeenCalledWith('id', 'char-1');
		expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1');
		expect(select).toHaveBeenCalledWith('id, name');
	});

	it('throws when the character is not owned by the user', async () => {
		const maybeSingle = vi.fn().mockResolvedValue({
			data: null,
			error: null
		});
		const select = vi.fn().mockReturnValue({ maybeSingle });
		const eqUser = vi.fn().mockReturnValue({ select });
		const eqId = vi.fn().mockReturnValue({ eq: eqUser });
		const deleteRow = vi.fn().mockReturnValue({ eq: eqId });
		const from = vi.fn().mockReturnValue({ delete: deleteRow });

		await expect(deleteCharacter({ from } as never, 'user-1', 'missing')).rejects.toThrow(
			'Character missing was not found for user user-1'
		);
	});
});
