import { describe, expect, it } from 'vitest';
import { actions as createActions } from './new/+page.server';
import { load as characterDetailLoad } from './[characterId]/+page.server';
import { listGuidedCharacterCatalog } from '$lib/server/repositories/catalog';
import {
	createE2EMockSupabaseClient,
	getE2EMockSession,
	resetE2EMockState
} from '$lib/server/e2e/mock-app';

describe('guided character create flow with E2E mock', () => {
	it('creates a guided draft and loads the redirected detail page with handoff state', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const speciesId = catalog.speciesOptions.find((entry) => entry.name === 'Humano')?.id;
		const classId = catalog.classOptions.find((entry) => entry.name === 'Clerigo')?.id;
		const subclassId = catalog.subclassOptions.find((entry) => entry.name === 'Life Domain')?.id;
		const backgroundId = catalog.backgroundOptions.find((entry) => entry.name === 'Acolyte')?.id;
		const request = new Request('http://localhost/app/characters/new?/guided', {
			method: 'POST',
			body: new URLSearchParams({
				name: 'Seren Dawnwatch',
				story: 'A novice healer learning to lead with courage.',
				speciesId: speciesId ?? '',
				subspeciesId: '',
				classId: classId ?? '',
				subclassId: subclassId ?? '',
				backgroundId: backgroundId ?? '',
				strength: '12',
				dexterity: '10',
				constitution: '14',
				intelligence: '11',
				wisdom: '15',
				charisma: '13',
				overrideMaxHp: '',
				overrideCurrentHp: '',
				overrideTemporaryHp: '',
				overrideArmorClass: '',
				overrideInitiative: '',
				overrideSpeed: '',
				languageChoices: JSON.stringify([
					{ key: 'language:0', value: 'draconico' },
					{ key: 'language:1', value: 'comun' },
					{ key: 'language:1', value: 'gigante' }
				]),
				proficiencyChoices: JSON.stringify([
					{ key: 'skill:0', value: 'history' },
					{ key: 'skill:0', value: 'insight' }
				]),
				equipmentChoices: JSON.stringify([
					{ key: 'equipment:0', value: 'mace' },
					{ key: 'equipment:1', value: 'scale-mail' },
					{ key: 'equipment:2', value: 'light-crossbow-and-20-bolts' },
					{ key: 'equipment:3', value: 'priests-pack' },
					{ key: 'equipment:4', value: 'prayer-book' }
				])
			})
		});

		let redirectLocation = '';
		let actionResult: unknown;

		try {
			actionResult = await createActions.guided?.({
				locals: { session, supabase },
				request
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			redirectLocation = (redirect as { location: string }).location;
		}

		expect(redirectLocation || actionResult).toBeTruthy();
		expect(redirectLocation).toBeTruthy();

		const redirectedUrl = new URL(`http://localhost${redirectLocation}`);
		const characterId = redirectedUrl.pathname.split('/').at(-1);

		await expect(
			characterDetailLoad({
				locals: { session, supabase },
				params: { characterId },
				url: redirectedUrl
			} as never)
		).resolves.toMatchObject({
			createdName: 'Seren Dawnwatch',
			guidedHandoff: true,
			character: expect.objectContaining({
				name: 'Seren Dawnwatch',
				contentMode: 'canon',
				className: 'Clerigo',
				background: 'Acolyte'
			})
		});
	});
});
