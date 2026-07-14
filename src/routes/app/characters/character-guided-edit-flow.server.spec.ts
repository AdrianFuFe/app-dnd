import { describe, expect, it } from 'vitest';
import { actions as createActions } from './new/+page.server';
import { actions as editActions } from './[characterId]/edit/+page.server';
import { load as characterDetailLoad } from './[characterId]/+page.server';
import { load as characterEditLoad } from './[characterId]/edit/+page.server';
import { listGuidedCharacterCatalog } from '$lib/server/repositories/catalog';
import {
	createE2EMockSupabaseClient,
	getE2EMockSession,
	resetE2EMockState,
	updateE2ECharacterForUser
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
			guidedBaseline: expect.objectContaining({
				attackItems: expect.any(Array),
				spellItems: expect.any(Array),
				inventoryItems: expect.any(Array),
				noteItems: expect.any(Array)
			}),
			currentEditState: {
				contentMode: 'canon',
				statusSummary: 'This draft is still aligned with the canonical guided baseline.',
				reasonLines: [],
				guidedDivergedSections: []
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

	it('loads a guided wizard draft into edit with derived spell items preserved', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);

		let redirectLocation = '';

		try {
			await createActions.guided?.({
				locals: { session, supabase },
				request: createWizardGuidedRequest(catalog)
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
			characterName: 'Aeris Vale',
			guidedHandoff: true,
			currentEditState: {
				contentMode: 'canon',
				statusSummary: 'This draft is still aligned with the canonical guided baseline.',
				reasonLines: [],
				guidedDivergedSections: []
			},
			guidedOriginSummary: {
				lineageSummary: 'Elfo / High Elf',
				classSummary: 'Mago',
				backgroundSummary: 'Acolyte',
				statusSummary: 'Still on the canonical guided path.',
				choiceLines: expect.arrayContaining([
					'Chosen spells: Light',
					'Chosen spells: Mage Hand, Minor Illusion, Prestidigitation',
					'Chosen spells: Charm Person, Comprehend Languages, Detect Magic, Identify, Magic Missile, Shield'
				])
			},
			values: expect.objectContaining({
				name: 'Aeris Vale',
				speciesId: expect.any(String),
				subspeciesId: expect.any(String),
				classId: expect.any(String),
				backgroundId: expect.any(String),
				level: '1',
				story: 'An apprentice archivist chasing fragments of ancient arcana.'
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
					],
					guidedBaseline: expect.objectContaining({
						attackItems: expect.any(Array),
						spellItems: expect.any(Array),
						inventoryItems: expect.any(Array),
						noteItems: expect.any(Array)
					})
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
				],
				guidedDivergedSections: []
			}
		});
	});

	it('preserves guided detail summary from baseline even if guided notes are removed later', async () => {
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

		try {
			await editActions.default?.({
				locals: { session, supabase },
				params: { characterId },
				request: createGuidedEditRequestWithoutGuidedNotes(detail.character),
				url: new URL(`http://localhost/app/characters/${characterId}/edit?guided=1`)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
		}

		await expect(
			characterDetailLoad({
				locals: { session, supabase },
				params: { characterId },
				url: new URL(`http://localhost/app/characters/${characterId}?guided=1`)
			} as never)
		).resolves.toMatchObject({
			guidedHandoff: true,
			guidedOriginSummary: {
				lineageSummary: 'Humano',
				classSummary: 'Clerigo / Life Domain',
				backgroundSummary: 'Acolyte',
				grantLines: expect.arrayContaining([
					'Language: Comun',
					'Saving Throw proficiency: Wisdom'
				]),
				choiceLines: expect.arrayContaining([
					'Chosen equipment: Mace',
					'Chosen Skill proficiencies: History, Insight'
				])
			},
			character: expect.objectContaining({
				contentMode: 'custom',
				noteItems: expect.arrayContaining([
					expect.objectContaining({ title: 'Travel reminder' })
				]),
				contentProfileMetadata: expect.objectContaining({
					guidedBaseline: expect.objectContaining({
						noteItems: expect.any(Array)
					})
				})
			})
		});
	});

	it('restores guided lineage and class summaries from baseline identity when current labels are blank', async () => {
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
		const guidedCharacter = updateE2ECharacterForUser(session.user.id, characterId, {
			...(await loadGuidedCharacterDetail(session.user.id, supabase, characterId)),
			race: undefined,
			subrace: undefined,
			className: undefined,
			subclass: undefined,
			background: undefined
		});

		expect(guidedCharacter).toBeTruthy();

		await expect(
			characterDetailLoad({
				locals: { session, supabase },
				params: { characterId },
				url: new URL(`http://localhost/app/characters/${characterId}?guided=1`)
			} as never)
		).resolves.toMatchObject({
			guidedOriginSummary: {
				lineageSummary: 'Humano',
				classSummary: 'Clerigo / Life Domain',
				backgroundSummary: 'Acolyte'
			}
		});

		await expect(
			characterEditLoad({
				locals: { session, supabase },
				params: { characterId },
				url: new URL(`http://localhost/app/characters/${characterId}/edit?guided=1`)
			} as never)
		).resolves.toMatchObject({
			guidedOriginSummary: {
				lineageSummary: 'Humano',
				classSummary: 'Clerigo / Life Domain',
				backgroundSummary: 'Acolyte'
			},
			values: expect.objectContaining({
				speciesId: expect.any(String),
				classId: expect.any(String),
				subclassId: expect.any(String),
				backgroundId: expect.any(String)
			})
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

	it('keeps a guided wizard draft canonical when saved unchanged after edit handoff', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);

		let redirectLocation = '';

		try {
			await createActions.guided?.({
				locals: { session, supabase },
				request: createWizardGuidedRequest(catalog)
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
			throw new Error('Expected the guided wizard detail page to load.');
		}

		const detail = loadedDetail;
		let editRedirectLocation = '';

		try {
			await editActions.default?.({
				locals: { session, supabase },
				params: { characterId },
				request: createGuidedCanonicalEditRequest(detail.character),
				url: new URL(`http://localhost/app/characters/${characterId}/edit?guided=1`)
			} as never);
		} catch (redirect) {
			expect(redirect).toMatchObject({ status: 303 });
			editRedirectLocation = (redirect as { location: string }).location;
		}

		expect(editRedirectLocation).toBe(
			`/app/characters/${characterId}?updated=Aeris+Vale&guided=1`
		);

		await expect(
			characterDetailLoad({
				locals: { session, supabase },
				params: { characterId },
				url: new URL(`http://localhost${editRedirectLocation}`)
			} as never)
		).resolves.toMatchObject({
			updatedName: 'Aeris Vale',
			character: expect.objectContaining({
				contentMode: 'canon',
				spellItems: expect.arrayContaining([
					expect.objectContaining({ name: 'Light', isPrepared: false }),
					expect.objectContaining({ name: 'Magic Missile', isPrepared: false }),
					expect.objectContaining({ name: 'Shield', isPrepared: false })
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
			abilityChoices: JSON.stringify([]),
			spellChoices: JSON.stringify([]),
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

function createWizardGuidedRequest(
	catalog: Awaited<ReturnType<typeof listGuidedCharacterCatalog>>,
	overrides: Partial<Record<string, string>> = {}
) {
	const speciesId = catalog.speciesOptions.find((entry) => entry.slug === 'elfo')?.id;
	const subspeciesId = catalog.subspeciesOptions.find((entry) => entry.slug === 'high-elf')?.id;
	const classId = catalog.classOptions.find((entry) => entry.slug === 'mago')?.id;
	const backgroundId = catalog.backgroundOptions.find((entry) => entry.slug === 'acolyte')?.id;

	return new Request('http://localhost/app/characters/new?/guided', {
		method: 'POST',
		body: new URLSearchParams({
			name: 'Aeris Vale',
			story: 'An apprentice archivist chasing fragments of ancient arcana.',
			speciesId: speciesId ?? '',
			subspeciesId: subspeciesId ?? '',
			classId: classId ?? '',
			subclassId: '',
			backgroundId: backgroundId ?? '',
			strength: '8',
			dexterity: '14',
			constitution: '13',
			intelligence: '15',
			wisdom: '12',
			charisma: '10',
			abilityChoices: JSON.stringify([]),
			spellChoices: JSON.stringify([
				{ key: 'spell:0', value: 'light' },
				{ key: 'spell:1', value: 'mage-hand' },
				{ key: 'spell:1', value: 'minor-illusion' },
				{ key: 'spell:1', value: 'prestidigitation' },
				{ key: 'spell:2', value: 'charm-person' },
				{ key: 'spell:2', value: 'comprehend-languages' },
				{ key: 'spell:2', value: 'detect-magic' },
				{ key: 'spell:2', value: 'identify' },
				{ key: 'spell:2', value: 'magic-missile' },
				{ key: 'spell:2', value: 'shield' }
			]),
			languageChoices: JSON.stringify([
				{ key: 'language:0', value: 'draconico' },
				{ key: 'language:1', value: 'comun' },
				{ key: 'language:1', value: 'gigante' }
			]),
			proficiencyChoices: JSON.stringify([
				{ key: 'skill:0', value: 'arcana' },
				{ key: 'skill:0', value: 'investigation' }
			]),
			equipmentChoices: JSON.stringify([
				{ key: 'equipment:0', value: 'quarterstaff' },
				{ key: 'equipment:1', value: 'explorers-pack' },
				{ key: 'equipment:2', value: 'prayer-book' }
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

function createGuidedEditRequestWithoutGuidedNotes(character: {
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
			strength: '12',
			dexterity: '10',
			constitution: '14',
			intelligence: '11',
			wisdom: '15',
			charisma: '13',
			maxHp: '9',
			currentHp: '9',
			temporaryHp: '0',
			armorClass: '11',
			initiative: '0',
			speed: '30',
			hitDice: '1d8',
			attackItems: JSON.stringify(character.attackItems),
			spellItems: JSON.stringify(character.spellItems),
			featItems: JSON.stringify(character.featItems),
			inventoryItems: JSON.stringify(character.inventoryItems),
			noteItems: JSON.stringify([
				{
					title: 'Travel reminder',
					content: 'Replace the default guided notes with a shorter field note.'
				}
			]),
			attacks: '',
			spells: '',
			notes: ''
		})
	});
}

async function loadGuidedCharacterDetail(
	userId: string,
	supabase: ReturnType<typeof createE2EMockSupabaseClient>,
	characterId: string
) {
	const loadedDetail = await characterDetailLoad({
		locals: { session: getE2EMockSession(), supabase },
		params: { characterId },
		url: new URL(`http://localhost/app/characters/${characterId}?guided=1`)
	} as never);

	if (!loadedDetail || !('character' in loadedDetail)) {
		throw new Error(`Expected guided character ${characterId} to load for user ${userId}.`);
	}

	return loadedDetail.character;
}
