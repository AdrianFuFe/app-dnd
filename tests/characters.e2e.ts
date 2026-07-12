import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ request }) => {
	const response = await request.post('/api/test/reset');
	expect(response.ok()).toBeTruthy();
});

test('character create route saves a new draft and returns to detail', async ({ page }) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
	await expect(
		page.getByRole('heading', { name: 'Create a structured character draft.' })
	).toBeVisible();
	const manualForm = page.locator('form').last();

	await fillCharacterForm(page, {
		name: 'Brakka Emberforge',
		species: 'Humano',
		subspecies: '',
		className: 'Guerrero',
		subclass: '',
		level: '4',
		background: 'Soldier',
		story: 'A caravan guard learning to lead from the front.',
		strength: '16',
		constitution: '15',
		maxHp: '34',
		currentHp: '28',
		armorClass: '17',
		hitDice: '4d10',
		attackItems: [
			{
				catalogWeaponName: 'Warhammer',
				attackBonus: '+5'
			}
		],
		spellItems: [],
		inventoryItems: [],
		featItems: [],
		noteItems: [
			{
				title: 'Orders',
				content: 'Keeps a marching ledger for the caravan.'
			}
		]
	});
	await manualForm.getByRole('button', { name: 'Create character' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?created=Brakka\+Emberforge$/);
	await expect(page.getByText('Brakka Emberforge was created successfully.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Brakka Emberforge' })).toBeVisible();
	await expect(page.getByText('Humano', { exact: true })).toBeVisible();
	await expect(page.getByText('Guerrero', { exact: true })).toBeVisible();
	await expect(page.getByText('Warhammer', { exact: true })).toBeVisible();
	await expect(page.getByText('Orders', { exact: true })).toBeVisible();
});

test('guided character create route saves a canonical draft with handoff details', async ({
	page
}) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
	const guidedForm = page
		.locator('form')
		.filter({ has: page.getByRole('button', { name: 'Save guided draft' }) });
	await fillGuidedCharacterForm(guidedForm, {
		name: 'Seren Dawnwatch',
		story: 'A novice healer learning to lead with courage.',
		species: 'Humano',
		subspecies: '',
		className: 'Clerigo',
		subclass: 'Life Domain',
		background: 'Acolyte',
		strength: '12',
		dexterity: '10',
		constitution: '14',
		intelligence: '11',
		wisdom: '15',
		charisma: '13',
		languageChoiceGroups: [['Draconico'], ['Comun', 'Gigante']],
		proficiencyChoiceGroups: [['History', 'Insight']],
		equipmentChoiceGroups: [
			['Mace'],
			['Scale Mail'],
			['Light Crossbow and 20 Bolts'],
			["Priest's Pack"],
			['Prayer Book']
		]
	});

	await guidedForm.getByRole('button', { name: 'Save guided draft' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?created=Seren\+Dawnwatch&guided=1$/);
	await expect(page.getByRole('heading', { name: 'Seren Dawnwatch' })).toBeVisible();
	await expect(page.getByText('DnD 2014 SRD', { exact: true })).toBeVisible();
	await expect(page.getByText('canon', { exact: true })).toBeVisible();
	await expect(page.getByText('Clerigo', { exact: true })).toBeVisible();
	await expect(page.getByText('Acolyte', { exact: true })).toBeVisible();
	await expect(page.getByText('Bless', { exact: true })).toBeVisible();
	await expect(page.getByText('Cure Wounds', { exact: true })).toBeVisible();
	await expect(page.getByText('Revivify', { exact: true })).toHaveCount(0);
	await expect(page.getByText('Beacon of Hope', { exact: true })).toHaveCount(0);
	await expect(page.getByText('Death Ward', { exact: true })).toHaveCount(0);
	await expect(page.getByText('Mass Cure Wounds', { exact: true })).toHaveCount(0);
	await expect(page.getByText('Guided build grants', { exact: true })).toBeVisible();
	await expect(page.getByText('Guided build choices', { exact: true })).toBeVisible();
	await expect(page.getByText('Mace', { exact: true })).toBeVisible();
	await expect(page.getByText('Light Crossbow and 20 Bolts', { exact: true })).toBeVisible();
	await expect(page.getByText('Custom path reasons')).toHaveCount(0);
	await page.getByRole('link', { name: 'Edit character' }).click();
	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\/edit\?guided=1$/);
	await expect(page.getByText('Guided-to-custom handoff', { exact: true })).toBeVisible();
});

