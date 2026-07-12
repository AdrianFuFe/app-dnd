import { describe, expect, it } from 'vitest';
import { actions as createActions } from './new/+page.server';
import { load as characterDetailLoad } from './[characterId]/+page.server';
import {
	listCharacterCreationCatalog,
	listExpandedContentCatalog
} from '$lib/server/repositories/catalog';
import {
	createE2EMockSupabaseClient,
	getE2EMockSession,
	resetE2EMockState
} from '$lib/server/e2e/mock-app';

describe('character create flow with E2E mock', () => {
	it('creates a manual draft and loads the redirected detail page', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const [catalog, expandedContentCatalog] = await Promise.all([
			listCharacterCreationCatalog(supabase),
			listExpandedContentCatalog(supabase)
		]);
		const speciesId = catalog.speciesOptions.find((entry) => entry.name === 'Humano')?.id;
		const classId = catalog.classOptions.find((entry) => entry.name === 'Guerrero')?.id;
		const backgroundId = catalog.backgroundOptions.find((entry) => entry.name === 'Soldier')?.id;
		const warhammerId = expandedContentCatalog.equipment.find(
			(entry) => entry.name === 'Warhammer'
		)?.id;
		const request = new Request('http://localhost/app/characters/new', {
			method: 'POST',
			body: new URLSearchParams({
				name: 'Brakka Emberforge',
				speciesId: speciesId ?? '',
				subspeciesId: '',
				classId: classId ?? '',
				subclassId: '',
				level: '4',
				backgroundId: backgroundId ?? '',
				story: 'A caravan guard learning to lead from the front.',
				strength: '16',
				dexterity: '14',
				constitution: '15',
				intelligence: '10',
				wisdom: '12',
				charisma: '10',
				maxHp: '34',
				currentHp: '28',
				temporaryHp: '0',
				armorClass: '17',
				initiative: '2',
				speed: '30',
				hitDice: '4d10',
				attackItems: JSON.stringify([
					{
						equipmentId: warhammerId ?? '',
						name: 'Warhammer',
						attackBonus: '+5',
						damage: '1d8',
						damageType: 'bludgeoning',
						range: 'Melee',
						description: ''
					}
				]),
				spellItems: JSON.stringify([]),
				featItems: JSON.stringify([]),
				inventoryItems: JSON.stringify([]),
				noteItems: JSON.stringify([
					{
						title: 'Orders',
						content: 'Keeps a marching ledger for the caravan.'
					}
				])
			})
		});

		let redirectLocation = '';

		try {
			await createActions.manual?.({
				locals: { session, supabase },
				request
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			redirectLocation = (redirect as { location: string }).location;
		}

		const redirectedUrl = new URL(`http://localhost${redirectLocation}`);
		const characterId = redirectedUrl.pathname.split('/').at(-1);

		await expect(
			characterDetailLoad({
				locals: { session, supabase },
				params: { characterId },
				url: redirectedUrl
			} as never)
		).resolves.toMatchObject({
			createdName: 'Brakka Emberforge',
			character: expect.objectContaining({
				name: 'Brakka Emberforge'
			})
		});
	});
});
