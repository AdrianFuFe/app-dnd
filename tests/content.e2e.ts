import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
	const response = await request.post('/api/test/reset');
	expect(response.ok()).toBeTruthy();

	await page.context().clearCookies();
});

test('user role keeps privileged content controls hidden', async ({ browser }) => {
	const page = await openContentPage(browser, 'user');

	await expect(page.getByRole('heading', { name: 'Create your own feat draft' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Create private feat' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Publish shared feat' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Publish system feat' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Review trusted shared entries' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Update a managed shared feat' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Create your own spell draft' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Create private spell' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Publish shared spell' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Publish system spell' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Review trusted shared spells' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Update a managed shared spell' })).toHaveCount(0);

	await page.context().close();
});

test('content editors can publish, update, and retire their shared feats', async ({ browser }) => {
	const page = await openContentPage(browser, 'content_editor');

	const featName = 'Lantern Savant';
	await fillFeatDraftForm(getFeatCreateForm(page), {
		name: featName,
		summary: 'Study the secret geometry of lantern light.',
		description: 'You can read hidden angles in bright flames and step through flickering cover.',
		prerequisitesText: 'level:4\nability:intelligence:13'
	});

	await getFeatCreateForm(page).getByRole('button', { name: 'Publish shared feat' }).click();

	await expect(page).toHaveURL(/publishedSharedFeat=Lantern%20Savant/);
	await expect(
		page.getByText('Lantern Savant was published to the shared homebrew catalog.')
	).toBeVisible();
	await expect(getManagedFeatCard(page, featName)).toBeVisible();

	await getManagedFeatCard(page, featName).getByRole('link', { name: 'Edit' }).click();
	await expect(page).toHaveURL(/editSharedFeat=shared-feat-e2e-1/);

	const editForm = getSharedFeatEditForm(page);
	const updatedFeatName = 'Lantern Savant Redux';
	await fillFeatDraftForm(editForm, {
		name: updatedFeatName,
		summary: 'Refine lantern geometry into a sharper battlefield sense.',
		description:
			'You trace radiant vectors through the air, exposing weak points and impossible paths.',
		prerequisitesText: 'level:8\nability:intelligence:15\nspellcasting'
	});

	await editForm.getByRole('button', { name: 'Save shared feat changes' }).click();

	await expect(page).toHaveURL(/updatedSharedFeat=Lantern%20Savant%20Redux/);
	await expect(page.getByText('Lantern Savant Redux was updated successfully.')).toBeVisible();

	await getFeatLifecycleControls(page)
		.getByRole('button', { name: 'Retire from shared catalog' })
		.click();

	await expect(page).toHaveURL(/retiredSharedFeat=Lantern%20Savant%20Redux/);
	await expect(
		page.getByText('Lantern Savant Redux was retired from the shared catalog.')
	).toBeVisible();
	await expect(getManagedFeatCard(page, updatedFeatName)).toHaveCount(0);

	await page.context().close();
});

test('admins can publish and permanently delete system-owned feats', async ({ browser }) => {
	const page = await openContentPage(browser, 'admin');

	const featName = 'Solar Bastion';
	await fillFeatDraftForm(getFeatCreateForm(page), {
		name: featName,
		summary: 'Anchor yourself behind a disciplined lattice of sunlight.',
		description:
			'You can set your stance like a radiant fortress, turning momentum into a shield line.',
		prerequisitesText: 'ability:wisdom:13\nproficiency:armor:heavy-armor'
	});

	await getFeatCreateForm(page).getByRole('button', { name: 'Publish system feat' }).click();

	await expect(page).toHaveURL(/publishedSystemFeat=Solar%20Bastion/);
	await expect(page.getByText('Solar Bastion was published as system-owned content.')).toBeVisible();
	await expect(getManagedFeatCard(page, featName)).toBeVisible();
	await expect(getManagedFeatCard(page, featName).getByText('System')).toBeVisible();

	await getManagedFeatCard(page, featName).getByRole('link', { name: 'Edit' }).click();
	await expect(page).toHaveURL(/editSharedFeat=shared-feat-e2e-1/);

	await getFeatLifecycleControls(page).getByRole('button', { name: 'Delete permanently' }).click();

	await expect(page).toHaveURL(/deletedSharedFeat=Solar%20Bastion/);
	await expect(page.getByText('Solar Bastion was deleted from shared content.')).toBeVisible();
	await expect(getManagedFeatCard(page, featName)).toHaveCount(0);

	await page.context().close();
});

test('content editors can publish, update, and retire their shared spells', async ({ browser }) => {
	const page = await openContentPage(browser, 'content_editor');

	const spellName = 'Lantern Step';
	await fillSpellDraftForm(getSpellCreateForm(page), {
		name: spellName,
		level: '2',
		school: 'conjuration',
		castingTime: '1 bonus action',
		range: '30 feet',
		components: 'V, S',
		duration: 'Instantaneous',
		classSlugsText: 'mago\nhechicero',
		summary: 'Blink through a wash of lantern light.',
		description: 'You teleport in a flare of warm light and leave a fading afterimage.',
		concentration: false,
		ritual: false
	});

	await getSpellCreateForm(page).getByRole('button', { name: 'Publish shared spell' }).click();

	await expect(page).toHaveURL(/publishedSharedSpell=Lantern%20Step/);
	await expect(
		page.getByText('Lantern Step was published to the shared homebrew catalog.')
	).toBeVisible();
	await expect(getManagedSpellCard(page, spellName)).toBeVisible();

	await getManagedSpellCard(page, spellName).getByRole('link', { name: 'Edit' }).click();
	await expect(page).toHaveURL(/editSharedSpell=shared-spell-e2e-1/);

	const editForm = getSharedSpellEditForm(page);
	const updatedSpellName = 'Lantern Step Redux';
	await fillSpellDraftForm(editForm, {
		name: updatedSpellName,
		level: '3',
		school: 'evocation',
		castingTime: '1 reaction',
		range: '60 feet',
		components: 'V, S, M',
		materials: 'A brass lantern wick',
		duration: '1 minute',
		classSlugsText: 'mago\nhechicero',
		summary: 'Slip through a brighter wake of lantern light.',
		description: 'You answer danger with a flash-step that leaves searing afterimages behind.',
		concentration: true,
		ritual: false
	});

	await editForm.getByRole('button', { name: 'Save shared spell changes' }).click();

	await expect(page).toHaveURL(/updatedSharedSpell=Lantern%20Step%20Redux/);
	await expect(page.getByText('Lantern Step Redux was updated successfully.')).toBeVisible();

	await getLifecycleControls(page).getByRole('button', { name: 'Retire from shared catalog' }).click();

	await expect(page).toHaveURL(/retiredSharedSpell=Lantern%20Step%20Redux/);
	await expect(
		page.getByText('Lantern Step Redux was retired from the shared catalog.')
	).toBeVisible();
	await expect(getManagedSpellCard(page, updatedSpellName)).toHaveCount(0);

	await page.context().close();
});

test('admins can publish and permanently delete system-owned spells', async ({ browser }) => {
	const page = await openContentPage(browser, 'admin');

	const spellName = 'Solar Lattice';
	await fillSpellDraftForm(getSpellCreateForm(page), {
		name: spellName,
		level: '4',
		school: 'abjuration',
		castingTime: '1 action',
		range: 'Self',
		components: 'V, S, M',
		materials: 'A gold-thread sigil',
		duration: '10 minutes',
		classSlugsText: 'clerigo\npaladin',
		summary: 'Wrap yourself in a radiant defensive lattice.',
		description: 'Bands of sunlit geometry shield you and scorch hostile magic.',
		concentration: true,
		ritual: false
	});

	await getSpellCreateForm(page).getByRole('button', { name: 'Publish system spell' }).click();

	await expect(page).toHaveURL(/publishedSystemSpell=Solar%20Lattice/);
	await expect(page.getByText('Solar Lattice was published as system-owned content.')).toBeVisible();
	await expect(getManagedSpellCard(page, spellName)).toBeVisible();
	await expect(getManagedSpellCard(page, spellName).getByText('System')).toBeVisible();

	await getManagedSpellCard(page, spellName).getByRole('link', { name: 'Edit' }).click();
	await expect(page).toHaveURL(/editSharedSpell=shared-spell-e2e-1/);

	await getLifecycleControls(page).getByRole('button', { name: 'Delete permanently' }).click();

	await expect(page).toHaveURL(/deletedSharedSpell=Solar%20Lattice/);
	await expect(page.getByText('Solar Lattice was deleted from shared content.')).toBeVisible();
	await expect(getManagedSpellCard(page, spellName)).toHaveCount(0);

	await page.context().close();
});

async function openContentPage(browser: Browser, role: 'user' | 'content_editor' | 'admin') {
	const context = await browser.newContext({
		baseURL: 'http://localhost:4173',
		javaScriptEnabled: false
	});
	const page = await context.newPage();

	await page.goto(`/api/test/role?role=${role}`);
	await page.goto('/app/content');
	await expect(page).toHaveURL(/\/app\/content$/);

	return page;
}

function getSpellCreateForm(page: Page): Locator {
	return page.locator('form').filter({ has: page.getByRole('button', { name: 'Create private spell' }) });
}

function getFeatCreateForm(page: Page): Locator {
	return page.locator('form').filter({ has: page.getByRole('button', { name: 'Create private feat' }) });
}

function getSharedFeatEditForm(page: Page): Locator {
	return page.locator('form').filter({ has: page.getByRole('button', { name: 'Save shared feat changes' }) });
}

function getSharedSpellEditForm(page: Page): Locator {
	return page.locator('form').filter({ has: page.getByRole('button', { name: 'Save shared spell changes' }) });
}

function getManagedFeatCard(page: Page, featName: string): Locator {
	return getSharedFeatMaintenanceSection(page)
		.locator('article')
		.filter({ has: page.getByRole('heading', { name: featName }) });
}

function getManagedSpellCard(page: Page, spellName: string): Locator {
	return getSharedSpellMaintenanceSection(page)
		.locator('article')
		.filter({ has: page.getByRole('heading', { name: spellName }) });
}

function getFeatLifecycleControls(page: Page): Locator {
	return getSharedFeatMaintenanceSection(page)
		.locator('div')
		.filter({ has: page.getByText('Lifecycle controls') })
		.filter({ has: page.getByRole('button', { name: 'Retire from shared catalog' }) });
}

function getLifecycleControls(page: Page): Locator {
	return getSharedSpellMaintenanceSection(page)
		.locator('div')
		.filter({ has: page.getByText('Lifecycle controls') })
		.filter({ has: page.getByRole('button', { name: 'Retire from shared catalog' }) });
}

function getSharedFeatMaintenanceSection(page: Page): Locator {
	return page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Review trusted shared entries' }) });
}

function getSharedSpellMaintenanceSection(page: Page): Locator {
	return page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Review trusted shared spells' }) });
}

async function fillFeatDraftForm(
	form: Locator,
	values: {
		name: string;
		summary: string;
		description: string;
		prerequisitesText: string;
	}
) {
	await form.getByLabel('Feat name').fill(values.name);
	await form.getByLabel('Summary').fill(values.summary);
	await form.getByLabel('Description').fill(values.description);
	await form.getByLabel('Prerequisites').fill(values.prerequisitesText);
}

async function fillSpellDraftForm(
	form: Locator,
	values: {
		name: string;
		level: string;
		school: string;
		castingTime: string;
		range: string;
		components: string;
		materials?: string;
		duration: string;
		classSlugsText: string;
		summary: string;
		description: string;
		concentration: boolean;
		ritual: boolean;
	}
) {
	await form.getByLabel('Spell name').fill(values.name);
	await form.getByLabel('Level').fill(values.level);
	await form.locator('select[name="school"]').evaluate((element, school) => {
		const select = element as HTMLSelectElement;
		const selectedSchool = school as string;
		const existingOption = Array.from(select.options).find((option) => option.value === selectedSchool);

		if (!existingOption) {
			const injectedOption = document.createElement('option');
			injectedOption.value = selectedSchool;
			injectedOption.text = selectedSchool;
			select.add(injectedOption);
		}

		select.value = selectedSchool;
		select.dispatchEvent(new Event('input', { bubbles: true }));
		select.dispatchEvent(new Event('change', { bubbles: true }));
	}, values.school);
	await form.getByLabel('Casting time').fill(values.castingTime);
	await form.getByLabel('Range').fill(values.range);
	await form.getByLabel('Components').fill(values.components);
	await form.getByLabel('Materials').fill(values.materials ?? '');
	await form.getByLabel('Duration').fill(values.duration);
	await form.getByLabel('Class slugs').fill(values.classSlugsText);
	await form.getByLabel('Summary').fill(values.summary);
	await form.getByLabel('Description').fill(values.description);

	if (values.concentration) {
		await form.getByLabel('Requires concentration').check();
	} else {
		await form.getByLabel('Requires concentration').uncheck();
	}

	if (values.ritual) {
		await form.getByLabel('Can be cast as a ritual').check();
	} else {
		await form.getByLabel('Can be cast as a ritual').uncheck();
	}
}
