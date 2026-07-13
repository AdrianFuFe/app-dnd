import { describe, expect, it } from 'vitest';
import { actions as createActions } from './new/+page.server';
import { actions as editActions } from './[characterId]/edit/+page.server';
import { load as characterDetailLoad } from './[characterId]/+page.server';
import { load as characterEditLoad } from './[characterId]/edit/+page.server';
import { listGuidedCharacterCatalog } from '$lib/server/repositories/catalog';
import {
	createE2EMockSupabaseClient,
	getE2EMockSession,
	resetE2EMockState
} from '$lib/server/e2e/mock-app';

describe('guided character edit flow with E2E mock', () => {
	it('loads guided-created drafts into the edit form with prefilled identity values', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);

		let redirectLocation = '';

		try {
			await createActions.guided?.({
				locals: { session, supabase },
				request: createGuidedRequest(catalog)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			redirectLocation = (redirect as { location: string }).location;
		}

		const redirectedUrl = new URL(`http://localhost${redirectLocation}`);
		const characterId = redirectedUrl.pathname.split('/').at(-1) ?? '';

		await expect(
			characterEditLoad({
				locals: { session, supabase },
				params: { characterId },
				url: new URL(`http://localhost/app/characters/${characterId}/edit?guided=1`)
			} as never)
		).resolves.toMatchObject({
			characterName: 'Seren Dawnwatch',
			guidedHandoff: true,
			currentEditState: {
				contentMode: 'canon',
				statusSummary: 'This draft is still aligned with the canonical guided baseline.',
				reasonLines: []
			},
			guidedOriginSummary: {
				lineageSummary: 'Humano',
				classSummary: 'Clerigo / Life Domain',
				backgroundSummary: 'Acolyte',
				statusSummary: 'Still on the canonical guided path.',
				grantLines: expect.arrayContaining([
					'Language: Comun',
					'Saving Throw proficiency: Wisdom'
				]),
				choiceLines: expect.arrayContaining([
					'Chosen equipment: Mace',
					'Chosen Skill proficiencies: History, Insight'
				])
			},
			values: expect.objectContaining({
				name: 'Seren Dawnwatch',
				speciesId: expect.any(String),
				classId: expect.any(String),
				subclassId: expect.any(String),
				backgroundId: expect.any(String),
				level: '1',
				story: 'A novice healer learning to lead with courage.'
			})
		});
	});

	it('marks a guided draft as custom with divergence reasons after a manual edit', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const request = createGuidedRequest(catalog);

		let redirectLocation = '';

		try {
			await createActions.guided?.({
				locals: { session, supabase },
				request
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			redirectLocation = (redirect as { location: string }).location;
		}

		const redirectedUrl = new URL(`http://localhost${redirectLocation}`);
		const characterId = redirectedUrl.pathname.split('/').at(-1) ?? '';
		const loadedDetail = await characterDetailLoad({
			locals: { session, supabase },
			params: { characterId },
			url: redirectedUrl
		} as never);

		if (!loadedDetail || !('character' in loadedDetail)) {
			throw new Error('Expected the guided character detail page to load.');
		}

		const detail = loadedDetail;

		let editRedirectLocation = '';

		try {
			await editActions.default?.({
				locals: { session, supabase },
				params: { characterId },
				request: createGuidedEditRequest(detail.character),
				url: new URL(`http://localhost/app/characters/${characterId}/edit?guided=1`)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			editRedirectLocation = (redirect as { location: string }).location;
		}

		expect(editRedirectLocation).toBeTruthy();

		const updatedUrl = new URL(`http://localhost${editRedirectLocation}`);

		await expect(
			characterDetailLoad({
				locals: { session, supabase },
				params: { characterId },
				url: updatedUrl
			} as never)
		).resolves.toMatchObject({
			updatedName: 'Seren Dawnwatch',
			character: expect.objectContaining({
				contentMode: 'custom',
				contentProfileMetadata: {
					reasonLines: [
						'Guided baseline diverged after manual edits',
						'Manual override: Armor Class'
					]
				}
			})
		});

		await expect(
			characterEditLoad({
				locals: { session, supabase },
				params: { characterId },
				url: new URL(`http://localhost/app/characters/${characterId}/edit?guided=1`)
			} as never)
		).resolves.toMatchObject({
			currentEditState: {
				contentMode: 'custom',
				statusSummary: 'This draft currently lives on a custom path for the same ruleset.',
				reasonLines: [
					'Guided baseline diverged after manual edits',
					'Manual override: Armor Class'
				]
			}
		});
	});

	it('preserves existing guided adoption flags when building the other adopt href', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);

		let redirectLocation = '';

		try {
			await createActions.guided?.({
				locals: { session, supabase },
				request: createGuidedRequest(catalog)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			redirectLocation = (redirect as { location: string }).location;
		}

		const redirectedUrl = new URL(`http://localhost${redirectLocation}`);
		const characterId = redirectedUrl.pathname.split('/').at(-1) ?? '';

		await expect(
			characterEditLoad({
				locals: { session, supabase },
				params: { characterId },
				url: new URL(
					`http://localhost/app/characters/${characterId}/edit?guided=1&adoptInventory=1`
				)
			} as never)
		).resolves.toMatchObject({
			guidedInventoryAdopted: true,
			guidedNoteAdopted: false,
			guidedNoteAdoptHref: `/app/characters/${characterId}/edit?guided=1&adoptInventory=1&adoptNotes=1#notes`
		});
	});

	it('loads the full guided draft values when both adoption flags are active', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);

		let redirectLocation = '';

		try {
			await createActions.guided?.({
				locals: { session, supabase },
				request: createGuidedRequest(catalog)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			redirectLocation = (redirect as { location: string }).location;
		}

		const redirectedUrl = new URL(`http://localhost${redirectLocation}`);
		const characterId = redirectedUrl.pathname.split('/').at(-1) ?? '';

		await expect(
			characterEditLoad({
				locals: { session, supabase },
				params: { characterId },
				url: new URL(
					`http://localhost/app/characters/${characterId}/edit?guided=1&adoptInventory=1&adoptNotes=1`
				)
			} as never)
		).resolves.toMatchObject({
			guidedInventoryAdopted: true,
			guidedNoteAdopted: true,
			values: expect.objectContaining({
				name: 'Seren Dawnwatch',
				speciesId: expect.any(String),
				classId: expect.any(String),
				subclassId: expect.any(String),
				backgroundId: expect.any(String),
				story: 'A novice healer learning to lead with courage.',
				strength: expect.any(String),
				dexterity: expect.any(String),
				constitution: expect.any(String),
				intelligence: expect.any(String),
				wisdom: expect.any(String),
				charisma: expect.any(String),
				maxHp: expect.any(String),
				currentHp: expect.any(String),
				temporaryHp: expect.any(String),
				armorClass: expect.any(String),
				initiative: expect.any(String),
				speed: expect.any(String),
				hitDice: expect.any(String)
			})
		});
	});

	it('keeps a guided draft canonical when adopted baseline inventory and notes are saved unchanged', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);

		let redirectLocation = '';

		try {
			await createActions.guided?.({
				locals: { session, supabase },
				request: createGuidedRequest(catalog)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			redirectLocation = (redirect as { location: string }).location;
		}

		const redirectedUrl = new URL(`http://localhost${redirectLocation}`);
		const characterId = redirectedUrl.pathname.split('/').at(-1) ?? '';
		const loadedDetail = await characterDetailLoad({
			locals: { session, supabase },
			params: { characterId },
			url: redirectedUrl
		} as never);

		if (!loadedDetail || !('character' in loadedDetail)) {
			throw new Error('Expected the guided character detail page to load.');
		}

		const detail = loadedDetail;
		let editRedirectLocation = '';

		try {
			await editActions.default?.({
				locals: { session, supabase },
				params: { characterId },
				request: createGuidedCanonicalEditRequest(detail.character),
				url: new URL(
					`http://localhost/app/characters/${characterId}/edit?guided=1&adoptInventory=1&adoptNotes=1`
				)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			editRedirectLocation = (redirect as { location: string }).location;
		}

		expect(editRedirectLocation).toBe(
			`/app/characters/${characterId}?updated=Seren+Dawnwatch&guided=1`
		);

		await expect(
			characterDetailLoad({
				locals: { session, supabase },
				params: { characterId },
				url: new URL(`http://localhost${editRedirectLocation}`)
			} as never)
		).resolves.toMatchObject({
			updatedName: 'Seren Dawnwatch',
			character: expect.objectContaining({
				contentMode: 'canon',
				inventoryItems: expect.arrayContaining([
					expect.objectContaining({ name: 'Mace' })
				]),
				noteItems: expect.arrayContaining([
					expect.objectContaining({ title: 'Guided build grants' }),
					expect.objectContaining({ title: 'Guided build choices' })
				])
			})
		});
	});

	it('restores blank guided baseline fields on save when both adoption flags are active', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);

		let redirectLocation = '';

		try {
			await createActions.guided?.({
				locals: { session, supabase },
				request: createGuidedRequest(catalog)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			redirectLocation = (redirect as { location: string }).location;
		}

		const redirectedUrl = new URL(`http://localhost${redirectLocation}`);
		const characterId = redirectedUrl.pathname.split('/').at(-1) ?? '';

		let editRedirectLocation = '';

		try {
			await editActions.default?.({
				locals: { session, supabase },
				params: { characterId },
				request: createBrokenGuidedAdoptionEditRequest(),
				url: new URL(
					`http://localhost/app/characters/${characterId}/edit?guided=1&adoptInventory=1&adoptNotes=1`
				)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			editRedirectLocation = (redirect as { location: string }).location;
		}

		expect(editRedirectLocation).toBe(
			`/app/characters/${characterId}?updated=Seren+Dawnwatch&guided=1`
		);
	});
});

function createGuidedRequest(
	catalog: Awaited<ReturnType<typeof listGuidedCharacterCatalog>>,
	overrides: Partial<Record<string, string>> = {}
) {
	const speciesId = catalog.speciesOptions.find((entry) => entry.name === 'Humano')?.id;
	const classId = catalog.classOptions.find((entry) => entry.name === 'Clerigo')?.id;
	const subclassId = catalog.subclassOptions.find((entry) => entry.name === 'Life Domain')?.id;
	const backgroundId = catalog.backgroundOptions.find((entry) => entry.name === 'Acolyte')?.id;

	return new Request('http://localhost/app/characters/new?/guided', {
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
			]),
			...overrides
		})
	});
}

function createGuidedEditRequest(character: {
	name: string;
	speciesId?: string;
	subspeciesId?: string;
	classId?: string;
	subclassId?: string;
	backgroundId?: string;
	story?: string;
	attackItems: unknown[];
	spellItems: unknown[];
	featItems: unknown[];
	inventoryItems: unknown[];
	noteItems: unknown[];
}) {
	return new Request('http://localhost/app/characters/char-e2e-2/edit', {
		method: 'POST',
		body: new URLSearchParams({
			name: character.name,
			speciesId: character.speciesId ?? '',
			subspeciesId: character.subspeciesId ?? '',
			classId: character.classId ?? '',
			subclassId: character.subclassId ?? '',
			level: '1',
			backgroundId: character.backgroundId ?? '',
			story: character.story ?? '',
			strength: '13',
			dexterity: '11',
			constitution: '15',
			intelligence: '12',
			wisdom: '16',
			charisma: '14',
			maxHp: '10',
			currentHp: '10',
			temporaryHp: '0',
			armorClass: '11',
			initiative: '0',
			speed: '30',
			hitDice: '1d8',
			attackItems: JSON.stringify(character.attackItems),
			spellItems: JSON.stringify(character.spellItems),
			featItems: JSON.stringify(character.featItems),
			inventoryItems: JSON.stringify(character.inventoryItems),
			noteItems: JSON.stringify(character.noteItems),
			attacks: '',
			spells: '',
			notes: ''
		})
	});
}

function createGuidedCanonicalEditRequest(character: {
	name: string;
	speciesId?: string;
	subspeciesId?: string;
	classId?: string;
	subclassId?: string;
	backgroundId?: string;
	story?: string;
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
	maxHp: number;
	currentHp: number;
	temporaryHp: number;
	armorClass: number;
	initiative: number;
	speed: number;
	hitDice?: string;
	attackItems: unknown[];
	spellItems: unknown[];
	featItems: unknown[];
	inventoryItems: unknown[];
	noteItems: unknown[];
}) {
	return new Request('http://localhost/app/characters/char-e2e-2/edit', {
		method: 'POST',
		body: new URLSearchParams({
			name: character.name,
			speciesId: character.speciesId ?? '',
			subspeciesId: character.subspeciesId ?? '',
			classId: character.classId ?? '',
			subclassId: character.subclassId ?? '',
			level: '1',
			backgroundId: character.backgroundId ?? '',
			story: character.story ?? '',
			strength: String(character.strength),
			dexterity: String(character.dexterity),
			constitution: String(character.constitution),
			intelligence: String(character.intelligence),
			wisdom: String(character.wisdom),
			charisma: String(character.charisma),
			maxHp: String(character.maxHp),
			currentHp: String(character.currentHp),
			temporaryHp: String(character.temporaryHp),
			armorClass: String(character.armorClass),
			initiative: String(character.initiative),
			speed: String(character.speed),
			hitDice: character.hitDice ?? '',
			attackItems: JSON.stringify(character.attackItems),
			spellItems: JSON.stringify(character.spellItems),
			featItems: JSON.stringify(character.featItems),
			inventoryItems: JSON.stringify(character.inventoryItems),
			noteItems: JSON.stringify(character.noteItems),
			attacks: '',
			spells: '',
			notes: ''
		})
	});
}

function createBrokenGuidedAdoptionEditRequest() {
	return new Request('http://localhost/app/characters/char-e2e-2/edit', {
		method: 'POST',
		body: new URLSearchParams({
			name: 'Seren Dawnwatch',
			speciesId: '',
			subspeciesId: '',
			classId: '',
			subclassId: '',
			level: '',
			backgroundId: '',
			story: '',
			strength: '',
			dexterity: '',
			constitution: '',
			intelligence: '',
			wisdom: '',
			charisma: '',
			maxHp: '',
			currentHp: '',
			temporaryHp: '',
			armorClass: '',
			initiative: '',
			speed: '',
			hitDice: '',
			attackItems: JSON.stringify([]),
			spellItems: JSON.stringify([]),
			featItems: JSON.stringify([]),
			inventoryItems: JSON.stringify([]),
			noteItems: JSON.stringify([]),
			attacks: '',
			spells: '',
			notes: ''
		})
	});
}
