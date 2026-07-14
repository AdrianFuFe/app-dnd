import { describe, expect, it } from 'vitest';
import { actions as createActions } from './new/+page.server';
import { load as newCharacterLoad } from './new/+page.server';
import { load as characterDetailLoad } from './[characterId]/+page.server';
import { listGuidedCharacterCatalog } from '$lib/server/repositories/catalog';
import {
	createE2EMockSupabaseClient,
	getE2EMockSession,
	resetE2EMockState
} from '$lib/server/e2e/mock-app';

describe('guided character create flow with E2E mock', () => {
	it('loads the guided creation page with handoff preview guidance', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();

		await expect(
			newCharacterLoad({
				locals: { supabase, session: null }
			} as never)
		).resolves.toMatchObject({
			guidedHandoffPreview: {
				canonicalSections: expect.arrayContaining([
					'Species, subspecies, class, subclass, and background path'
				]),
				editableSections: expect.arrayContaining([
					'Attacks, spells, inventory, and notes can later be edited in the full character editor'
				]),
				adoptableSections: expect.arrayContaining([
					'Guided equipment can be adopted into editable inventory rows during handoff'
				])
			}
		});
	});

	it('creates a guided draft and loads the redirected detail page with handoff state', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const request = createGuidedRequest(catalog);

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
			character: expect.objectContaining({
				name: 'Seren Dawnwatch',
				contentMode: 'canon',
				className: 'Clerigo',
				background: 'Acolyte',
				contentProfileMetadata: expect.objectContaining({
					guidedBaseline: expect.objectContaining({
						identity: expect.objectContaining({
							race: 'Humano',
							className: 'Clerigo',
							subclass: 'Life Domain',
							background: 'Acolyte'
						}),
						attackItems: expect.any(Array),
						spellItems: expect.any(Array),
						inventoryItems: expect.any(Array),
						noteItems: expect.any(Array)
					})
				})
			})
		});
	});

	it('creates a guided wizard draft with guided spell choices and loads the detail handoff', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const request = createWizardGuidedRequest(catalog);

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
			createdName: 'Aeris Vale',
			guidedHandoff: true,
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
			character: expect.objectContaining({
				name: 'Aeris Vale',
				contentMode: 'canon',
				className: 'Mago',
				subrace: 'High Elf',
				contentProfileMetadata: expect.objectContaining({
					guidedBaseline: expect.objectContaining({
						identity: expect.objectContaining({
							race: 'Elfo',
							subrace: 'High Elf',
							className: 'Mago',
							background: 'Acolyte'
						})
					})
				})
			})
		});
	});

	it('returns field errors when guided choice JSON is malformed', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const result = await createActions.guided?.({
			locals: { session, supabase },
			request: createGuidedRequest(catalog, {
				languageChoices: '{not-json}'
			})
		} as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				guidedFormError: 'Please correct the highlighted guided fields.',
				guidedFieldErrors: {
					languageChoices: expect.any(Array)
				},
				guidedValues: expect.objectContaining({
					name: 'Seren Dawnwatch',
					languageChoices: '{not-json}'
				})
			}
		});
	});

	it('returns a guided form error when submitted choices do not match the current catalog', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const result = await createActions.guided?.({
			locals: { session, supabase },
			request: createGuidedRequest(catalog, {
				equipmentChoices: JSON.stringify([
					{ key: 'equipment:0', value: 'mace' },
					{ key: 'equipment:1', value: 'scale-mail' },
					{ key: 'equipment:2', value: 'light-crossbow-and-20-bolts' },
					{ key: 'equipment:3', value: 'warhammer' },
					{ key: 'equipment:4', value: 'prayer-book' }
				])
			})
		} as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				guidedFormError: 'Please choose only valid options for each equipment choice.',
				guidedFieldErrors: {},
				guidedValues: expect.objectContaining({
					name: 'Seren Dawnwatch'
				})
			}
		});
	});

	it('returns a guided form error when submitted spell choices do not match the current catalog', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const result = await createActions.guided?.({
			locals: { session, supabase },
			request: createWizardGuidedRequest(catalog, {
				spellChoices: JSON.stringify([
					{ key: 'spell:0', value: 'bless' },
					{ key: 'spell:1', value: 'mage-hand' },
					{ key: 'spell:1', value: 'minor-illusion' },
					{ key: 'spell:1', value: 'prestidigitation' },
					{ key: 'spell:2', value: 'charm-person' },
					{ key: 'spell:2', value: 'comprehend-languages' },
					{ key: 'spell:2', value: 'detect-magic' },
					{ key: 'spell:2', value: 'identify' },
					{ key: 'spell:2', value: 'magic-missile' },
					{ key: 'spell:2', value: 'shield' }
				])
			})
		} as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				guidedFormError: 'Please choose only valid options for each spell choice.',
				guidedFieldErrors: {},
				guidedValues: expect.objectContaining({
					name: 'Aeris Vale'
				})
			}
		});
	});

	it('returns a guided form error when a submitted guided choice contains duplicates', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const result = await createActions.guided?.({
			locals: { session, supabase },
			request: createGuidedRequest(catalog, {
				languageChoices: JSON.stringify([
					{ key: 'language:0', value: 'draconico' },
					{ key: 'language:1', value: 'comun' },
					{ key: 'language:1', value: 'comun' }
				])
			})
		} as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				guidedFormError: 'Please avoid duplicate picks in each language choice.',
				guidedFieldErrors: {},
				guidedValues: expect.objectContaining({
					name: 'Seren Dawnwatch'
				})
			}
		});
	});

	it('returns a guided form error when a submitted guided choice exceeds the allowed count', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const result = await createActions.guided?.({
			locals: { session, supabase },
			request: createGuidedRequest(catalog, {
				languageChoices: JSON.stringify([
					{ key: 'language:0', value: 'draconico' },
					{ key: 'language:0', value: 'gigante' },
					{ key: 'language:1', value: 'comun' },
					{ key: 'language:1', value: 'gigante' }
				])
			})
		} as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				guidedFormError: 'Please keep each language choice within the allowed number of picks.',
				guidedFieldErrors: {},
				guidedValues: expect.objectContaining({
					name: 'Seren Dawnwatch'
				})
			}
		});
	});

	it('returns a guided form error when the submitted subclass is not available at level 1', async () => {
		resetE2EMockState();

		const supabase = createE2EMockSupabaseClient();
		const session = getE2EMockSession();
		const catalog = await listGuidedCharacterCatalog(supabase);
		const fighterClassId = catalog.classOptions.find((entry) => entry.slug === 'guerrero')?.id;
		const subclassId = catalog.subclassOptions.find(
			(entry) => entry.classSlug === 'guerrero' && entry.startsAtLevel === 3
		)?.id;

		if (!fighterClassId || !subclassId) {
			return;
		}

		const result = await createActions.guided?.({
			locals: { session, supabase },
			request: createGuidedRequest(catalog, {
				classId: fighterClassId,
				subclassId
			})
		} as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				guidedFormError: 'Please choose a subclass that is available at level 1.',
				guidedFieldErrors: {},
				guidedValues: expect.objectContaining({
					name: 'Seren Dawnwatch',
					subclassId
				})
			}
		});
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
