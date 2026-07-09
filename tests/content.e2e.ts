import { expect, test, type Locator, type Page } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
	const response = await request.post('/api/test/reset');
	expect(response.ok()).toBeTruthy();

	await page.context().clearCookies();
});

test('user role keeps privileged content controls hidden', async ({ page }) => {
	await gotoContentPage(page, 'user');

	await expect(page.getByRole('heading', { name: 'Create your own spell draft' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Create private spell' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Publish shared spell' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Publish system spell' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Review trusted shared spells' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Update a managed shared spell' })).toHaveCount(0);
});

test.fixme('content editors can publish, update, and retire their shared spells', async ({
	page
}) => {
	await gotoContentPage(page, 'content_editor');

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

	await submitFormAction(
		page,
		getSpellCreateForm(page),
		'/app/content?/publishSharedSpell&e2eRole=content_editor'
	);

	await expect(page).toHaveURL(/publishedSharedSpell=Lantern%20Step/);
	await expect(
		page.getByText('Lantern Step was published to the shared homebrew catalog.')
	).toBeVisible();

	await submitHiddenPost(page, '/app/content?/retireSharedSpell&e2eRole=content_editor', {
		spellId: 'shared-spell-e2e-1'
	});

	await expect(page).toHaveURL(/retiredSharedSpell=Lantern%20Step/);
	await expect(
		page.getByText('Lantern Step was retired from the shared catalog.')
	).toBeVisible();
});

test.fixme('admins can publish and permanently delete system-owned spells', async ({ page }) => {
	await gotoContentPage(page, 'admin');

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

	await submitFormAction(
		page,
		getSpellCreateForm(page),
		'/app/content?/publishSystemSpell&e2eRole=admin'
	);

	await expect(page).toHaveURL(/publishedSystemSpell=Solar%20Lattice/);
	await expect(page.getByText('Solar Lattice was published as system-owned content.')).toBeVisible();

	await submitHiddenPost(page, '/app/content?/deleteSharedSpell&e2eRole=admin', {
		spellId: 'shared-spell-e2e-1'
	});

	await expect(page).toHaveURL(/deletedSharedSpell=Solar%20Lattice/);
	await expect(page.getByText('Solar Lattice was deleted from shared content.')).toBeVisible();
});

async function gotoContentPage(page: Page, role: 'user' | 'content_editor' | 'admin') {
	await page.goto('/app/content');
	await page.evaluate((selectedRole) => {
		document.cookie = `app-e2e-role=${selectedRole}; path=/`;
	}, role);
	await page.goto('/app/content');
	await expect(page).toHaveURL(/\/app\/content$/);
}

function getSpellCreateForm(page: Page): Locator {
	return page.locator('form').filter({ has: page.getByRole('button', { name: 'Create private spell' }) });
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

async function submitFormAction(page: Page, form: Locator, action: string) {
	await Promise.all([
		page.waitForURL(/\/app\/content\?/),
		form.evaluate((element, targetAction) => {
			const submitButton = document.createElement('button');
			submitButton.type = 'submit';
			submitButton.hidden = true;
			submitButton.setAttribute('formaction', targetAction as string);
			element.appendChild(submitButton);
			submitButton.click();
		}, action)
	]);
}

async function submitHiddenPost(page: Page, action: string, fields: Record<string, string>) {
	await Promise.all([
		page.waitForURL(/\/app\/content\?/),
		page.evaluate(
			({ targetAction, targetFields }) => {
				const form = document.createElement('form');
				form.method = 'POST';
				form.action = targetAction;

				for (const [name, value] of Object.entries(targetFields)) {
					const input = document.createElement('input');
					input.type = 'hidden';
					input.name = name;
					input.value = value;
					form.appendChild(input);
				}

				document.body.appendChild(form);
				form.submit();
			},
			{ targetAction: action, targetFields: fields }
		)
	]);
}