test('guided character edit can intentionally diverge into a custom draft', async ({ page }) => {
	await page.goto('/app/characters/new');

	const guidedForm = page
		.locator('form')
		.filter({ has: page.getByRole('button', { name: 'Save guided draft' }) });
	await fillGuidedCharacterForm(guidedForm, {
		name: 'Seren Dawnwatch',
		story: 'A novice healer learning to lead with courage.',
		species: 'Humano',
		subspecies: '',
		className: 'Clerigo',
		subclass: 'Life Domain',
		background: 'Acolyte',
		strength: '12',
		dexterity: '10',
		constitution: '14',
		intelligence: '11',
		wisdom: '15',
		charisma: '13',
		languageChoiceGroups: [['Draconico'], ['Comun', 'Gigante']],
		proficiencyChoiceGroups: [['History', 'Insight']],
		equipmentChoiceGroups: [
			['Mace'],
			['Scale Mail'],
			['Light Crossbow and 20 Bolts'],
			["Priest's Pack"],
			['Prayer Book']
		]
	});

	await guidedForm.getByRole('button', { name: 'Save guided draft' }).click();
	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?created=Seren\+Dawnwatch&guided=1$/);

	await page.getByRole('link', { name: 'Edit character' }).click();
	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\/edit\?guided=1$/);
	await fillCharacterForm(page, {
		name: 'Seren Dawnwatch',
		story: 'A novice healer learning to lead with courage.',
		species: 'Humano',
		subspecies: '',
		className: 'Clerigo',
		subclass: 'Life Domain',
		background: 'Acolyte',
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
		attackItems: [
			{
				catalogWeaponName: 'Mace',
				attackBonus: '+3'
			},
			{
				catalogWeaponName: 'Light Crossbow and 20 Bolts',
				attackBonus: '+2'
			}
		],
		spellItems: [
			{
				catalogSpellName: 'Bless',
				level: '1',
				isPrepared: true
			},
			{
				catalogSpellName: 'Cure Wounds',
				level: '1',
				isPrepared: true
			}
		],
		featItems: [],
		inventoryItems: []
	});

	await page.getByRole('button', { name: 'Save changes' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?updated=Seren\+Dawnwatch$/);
	await expect(page.getByText('custom', { exact: true })).toBeVisible();
	await expect(
		page
			.locator('article')
			.filter({ has: page.getByRole('heading', { name: 'Combat Snapshot' }) })
			.getByText('11', { exact: true })
	).toBeVisible();
	await expect(page.getByText('Guided build grants', { exact: true })).toBeVisible();
	await expect(page.getByText('Guided build choices', { exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Edit character' })).toHaveAttribute(
		'href',
		/\/app\/characters\/[^/]+\/edit\?guided=1$/
	);
});

test('guided character create route keeps the user on the form when required guided choices are missing', async ({
	page
}) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
	const guidedForm = page
		.locator('form')
		.filter({ has: page.getByRole('button', { name: 'Save guided draft' }) });
	await fillGuidedCharacterForm(guidedForm, {
		name: 'Seren Dawnwatch',
		story: 'A novice healer learning to lead with courage.',
		species: 'Humano',
		subspecies: '',
		className: 'Clerigo',
		subclass: 'Life Domain',
		background: 'Acolyte',
		strength: '12',
		dexterity: '10',
		constitution: '14',
		intelligence: '11',
		wisdom: '15',
		charisma: '13',
		languageChoiceGroups: [['Draconico'], []],
		proficiencyChoiceGroups: [['History', 'Insight']],
		equipmentChoiceGroups: [
			['Mace'],
			['Scale Mail'],
			['Light Crossbow and 20 Bolts'],
			["Priest's Pack"],
			['Prayer Book']
		]
	});

	await guidedForm.getByRole('button', { name: 'Save guided draft' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/new\?\/guided$/);
	await expect(
		guidedForm.getByText('Please complete every required language choice.', { exact: true })
	).toBeVisible();
	await expect(guidedForm.getByRole('heading', { name: 'Guided choices' })).toBeVisible();
	await expect(
		guidedForm.locator('[data-testid="guided-language-choice-language:0"]')
	).toContainText('1/1 chosen');
	await expect(
		guidedForm.locator('[data-testid="guided-language-choice-language:1"]')
	).toContainText('0/2 chosen');
	await expect(guidedForm.locator('input[name="name"]')).toHaveValue('Seren Dawnwatch');
});

test('guided character create route shows a guided error when the submitted choice payload is invalid', async ({
	page
}) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
	const guidedForm = page
		.locator('form')
		.filter({ has: page.getByRole('button', { name: 'Save guided draft' }) });
	await fillGuidedCharacterForm(guidedForm, {
		name: 'Seren Dawnwatch',
		story: 'A novice healer learning to lead with courage.',
		species: 'Humano',
		subspecies: '',
		className: 'Clerigo',
		subclass: 'Life Domain',
		background: 'Acolyte',
		strength: '12',
		dexterity: '10',
		constitution: '14',
		intelligence: '11',
		wisdom: '15',
		charisma: '13',
		languageChoiceGroups: [['Draconico'], ['Comun', 'Gigante']],
		proficiencyChoiceGroups: [['History', 'Insight']],
		equipmentChoiceGroups: [
			['Mace'],
			['Scale Mail'],
			['Light Crossbow and 20 Bolts'],
			["Priest's Pack"],
			['Prayer Book']
		]
	});

	await guidedForm.locator('input[name="equipmentChoices"]').evaluate((element) => {
		(element as HTMLInputElement).value = JSON.stringify([
			{ key: 'equipment:0', value: 'mace' },
			{ key: 'equipment:1', value: 'scale-mail' },
			{ key: 'equipment:2', value: 'light-crossbow-and-20-bolts' },
			{ key: 'equipment:3', value: 'warhammer' },
			{ key: 'equipment:4', value: 'prayer-book' }
		]);
	});

	await guidedForm.getByRole('button', { name: 'Save guided draft' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/new\?\/guided$/);
	await expect(
		guidedForm.getByText('Please choose only valid options for each equipment choice.', {
			exact: true
		})
	).toBeVisible();
	await expect(guidedForm.locator('input[name="name"]')).toHaveValue('Seren Dawnwatch');
	await expect(
		guidedForm.locator('[data-testid="guided-equipment-choice-equipment:0"]')
	).toContainText('1/1 chosen');
	await expect(
		guidedForm.locator('[data-testid="guided-equipment-choice-equipment:3"]')
	).toContainText('0/1 chosen');
	await expect(
		guidedForm.locator('[data-testid="guided-invalid-choice-equipment:3"]')
	).toContainText('Remove Warhammer');

	await guidedForm
		.locator('[data-testid="guided-equipment-choice-equipment:3"]')
		.getByRole('button', { name: "Priest's Pack", exact: true })
		.click();
	await guidedForm.getByRole('button', { name: 'Save guided draft' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?created=Seren\+Dawnwatch&guided=1$/);
	await expect(page.getByRole('heading', { name: 'Seren Dawnwatch' })).toBeVisible();
});

test('guided character create route recovers from an invalid submitted language choice payload', async ({
	page
}) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
	const guidedForm = page
		.locator('form')
		.filter({ has: page.getByRole('button', { name: 'Save guided draft' }) });
	await fillGuidedCharacterForm(guidedForm, {
		name: 'Seren Dawnwatch',
		story: 'A novice healer learning to lead with courage.',
		species: 'Humano',
		subspecies: '',
		className: 'Clerigo',
		subclass: 'Life Domain',
		background: 'Acolyte',
		strength: '12',
		dexterity: '10',
		constitution: '14',
		intelligence: '11',
		wisdom: '15',
		charisma: '13',
		languageChoiceGroups: [['Draconico'], ['Comun', 'Gigante']],
		proficiencyChoiceGroups: [['History', 'Insight']],
		equipmentChoiceGroups: [
			['Mace'],
			['Scale Mail'],
			['Light Crossbow and 20 Bolts'],
			["Priest's Pack"],
			['Prayer Book']
		]
	});

	await guidedForm.locator('input[name="languageChoices"]').evaluate((element) => {
		(element as HTMLInputElement).value = JSON.stringify([
			{ key: 'language:0', value: 'draconico' },
			{ key: 'language:1', value: 'comun' },
			{ key: 'language:1', value: 'abyssal' }
		]);
	});

	await guidedForm.getByRole('button', { name: 'Save guided draft' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/new\?\/guided$/);
	await expect(
		guidedForm.getByText('Please choose only valid options for each language choice.', {
			exact: true
		})
	).toBeVisible();
	await expect(
		guidedForm.locator('[data-testid="guided-language-choice-language:1"]')
	).toContainText('1/2 chosen');
	await expect(
		guidedForm.locator('[data-testid="guided-invalid-choice-language:1"]')
	).toContainText('Remove Abyssal');

	await guidedForm
		.locator('[data-testid="guided-language-choice-language:1"]')
		.getByRole('button', { name: 'Gigante', exact: true })
		.click();
	await guidedForm.getByRole('button', { name: 'Save guided draft' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?created=Seren\+Dawnwatch&guided=1$/);
	await expect(page.getByRole('heading', { name: 'Seren Dawnwatch' })).toBeVisible();
});

test('guided character create route recovers from an invalid submitted proficiency choice payload', async ({
	page
}) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
	const guidedForm = page
		.locator('form')
		.filter({ has: page.getByRole('button', { name: 'Save guided draft' }) });
	await fillGuidedCharacterForm(guidedForm, {
		name: 'Seren Dawnwatch',
		story: 'A novice healer learning to lead with courage.',
		species: 'Humano',
		subspecies: '',
		className: 'Clerigo',
		subclass: 'Life Domain',
		background: 'Acolyte',
		strength: '12',
		dexterity: '10',
		constitution: '14',
		intelligence: '11',
		wisdom: '15',
		charisma: '13',
		languageChoiceGroups: [['Draconico'], ['Comun', 'Gigante']],
		proficiencyChoiceGroups: [['History', 'Insight']],
		equipmentChoiceGroups: [
			['Mace'],
			['Scale Mail'],
			['Light Crossbow and 20 Bolts'],
			["Priest's Pack"],
			['Prayer Book']
		]
	});

	await guidedForm.locator('input[name="proficiencyChoices"]').evaluate((element) => {
		(element as HTMLInputElement).value = JSON.stringify([
			{ key: 'skill:0', value: 'history' },
			{ key: 'skill:0', value: 'athletics' }
		]);
	});

	await guidedForm.getByRole('button', { name: 'Save guided draft' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/new\?\/guided$/);
	await expect(
		guidedForm.getByText('Please choose only valid options for each skill proficiency choice.', {
			exact: true
		})
	).toBeVisible();
	await expect(guidedForm.locator('[data-testid="guided-skill-choice-skill:0"]')).toContainText(
		'1/2 chosen'
	);
	await expect(guidedForm.locator('[data-testid="guided-invalid-choice-skill:0"]')).toContainText(
		'Remove Athletics'
	);

	await guidedForm
		.locator('[data-testid="guided-skill-choice-skill:0"]')
		.getByRole('button', { name: 'Insight', exact: true })
		.click();
	await guidedForm.getByRole('button', { name: 'Save guided draft' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?created=Seren\+Dawnwatch&guided=1$/);
	await expect(page.getByRole('heading', { name: 'Seren Dawnwatch' })).toBeVisible();
});

test('character edit route updates an existing draft and returns to detail', async ({ page }) => {
	await page.goto('/app/characters/char-e2e-1/edit');

	await expect(page).toHaveURL('/app/characters/char-e2e-1/edit');
	await expect(page.getByRole('heading', { name: 'Talia Stormstep' })).toBeVisible();

	await fillCharacterForm(page, {
		name: 'Talia Dawnweaver',
		className: 'Mago',
		subclass: 'School of Evocation',
		background: 'Soldier',
		species: 'Elfo',
		subspecies: 'High Elf',
		story: 'Now follows a radiant omen across the coast.',
		intelligence: '14',
		wisdom: '16',
		currentHp: '20',
		attackItems: [
			{
				catalogWeaponName: 'Warhammer',
				attackBonus: '+5'
			}
		],
		spellItems: [
			{
				catalogSpellName: 'Detect Magic',
				level: '1',
				isPrepared: true
			}
		],
		inventoryItems: [],
		featItems: [
			{
				catalogFeatName: 'Observant'
			}
		]
	});

	await page.getByRole('button', { name: 'Save changes' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/char-e2e-1\?updated=Talia\+Dawnweaver$/);
	await expect(page.getByText('Talia Dawnweaver was updated successfully.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Talia Dawnweaver' })).toBeVisible();
	await expect(page.getByText('Mago', { exact: true })).toBeVisible();
	await expect(page.getByText('Soldier', { exact: true })).toBeVisible();
	await expect(page.getByText('Warhammer', { exact: true })).toBeVisible();
	await expect(page.getByText('Catalog weapon', { exact: true })).toBeVisible();
	await expect(page.getByText('versatile (1d10)', { exact: true })).toBeVisible();
	await expect(page.getByText('+5 | 1d8 bludgeoning | Melee', { exact: true })).toBeVisible();
	await expect(
		page.getByText('A martial melee weapon with crushing force.', { exact: true })
	).toBeVisible();
	await expect(page.getByText('Detect Magic', { exact: true })).toBeVisible();
	await expect(page.getByText('Observant', { exact: true })).toBeVisible();
	await expect(page.getByText('Research', { exact: true })).toBeVisible();
	await expect(page.getByText('Tracks ley lines.', { exact: true })).toBeVisible();
});

test('manual custom draft persists content-profile reasons through detail and edit round trips', async ({
	page
}) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
	const manualForm = page.locator('form').last();
	await fillCharacterForm(page, {
		name: 'Ilya Starling',
		species: 'Humano',
		subspecies: '',
		className: 'Guerrero',
		subclass: '',
		background: 'Soldier',
		story: 'A field scout with a self-taught fighting style.',
		strength: '14',
		dexterity: '13',
		constitution: '12',
		intelligence: '10',
		wisdom: '11',
		charisma: '9',
		maxHp: '12',
		currentHp: '12',
		temporaryHp: '0',
		armorClass: '15',
		initiative: '1',
		speed: '30',
		hitDice: '1d10',
		attackItems: [
			{
				name: 'Custom Strike',
				attackBonus: '+4',
				damage: '1d8',
				damageType: 'force',
				range: 'Melee'
			}
		],
		spellItems: [],
		featItems: [],
		inventoryItems: [],
		noteItems: []
	});
	await manualForm.getByRole('button', { name: 'Create character' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?created=Ilya\+Starling$/);
	await expect(page.getByText('Ilya Starling was created successfully.')).toBeVisible();
	await expect(page.getByText('custom', { exact: true })).toBeVisible();
	await expect(page.getByText('Custom path reasons')).toBeVisible();
	await expect(page.getByText('Manual override: Attack Items', { exact: true })).toBeVisible();

	await page.getByRole('link', { name: 'Edit character' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\/edit$/);
	await page.getByRole('button', { name: 'Save changes' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?updated=Ilya\+Starling$/);
	await expect(page.getByText('Ilya Starling was updated successfully.')).toBeVisible();
	await expect(page.getByText('Custom path reasons')).toBeVisible();
	await expect(page.getByText('Manual override: Attack Items', { exact: true })).toBeVisible();
});

test('character create route filters dependent subspecies and subclass options from catalog selections', async ({
	page
}) => {
	await page.goto('/app/characters/new');

	const manualForm = page.locator('form').last();
	const speciesSelect = manualForm.locator('select[name="speciesId"]');
	const subspeciesSelect = manualForm.locator('select[name="subspeciesId"]');
	const classSelect = manualForm.locator('select[name="classId"]');
	const subclassSelect = manualForm.locator('select[name="subclassId"]');

	await expect(getSelectOptions(subspeciesSelect)).resolves.toEqual(['Select a subspecies']);
	await expect(getSelectOptions(subclassSelect)).resolves.toEqual(['Select a subclass']);

	await speciesSelect.selectOption({ label: 'Elfo' });
	await expect(getSelectOptions(subspeciesSelect)).resolves.toEqual([
		'Select a subspecies',
		'High Elf',
		'Wood Elf'
	]);

	await subspeciesSelect.selectOption({ label: 'Wood Elf' });
	await expect(subspeciesSelect).toHaveValue(await getOptionValue(subspeciesSelect, 'Wood Elf'));

	await speciesSelect.selectOption({ label: 'Humano' });
	await expect(subspeciesSelect).toHaveValue('');
	await expect(getSelectOptions(subspeciesSelect)).resolves.toEqual(['Select a subspecies']);

	await classSelect.selectOption({ label: 'Clerigo' });
	await expect(getSelectOptions(subclassSelect)).resolves.toEqual([
		'Select a subclass',
		'Life Domain',
		'Knowledge Domain'
	]);

	await subclassSelect.selectOption({ label: 'Knowledge Domain' });
	await expect(subclassSelect).toHaveValue(
		await getOptionValue(subclassSelect, 'Knowledge Domain')
	);

	await classSelect.selectOption({ label: 'Guerrero' });
	await expect(subclassSelect).toHaveValue('');
	await expect(getSelectOptions(subclassSelect)).resolves.toEqual([
		'Select a subclass',
		'Champion'
	]);
});

test('character edit route resets dependent selections and saves newly expanded catalog entries', async ({
	page
}) => {
	await page.goto('/app/characters/char-e2e-1/edit');

	const speciesSelect = page.locator('select[name="speciesId"]');
	const subspeciesSelect = page.locator('select[name="subspeciesId"]');
	const classSelect = page.locator('select[name="classId"]');
	const subclassSelect = page.locator('select[name="subclassId"]');

	await speciesSelect.selectOption({ label: 'Elfo' });
	await subspeciesSelect.selectOption({ label: 'High Elf' });
	await classSelect.selectOption({ label: 'Mago' });
	await subclassSelect.selectOption({ label: 'School of Evocation' });

	await speciesSelect.selectOption({ label: 'Humano' });
	await expect(subspeciesSelect).toHaveValue('');
	await expect(getSelectOptions(subspeciesSelect)).resolves.toEqual(['Select a subspecies']);

	await speciesSelect.selectOption({ label: 'Elfo' });
	await expect(getSelectOptions(subspeciesSelect)).resolves.toEqual([
		'Select a subspecies',
		'High Elf',
		'Wood Elf'
	]);
	await subspeciesSelect.selectOption({ label: 'Wood Elf' });

	await classSelect.selectOption({ label: 'Guerrero' });
	await expect(subclassSelect).toHaveValue('');
	await expect(getSelectOptions(subclassSelect)).resolves.toEqual([
		'Select a subclass',
		'Champion'
	]);
	await subclassSelect.selectOption({ label: 'Champion' });

	const spellSection = page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Spells' }) });
	await spellSection.getByRole('button', { name: 'Remove' }).click();

	await page.getByRole('button', { name: 'Save changes' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/char-e2e-1\?updated=Talia\+Stormstep$/);
	await expect(page.getByText('Talia Stormstep was updated successfully.')).toBeVisible();
	await expect(page.getByText('Elfo', { exact: true })).toBeVisible();
	await expect(page.getByText('Wood Elf', { exact: true })).toBeVisible();
	await expect(page.getByText('Guerrero', { exact: true })).toBeVisible();
	await expect(page.getByText('Champion', { exact: true })).toBeVisible();
});

test('character detail route shows enriched catalog-linked attacks and inventory', async ({
	page
}) => {
	await page.goto('/app/characters/char-e2e-1');

	await expect(page).toHaveURL('/app/characters/char-e2e-1');
	await expect(page.getByRole('heading', { name: 'Talia Stormstep' })).toBeVisible();
	await expect(page.getByText('Quarterstaff', { exact: true })).toBeVisible();
	await expect(page.getByText('Catalog weapon', { exact: true })).toBeVisible();
	await expect(page.getByText('versatile (1d8)', { exact: true })).toBeVisible();
	await expect(page.getByText('+4 | 1d6 bludgeoning | Melee', { exact: true })).toBeVisible();
	await expect(page.getByText('Spellbook', { exact: true })).toBeVisible();
	await expect(page.getByText('Catalog item', { exact: true })).toBeVisible();
	await expect(page.getByText('book', { exact: true })).toBeVisible();
	await expect(page.getByText('Research', { exact: true })).toBeVisible();
	await expect(page.getByText('Tracks ley lines.', { exact: true })).toBeVisible();
});

test('character detail route supports deleting a draft', async ({ page }) => {
	await page.goto('/app/characters');

	await expect(page).toHaveURL('/app/characters');
	await expect(
		page.getByRole('heading', { name: 'Character management starts here.' })
	).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Talia Stormstep' })).toBeVisible();

	await page.getByRole('link', { name: 'View details' }).click();

	await expect(page).toHaveURL('/app/characters/char-e2e-1');
	await expect(page.getByRole('heading', { name: 'Talia Stormstep' })).toBeVisible();
	await expect(page.getByText('Character detail')).toBeVisible();

	const deleteButton = page.getByRole('button', { name: 'Delete character' });
	await expect(deleteButton).toBeDisabled();
	await page.getByLabel('Type the character name to confirm').fill('Talia Stormstep');
	await page.getByLabel('I understand this deletes the draft permanently').check();

	await expect(deleteButton).toBeEnabled();
	await deleteButton.click();

	await expect(page).toHaveURL('/app/characters?deleted=Talia%20Stormstep');
	await expect(page.getByText('Talia Stormstep was deleted successfully.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'No characters yet' })).toBeVisible();
});

async function fillCharacterForm(
	page: Page,
	overrides: Partial<{
		name: string;
		species: string;
		subspecies: string;
		className: string;
		subclass: string;
		level: string;
		background: string;
		story: string;
		strength: string;
		dexterity: string;
		constitution: string;
		intelligence: string;
		wisdom: string;
		charisma: string;
		maxHp: string;
		currentHp: string;
		temporaryHp: string;
		armorClass: string;
		initiative: string;
		speed: string;
		hitDice: string;
		attackItems: Array<{
			catalogWeaponName?: string;
			name?: string;
			attackBonus?: string;
			damage?: string;
			damageType?: string;
			range?: string;
			description?: string;
		}>;
		spellItems: Array<{
			catalogSpellName?: string;
			name?: string;
			level?: string;
			school?: string;
			castingTime?: string;
			range?: string;
			components?: string;
			duration?: string;
			description?: string;
			isPrepared?: boolean;
		}>;
		featItems: Array<{
			catalogFeatName?: string;
			name?: string;
			description?: string;
		}>;
		inventoryItems: Array<{
			catalogItemName?: string;
			name?: string;
			quantity?: string;
			description?: string;
			weight?: string;
			value?: string;
			isEquipped?: boolean;
		}>;
		noteItems: Array<{
			title?: string;
			content?: string;
		}>;
	}> = {}
) {
	const form = page.locator('form').last();
	const shouldSyncNoteItems = 'noteItems' in overrides;
	const values = {
		name: 'Talia Stormstep',
		species: 'Elfo',
		subspecies: 'High Elf',
		className: 'Mago',
		subclass: 'School of Evocation',
		level: '3',
		background: 'Acolyte',
		story: 'Archivist turned explorer.',
		strength: '8',
		dexterity: '14',
		constitution: '13',
		intelligence: '16',
		wisdom: '12',
		charisma: '10',
		maxHp: '20',
		currentHp: '18',
		temporaryHp: '0',
		armorClass: '13',
		initiative: '2',
		speed: '30',
		hitDice: '3d6',
		attackItems: [
			{
				catalogWeaponName: 'Quarterstaff',
				attackBonus: '+4'
			}
		],
		spellItems: [
			{
				name: 'Magic Missile',
				level: '1',
				school: 'Evocation',
				castingTime: '1 action',
				range: '120 ft.',
				duration: 'Instantaneous',
				isPrepared: true
			}
		],
		inventoryItems: [
			{
				catalogItemName: 'Spellbook',
				quantity: '1'
			}
		],
		featItems: [],
		noteItems: [],
		...overrides
	};

	await form.locator('input[name="name"]').fill(values.name);
	const speciesSelect = form.locator('select[name="speciesId"]');
	const subspeciesSelect = form.locator('select[name="subspeciesId"]');
	const classSelect = form.locator('select[name="classId"]');
	const subclassSelect = form.locator('select[name="subclassId"]');

	await speciesSelect.selectOption({ label: values.species });
	await selectDependentOption(subspeciesSelect, values.subspecies);
	await classSelect.selectOption({ label: values.className });
	await selectDependentOption(subclassSelect, values.subclass);
	await form.locator('input[name="level"]').fill(values.level);
	await form.locator('select[name="backgroundId"]').selectOption({ label: values.background });
	await form.locator('textarea[name="story"]').fill(values.story);
	await form.locator('input[name="strength"]').fill(values.strength);
	await form.locator('input[name="dexterity"]').fill(values.dexterity);
	await form.locator('input[name="constitution"]').fill(values.constitution);
	await form.locator('input[name="intelligence"]').fill(values.intelligence);
	await form.locator('input[name="wisdom"]').fill(values.wisdom);
	await form.locator('input[name="charisma"]').fill(values.charisma);
	await form.locator('input[name="maxHp"]').fill(values.maxHp);
	await form.locator('input[name="currentHp"]').fill(values.currentHp);
	await form.locator('input[name="temporaryHp"]').fill(values.temporaryHp);
	await form.locator('input[name="armorClass"]').fill(values.armorClass);
	await form.locator('input[name="initiative"]').fill(values.initiative);
	await form.locator('input[name="speed"]').fill(values.speed);
	await form.locator('input[name="hitDice"]').fill(values.hitDice);
	const attackSection = form
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Attacks' }) });
	const spellSection = form
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Spells' }) });
	const inventorySection = form
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Inventory' }) });
	const featSection = form
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Feats' }) });
	const notesSection = form
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Notes' }) });

	let currentAttackItemCount = await attackSection.getByLabel('Attack name').count();

	while (currentAttackItemCount > values.attackItems.length) {
		await attackSection.getByRole('button', { name: 'Remove' }).first().click();
		currentAttackItemCount -= 1;
	}

	while (currentAttackItemCount < values.attackItems.length) {
		await attackSection.getByRole('button', { name: 'Add attack' }).click();
		currentAttackItemCount += 1;
	}

	for (let index = 0; index < values.attackItems.length; index += 1) {
		const item = values.attackItems[index];
		if (item.catalogWeaponName) {
			await attackSection.getByLabel('Catalog weapon').nth(index).selectOption({
				label: item.catalogWeaponName
			});
		}
		if (item.name !== undefined) {
			await attackSection.getByLabel('Attack name').nth(index).fill(item.name);
		}
		await attackSection
			.getByLabel('Attack bonus')
			.nth(index)
			.fill(item.attackBonus ?? '');
		if (item.damage !== undefined) {
			await attackSection.getByLabel('Damage').nth(index).fill(item.damage);
		}
		if (item.damageType !== undefined) {
			await attackSection.getByLabel('Damage type').nth(index).fill(item.damageType);
		}
		if (item.range !== undefined) {
			await attackSection.getByLabel('Range').nth(index).fill(item.range);
		}
		if (item.description !== undefined) {
			await attackSection.getByLabel('Description').nth(index).fill(item.description);
		}
	}

	let currentSpellItemCount = await spellSection.getByLabel('Spell name').count();

	while (currentSpellItemCount > values.spellItems.length) {
		await spellSection.getByRole('button', { name: 'Remove' }).first().click();
		currentSpellItemCount -= 1;
	}

	while (currentSpellItemCount < values.spellItems.length) {
		await spellSection.getByRole('button', { name: 'Add spell' }).click();
		currentSpellItemCount += 1;
	}

	for (let index = 0; index < values.spellItems.length; index += 1) {
		const item = values.spellItems[index];
		if (item.catalogSpellName) {
			await spellSection
				.getByLabel('Catalog spell')
				.nth(index)
				.selectOption({
					label:
						item.level === '0'
							? `${item.catalogSpellName} (Cantrip)`
							: `${item.catalogSpellName} (Level ${item.level ?? '1'})`
				});
		}
		if (item.name !== undefined) {
			await spellSection.getByLabel('Spell name').nth(index).fill(item.name);
		}
		if (item.level !== undefined) {
			await spellSection.getByLabel('Spell level').nth(index).fill(item.level);
		}
		if (item.school !== undefined) {
			await spellSection.getByLabel('School').nth(index).fill(item.school);
		}
		if (item.castingTime !== undefined) {
			await spellSection.getByLabel('Casting time').nth(index).fill(item.castingTime);
		}
		if (item.range !== undefined) {
			await spellSection.getByLabel('Range').nth(index).fill(item.range);
		}
		if (item.duration !== undefined) {
			await spellSection.getByLabel('Duration').nth(index).fill(item.duration);
		}
		if (item.components !== undefined) {
			await spellSection.getByLabel('Components').nth(index).fill(item.components);
		}
		if (item.description !== undefined) {
			await spellSection.getByLabel('Description').nth(index).fill(item.description);
		}

		if (item.isPrepared) {
			await spellSection.getByLabel('Prepared').nth(index).check();
		} else {
			await spellSection.getByLabel('Prepared').nth(index).uncheck();
		}
	}

	let currentFeatItemCount = await featSection.getByLabel('Feat name').count();

	while (currentFeatItemCount > values.featItems.length) {
		await featSection.getByRole('button', { name: 'Remove' }).first().click();
		currentFeatItemCount -= 1;
	}

	while (currentFeatItemCount < values.featItems.length) {
		await featSection.getByRole('button', { name: 'Add feat' }).click();
		currentFeatItemCount += 1;
	}

	for (let index = 0; index < values.featItems.length; index += 1) {
		const item = values.featItems[index];
		if (item.catalogFeatName) {
			await featSection.getByLabel('Catalog feat').nth(index).selectOption({
				label: item.catalogFeatName
			});
		}
		if (item.name !== undefined) {
			await featSection.getByLabel('Feat name').nth(index).fill(item.name);
		}
		if (item.description !== undefined) {
			await featSection.getByLabel('Description').nth(index).fill(item.description);
		}
	}

	let currentInventoryItemCount = await inventorySection.getByLabel('Item name').count();

	while (currentInventoryItemCount > values.inventoryItems.length) {
		await inventorySection.getByRole('button', { name: 'Remove' }).first().click();
		currentInventoryItemCount -= 1;
	}

	while (currentInventoryItemCount < values.inventoryItems.length) {
		await inventorySection.getByRole('button', { name: 'Add inventory item' }).click();
		currentInventoryItemCount += 1;
	}

	for (let index = 0; index < values.inventoryItems.length; index += 1) {
		const item = values.inventoryItems[index];
		if (item.catalogItemName) {
			await inventorySection.getByLabel('Catalog item').nth(index).selectOption({
				label: item.catalogItemName
			});
		}
		if (item.description !== undefined) {
			await inventorySection.getByLabel('Description').nth(index).fill(item.description);
		}

		if (item.isEquipped) {
			await inventorySection.getByLabel('Currently equipped').nth(index).check();
		} else {
			await inventorySection.getByLabel('Currently equipped').nth(index).uncheck();
		}

		if (item.name !== undefined) {
			await inventorySection.getByLabel('Item name').nth(index).fill(item.name);
		}
		await inventorySection
			.getByLabel('Quantity')
			.nth(index)
			.fill(item.quantity ?? '1');
		if (item.value !== undefined) {
			await inventorySection.getByLabel('Value').nth(index).fill(item.value);
		}
		if (item.weight !== undefined) {
			await inventorySection.getByLabel('Weight').nth(index).fill(item.weight);
		}
	}

	if (shouldSyncNoteItems) {
		let currentNoteItemCount = await notesSection.getByLabel('Section title').count();

		while (currentNoteItemCount > values.noteItems.length) {
			await notesSection.getByRole('button', { name: 'Remove' }).first().click();
			currentNoteItemCount -= 1;
		}

		while (currentNoteItemCount < values.noteItems.length) {
			await notesSection.getByRole('button', { name: 'Add note section' }).click();
			currentNoteItemCount += 1;
		}

		for (let index = 0; index < values.noteItems.length; index += 1) {
			const item = values.noteItems[index];
			if (item.title !== undefined) {
				await notesSection.getByLabel('Section title').nth(index).fill(item.title);
			}
			if (item.content !== undefined) {
				await notesSection.getByLabel('Details').nth(index).fill(item.content);
			}
		}
	}
}

async function fillGuidedCharacterForm(
	form: ReturnType<Page['locator']>,
	values: {
		name: string;
		story: string;
		species: string;
		subspecies: string;
		className: string;
		subclass: string;
		background: string;
		strength: string;
		dexterity: string;
		constitution: string;
		intelligence: string;
		wisdom: string;
		charisma: string;
		languageChoiceGroups: string[][];
		proficiencyChoiceGroups: string[][];
		equipmentChoiceGroups: string[][];
	}
) {
	await form.locator('input[name="name"]').fill(values.name);
	await form.locator('textarea[name="story"]').fill(values.story);
	await form.locator('select[name="speciesId"]').selectOption({ label: values.species });
	await selectDependentOption(form.locator('select[name="subspeciesId"]'), values.subspecies);
	await form.locator('select[name="classId"]').selectOption({ label: values.className });
	await selectDependentOption(form.locator('select[name="subclassId"]'), values.subclass);
	await form.locator('select[name="backgroundId"]').selectOption({ label: values.background });
	await form.locator('input[name="strength"]').fill(values.strength);
	await form.locator('input[name="dexterity"]').fill(values.dexterity);
	await form.locator('input[name="constitution"]').fill(values.constitution);
	await form.locator('input[name="intelligence"]').fill(values.intelligence);
	await form.locator('input[name="wisdom"]').fill(values.wisdom);
	await form.locator('input[name="charisma"]').fill(values.charisma);

	await fillGuidedChoiceGroupButtons(form, 'language', values.languageChoiceGroups);
	await fillGuidedChoiceGroupButtons(form, 'skill', values.proficiencyChoiceGroups);
	await fillGuidedChoiceGroupButtons(form, 'equipment', values.equipmentChoiceGroups);
}

async function fillGuidedChoiceGroupButtons(
	form: ReturnType<Page['locator']>,
	groupType: 'language' | 'skill' | 'equipment',
	choiceGroups: string[][]
) {
	if (choiceGroups.length === 0) {
		return;
	}

	const guidedChoicesSection = form.locator('[data-testid="guided-choices-section"]');
	await expect(guidedChoicesSection).toBeVisible();

	for (let groupIndex = 0; groupIndex < choiceGroups.length; groupIndex += 1) {
		const choiceCard = guidedChoicesSection.locator(
			`[data-testid="${buildGuidedChoiceCardTestId(groupType, groupIndex)}"]`
		);

		await expect(choiceCard).toBeVisible();

		for (const optionName of choiceGroups[groupIndex] ?? []) {
			await choiceCard
				.locator(
					`[data-testid="${buildGuidedChoiceOptionTestId(groupType, groupIndex, optionName)}"]`
				)
				.click();
		}
	}
}

function buildGuidedChoiceCardTestId(
	groupType: 'language' | 'skill' | 'equipment',
	groupIndex: number
) {
	if (groupType === 'language') {
		return `guided-language-choice-language:${groupIndex}`;
	}

	if (groupType === 'skill') {
		return `guided-skill-choice-skill:${groupIndex}`;
	}

	return `guided-equipment-choice-equipment:${groupIndex}`;
}

function buildGuidedChoiceOptionTestId(
	groupType: 'language' | 'skill' | 'equipment',
	groupIndex: number,
	optionName: string
) {
	return `guided-choice-option-${buildGuidedChoiceKey(groupType, groupIndex)}-${toGuidedOptionSlug(optionName)}`;
}

function buildGuidedChoiceKey(
	groupType: 'language' | 'skill' | 'equipment',
	groupIndex: number
) {
	if (groupType === 'language') {
		return `language:${groupIndex}`;
	}

	if (groupType === 'skill') {
		return `skill:${groupIndex}`;
	}

	return `equipment:${groupIndex}`;
}

function toGuidedOptionSlug(optionName: string) {
	return optionName
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function selectDependentOption(select: ReturnType<Page['locator']>, label: string) {
	if (!label) {
		await select.selectOption({ value: '' });
		return;
	}

	await expect
		.poll(async () => {
			const options = await select.locator('option').allTextContents();
			return options.map((option) => option.trim());
		})
		.toContain(label);

	await select.selectOption({ label });
}

async function getSelectOptions(select: ReturnType<Page['locator']>) {
	return (await select.locator('option').allTextContents()).map((option) => option.trim());
}

async function getOptionValue(select: ReturnType<Page['locator']>, label: string) {
	const option = select.locator('option').filter({ hasText: label });
	await expect(option).toHaveCount(1);
	return (await option.first().getAttribute('value')) ?? '';
}
