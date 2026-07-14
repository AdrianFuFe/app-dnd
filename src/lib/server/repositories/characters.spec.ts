import { describe, expect, it, vi } from 'vitest';
import {
	createCharacter,
	deleteCharacter,
	getCharacterForUser,
	listCharactersForUser,
	updateCharacter
} from './characters';

const MAGIC_MISSILE_SPELL_ID = '99999999-9999-4999-8999-999999999999';
const GUIDING_BOLT_SPELL_ID = '12121212-1212-4121-8121-121212121212';
const ALERT_FEAT_ID = '13131313-1313-4131-8131-131313131313';

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
		const spellsInsert = vi.fn().mockResolvedValue({ error: null });
		const featsInsert = vi.fn().mockResolvedValue({ error: null });
		const inventoryInsert = vi.fn().mockResolvedValue({ error: null });
		const notesInsert = vi.fn().mockResolvedValue({ error: null });

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

			if (table === 'character_spells') {
				return {
					insert: spellsInsert
				};
			}

			if (table === 'character_feats') {
				return {
					insert: featsInsert
				};
			}

			if (table === 'character_inventory_items') {
				return {
					insert: inventoryInsert
				};
			}

			if (table === 'character_notes') {
				return {
					insert: notesInsert
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const result = await createCharacter({ from } as never, 'user-1', {
			name: 'Talia Stormstep',
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'canon',
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
					equipmentId: undefined,
					name: 'Quarterstaff',
					attackBonus: '+4',
					damage: '1d6',
					damageType: 'bludgeoning',
					range: 'Melee'
				}
			],
			spellItems: [
				{
					spellId: MAGIC_MISSILE_SPELL_ID,
					name: 'Magic Missile',
					level: 1,
					school: 'Evocation',
					isPrepared: true
				}
			],
			featItems: [
				{
					featId: ALERT_FEAT_ID,
					name: 'Alert',
					description: 'Always ready to act.'
				}
			],
			inventoryItems: [
				{
					equipmentId: undefined,
					name: 'Spellbook',
					quantity: 1,
					isEquipped: false
				}
			],
			noteItems: [
				{
					title: 'Goals',
					content: 'Protect the archive.'
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
				spells: 'Magic Missile | Level 1 | Evocation | Prepared',
				notes: 'Goals\nProtect the archive.'
			})
		);
		expect(attacksInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				name: 'Quarterstaff',
				attack_bonus: '+4'
			})
		]);
		expect(spellsInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				spell_id: MAGIC_MISSILE_SPELL_ID,
				name: 'Magic Missile',
				level: 1,
				school: 'Evocation',
				is_prepared: true
			})
		]);
		expect(featsInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				feat_id: ALERT_FEAT_ID,
				name: 'Alert',
				description: 'Always ready to act.'
			})
		]);
		expect(inventoryInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				name: 'Spellbook',
				quantity: 1
			})
		]);
		expect(notesInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				title: 'Goals',
				content: 'Protect the archive.'
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
				table === 'character_spells' ||
				table === 'character_inventory_items' ||
				table === 'character_notes'
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
				rulesetCode: 'dnd-2014-srd',
				contentMode: 'canon',
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
				spellItems: [],
				featItems: [],
				inventoryItems: [],
				noteItems: []
			})
		).rejects.toThrow('Failed to create character details for user user-1');

		expect(deleteCharacter).toHaveBeenCalled();
		expect(deleteEqId).toHaveBeenCalledWith('id', 'char-1');
		expect(deleteEqUserId).toHaveBeenCalledWith('user_id', 'user-1');
	});

	it('persists custom profile metadata in the dedicated content-profile table', async () => {
		const charactersSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Custom Draft'
			},
			error: null
		});
		const charactersSelect = vi.fn().mockReturnValue({ single: charactersSingle });
		const charactersInsert = vi.fn().mockReturnValue({ select: charactersSelect });
		const notesInsert = vi.fn().mockResolvedValue({ error: null });
		const contentProfilesInsert = vi.fn().mockResolvedValue({ error: null });

		const from = vi.fn((table: string) => {
			if (table === 'characters') {
				return { insert: charactersInsert };
			}

			if (table === 'character_stats') {
				return { insert: vi.fn().mockResolvedValue({ error: null }) };
			}

			if (table === 'character_combat_stats') {
				return { insert: vi.fn().mockResolvedValue({ error: null }) };
			}

			if (table === 'character_text_sections') {
				return { insert: vi.fn().mockResolvedValue({ error: null }) };
			}

			if (
				table === 'character_attacks' ||
				table === 'character_spells' ||
				table === 'character_feats' ||
				table === 'character_inventory_items'
			) {
				return { insert: vi.fn().mockResolvedValue({ error: null }) };
			}

			if (table === 'character_notes') {
				return { insert: notesInsert };
			}

			if (table === 'character_content_profiles') {
				return { insert: contentProfilesInsert };
			}

			throw new Error(`Unexpected table ${table}`);
		});

		await createCharacter({ from } as never, 'user-1', {
			name: 'Custom Draft',
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'custom',
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
			spellItems: [],
			featItems: [],
			inventoryItems: [],
			noteItems: [{ title: 'Goals', content: 'Protect the archive.' }],
			contentProfileMetadata: {
				reasonLines: ['Manual override: Armor Class'],
				guidedBaseline: {
					attackItems: [{ equipmentId: 'weapon-1', name: 'Mace' }],
					spellItems: [{ spellId: 'spell-1', name: 'Bless', isPrepared: true }],
					inventoryItems: [{ equipmentId: 'gear-1', name: 'Shield', quantity: 1, isEquipped: true }],
					noteItems: [{ title: 'Guided build grants', content: 'Language: Comun' }]
				}
			}
		});

		expect(notesInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				title: 'Goals',
				content: 'Protect the archive.'
			})
		]);
		expect(contentProfilesInsert).toHaveBeenCalledWith(
			expect.objectContaining({
				character_id: 'char-1',
				reason_lines: ['Manual override: Armor Class'],
				guided_baseline: expect.objectContaining({
					attackItems: expect.any(Array),
					spellItems: expect.any(Array),
					inventoryItems: expect.any(Array),
					noteItems: expect.any(Array)
				})
			})
		);
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
					equipmentId: undefined,
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
		const spellsEq = vi.fn().mockResolvedValue({
			data: [
				{
					spell_id: MAGIC_MISSILE_SPELL_ID,
					name: 'Magic Missile',
					level: 1,
					school: 'Evocation',
					casting_time: '1 action',
					range: '120 ft.',
					components: 'V, S',
					duration: 'Instantaneous',
					description: null,
					is_prepared: true
				}
			],
			error: null
		});
		const spellsSelect = vi.fn().mockReturnValue({ eq: spellsEq });
		const featsEq = vi.fn().mockResolvedValue({
			data: [
				{
					feat_id: ALERT_FEAT_ID,
					name: 'Alert',
					description: 'Always ready to act.'
				}
			],
			error: null
		});
		const featsSelect = vi.fn().mockReturnValue({ eq: featsEq });

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
		const notesEq = vi.fn().mockResolvedValue({
			data: [
				{
					title: 'Research',
					content: 'Tracks ley lines.'
				}
			],
			error: null
		});
		const notesSelect = vi.fn().mockReturnValue({ eq: notesEq });
		const contentProfileMaybeSingle = vi.fn().mockResolvedValue({
			data: null,
			error: null
		});
		const contentProfileEq = vi.fn().mockReturnValue({ maybeSingle: contentProfileMaybeSingle });
		const contentProfileSelect = vi.fn().mockReturnValue({ eq: contentProfileEq });

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

			if (table === 'character_spells') {
				return {
					select: spellsSelect
				};
			}

			if (table === 'character_feats') {
				return {
					select: featsSelect
				};
			}

			if (table === 'character_inventory_items') {
				return {
					select: inventorySelect
				};
			}

			if (table === 'character_notes') {
				return {
					select: notesSelect
				};
			}

			if (table === 'character_content_profiles') {
				return {
					select: contentProfileSelect
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const character = await getCharacterForUser({ from } as never, 'user-1', 'char-1');

		expect(character).toEqual({
			id: 'char-1',
			name: 'Talia Stormstep',
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'custom',
			speciesId: 'species-1',
			subspeciesId: undefined,
			classId: 'class-1',
			race: 'Elf',
			subrace: undefined,
			className: 'Wizard',
			subclassId: undefined,
			subclass: 'Evocation',
			level: 3,
			backgroundId: undefined,
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
					equipmentId: undefined,
					name: 'Quarterstaff',
					attackBonus: '+4',
					damage: '1d6',
					damageType: 'bludgeoning',
					range: 'Melee',
					description: undefined
				}
			],
			spellItems: [
				{
					spellId: MAGIC_MISSILE_SPELL_ID,
					name: 'Magic Missile',
					level: 1,
					school: 'Evocation',
					castingTime: '1 action',
					range: '120 ft.',
					components: 'V, S',
					duration: 'Instantaneous',
					description: undefined,
					isPrepared: true
				}
			],
			featItems: [
				{
					featId: ALERT_FEAT_ID,
					name: 'Alert',
					description: 'Always ready to act.'
				}
			],
			inventoryItems: [
				{
					equipmentId: undefined,
					name: 'Spellbook',
					quantity: 1,
					description: undefined,
					isEquipped: false,
					value: undefined,
					weight: undefined
				}
			],
			noteItems: [
				{
					title: 'Research',
					content: 'Tracks ley lines.'
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
		const spellsEq = vi.fn().mockResolvedValue({
			data: [],
			error: null
		});
		const featsEq = vi.fn().mockResolvedValue({
			data: [],
			error: null
		});
		const notesEq = vi.fn().mockResolvedValue({
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

			if (table === 'character_spells') {
				return { select: vi.fn().mockReturnValue({ eq: spellsEq }) };
			}

			if (table === 'character_feats') {
				return { select: vi.fn().mockReturnValue({ eq: featsEq }) };
			}

			if (table === 'character_inventory_items') {
				return { select: vi.fn().mockReturnValue({ eq: inventoryEq }) };
			}

			if (table === 'character_notes') {
				return { select: vi.fn().mockReturnValue({ eq: notesEq }) };
			}

			if (table === 'character_content_profiles') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: null,
								error: null
							})
						})
					})
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const character = await getCharacterForUser({ from } as never, 'user-1', 'char-1');

		expect(character?.attackItems).toEqual([]);
		expect(character?.spellItems).toEqual([]);
		expect(character?.featItems).toEqual([]);
		expect(character?.inventoryItems).toEqual([
			{ name: 'Rope', quantity: 1, isEquipped: false },
			{ name: 'Torch', quantity: 1, isEquipped: false }
		]);
		expect(character?.noteItems).toEqual([]);
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

			if (table === 'character_spells') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					})
				};
			}

			if (table === 'character_feats') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					})
				};
			}

			if (table === 'character_notes') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					})
				};
			}

			if (table === 'character_content_profiles') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: null,
								error: null
							})
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
		expect(character?.spellItems).toEqual([]);
		expect(character?.featItems).toEqual([]);
		expect(character?.noteItems).toEqual([]);
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

	it('extracts persisted custom profile metadata from the dedicated content-profile table', async () => {
		const characterMaybeSingle = vi.fn().mockResolvedValue({
			data: {
				id: 'char-1',
				name: 'Custom Draft',
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
		const from = vi.fn((table: string) => {
			if (table === 'characters') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							eq: vi.fn().mockReturnValue({ maybeSingle: characterMaybeSingle })
						})
					})
				};
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
									attacks: null,
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

			if (
				table === 'character_attacks' ||
				table === 'character_spells' ||
				table === 'character_feats' ||
				table === 'character_inventory_items'
			) {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					})
				};
			}

			if (table === 'character_notes') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [
								{
									title: 'Goals',
									content: 'Protect the archive.'
								}
							],
							error: null
						})
					})
				};
			}

			if (table === 'character_content_profiles') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: {
									reason_lines: ['Manual override: Armor Class'],
									guided_baseline: {
										attackItems: [{ equipmentId: 'weapon-1', name: 'Mace' }],
										spellItems: [{ spellId: 'spell-1', name: 'Bless', isPrepared: true }],
										inventoryItems: [
											{ equipmentId: 'gear-1', name: 'Shield', quantity: 1, isEquipped: true }
										],
										noteItems: [{ title: 'Guided build grants', content: 'Language: Comun' }]
									}
								},
								error: null
							})
						})
					})
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const character = await getCharacterForUser({ from } as never, 'user-1', 'char-1');

		expect(character?.contentProfileMetadata).toEqual({
			reasonLines: ['Manual override: Armor Class'],
			guidedBaseline: {
				attackItems: [{ equipmentId: 'weapon-1', name: 'Mace' }],
				spellItems: [{ spellId: 'spell-1', name: 'Bless', isPrepared: true }],
				inventoryItems: [{ equipmentId: 'gear-1', name: 'Shield', quantity: 1, isEquipped: true }],
				noteItems: [{ title: 'Guided build grants', content: 'Language: Comun' }]
			}
		});
		expect(character?.noteItems).toEqual([
			{
				title: 'Goals',
				content: 'Protect the archive.'
			}
		]);
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
					equipment_id: null,
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
		const spellsSelectEq = vi.fn().mockResolvedValue({
			data: [
				{
					spell_id: MAGIC_MISSILE_SPELL_ID,
					name: 'Magic Missile',
					level: 1,
					school: 'Evocation',
					casting_time: '1 action',
					range: '120 ft.',
					components: 'V, S',
					duration: 'Instantaneous',
					description: null,
					is_prepared: true
				}
			],
			error: null
		});
		const spellsSelect = vi.fn().mockReturnValue({ eq: spellsSelectEq });
		const spellsDeleteEq = vi.fn().mockResolvedValue({ error: null });
		const spellsDelete = vi.fn().mockReturnValue({ eq: spellsDeleteEq });
		const spellsInsert = vi.fn().mockResolvedValue({ error: null });
		const featsSelectEq = vi.fn().mockResolvedValue({
			data: [],
			error: null
		});
		const featsSelect = vi.fn().mockReturnValue({ eq: featsSelectEq });
		const featsDeleteEq = vi.fn().mockResolvedValue({ error: null });
		const featsDelete = vi.fn().mockReturnValue({ eq: featsDeleteEq });
		const featsInsert = vi.fn().mockResolvedValue({ error: null });
		const inventoryDeleteEq = vi.fn().mockResolvedValue({ error: null });
		const inventoryDelete = vi.fn().mockReturnValue({ eq: inventoryDeleteEq });
		const inventoryInsert = vi.fn().mockResolvedValue({ error: null });
		const notesSelectEq = vi.fn().mockResolvedValue({
			data: [],
			error: null
		});
		const notesSelect = vi.fn().mockReturnValue({ eq: notesSelectEq });
		const notesDeleteEq = vi.fn().mockResolvedValue({ error: null });
		const notesDelete = vi.fn().mockReturnValue({ eq: notesDeleteEq });
		const notesInsert = vi.fn().mockResolvedValue({ error: null });
		const contentProfilesDeleteEq = vi.fn().mockResolvedValue({ error: null });
		const contentProfilesDelete = vi.fn().mockReturnValue({ eq: contentProfilesDeleteEq });
		const contentProfilesInsert = vi.fn().mockResolvedValue({ error: null });

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

			if (table === 'character_spells') {
				return {
					select: spellsSelect,
					delete: spellsDelete,
					insert: spellsInsert
				};
			}

			if (table === 'character_feats') {
				return {
					select: featsSelect,
					delete: featsDelete,
					insert: featsInsert
				};
			}

			if (table === 'character_inventory_items') {
				return {
					delete: inventoryDelete,
					insert: inventoryInsert
				};
			}

			if (table === 'character_notes') {
				return {
					select: notesSelect,
					delete: notesDelete,
					insert: notesInsert
				};
			}

			if (table === 'character_content_profiles') {
				return {
					delete: contentProfilesDelete,
					insert: contentProfilesInsert
				};
			}

			throw new Error(`Unexpected table ${table}`);
		});

		const result = await updateCharacter({ from } as never, 'user-1', 'char-1', {
			name: 'Talia Stormstep',
			rulesetCode: 'dnd-2014-srd',
			contentMode: 'canon',
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
			spellItems: [
				{
					spellId: GUIDING_BOLT_SPELL_ID,
					name: 'Guiding Bolt',
					level: 1,
					school: 'Evocation',
					castingTime: '1 action',
					range: '120 ft.',
					duration: 'Instantaneous',
					isPrepared: true
				}
			],
			featItems: [
				{
					featId: ALERT_FEAT_ID,
					name: 'Alert',
					description: 'Always ready to act.'
				}
			],
			inventoryItems: [
				{
					name: 'Lantern',
					quantity: 1,
					isEquipped: true
				}
			],
			noteItems: [
				{
					title: 'Omen',
					content: 'Carries a lantern relic.'
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
				spells: 'Guiding Bolt | Level 1 | Evocation | Prepared',
				notes: 'Omen\nCarries a lantern relic.'
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
		expect(spellsDeleteEq).toHaveBeenCalledWith('character_id', 'char-1');
		expect(featsDeleteEq).toHaveBeenCalledWith('character_id', 'char-1');
		expect(featsInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				feat_id: ALERT_FEAT_ID,
				name: 'Alert',
				description: 'Always ready to act.'
			})
		]);
		expect(spellsInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				spell_id: GUIDING_BOLT_SPELL_ID,
				name: 'Guiding Bolt',
				level: 1,
				school: 'Evocation',
				is_prepared: true
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
		expect(notesDeleteEq).toHaveBeenCalledWith('character_id', 'char-1');
		expect(notesInsert).toHaveBeenCalledWith([
			expect.objectContaining({
				character_id: 'char-1',
				title: 'Omen',
				content: 'Carries a lantern relic.'
			})
		]);
		expect(contentProfilesDeleteEq).toHaveBeenCalledWith('character_id', 'char-1');
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
				rulesetCode: 'dnd-2014-srd',
				contentMode: 'canon',
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
				spellItems: [],
				featItems: [],
				inventoryItems: [],
				noteItems: []
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

			if (table === 'character_notes') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					}),
					delete: vi
						.fn()
						.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
					insert: vi.fn().mockResolvedValue({ error: null })
				};
			}

			if (table === 'character_spells') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					}),
					delete: vi
						.fn()
						.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
					insert: vi.fn().mockResolvedValue({ error: null })
				};
			}

			if (table === 'character_feats') {
				return {
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					}),
					delete: vi
						.fn()
						.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
					insert: vi.fn().mockResolvedValue({ error: null })
				};
			}

			if (table === 'character_content_profiles') {
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
				rulesetCode: 'dnd-2014-srd',
				contentMode: 'canon',
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
				spellItems: [],
				featItems: [],
				inventoryItems: [],
				noteItems: [],
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
