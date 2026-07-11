import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ request }) => {
	const response = await request.post('/api/test/reset');
	expect(response.ok()).toBeTruthy();
});

test.fail('character create route saves a new draft and returns to the roster', async ({ page }) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
	await expect(
		page.getByRole('heading', { name: 'Create a structured character draft.' })
	).toBeVisible();

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

	await page.getByRole('button', { name: 'Create character' }).click();

	await expect(page).toHaveURL(/\/app\/characters\?created=Brakka\+Emberforge$/);
	await expect(page.getByText('Brakka Emberforge was created successfully.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Brakka Emberforge' })).toBeVisible();
	await expect(page.getByText('Humano', { exact: true })).toBeVisible();
	await expect(page.getByText('Guerrero', { exact: true })).toBeVisible();
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

test.fail('manual custom draft persists content-profile reasons through detail and edit round trips', async ({
	page
}) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
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

	await page.getByRole('button', { name: 'Create character' }).click();

	await expect(page).toHaveURL(/\/app\/characters\?created=Ilya\+Starling$/);
	await expect(page.getByText('Ilya Starling was created successfully.')).toBeVisible();
	await page
		.locator('article')
		.filter({ has: page.getByRole('heading', { name: 'Ilya Starling' }) })
		.getByRole('link', { name: 'View details' })
		.click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?created=Ilya\+Starling$/);
	await expect(page.getByText('custom', { exact: true })).toBeVisible();
	await expect(page.getByText('Custom path reasons')).toBeVisible();
	await expect(page.getByText('Manual override: Attack Items', { exact: true })).toBeVisible();

	await page.getByRole('link', { name: 'Edit character' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\/edit$/);
	await page.getByRole('button', { name: 'Save changes' }).click();

	await expect(page).toHaveURL(/\/app\/characters\/[^/]+\?updated=Ilya\+Starling$/);
	await expect(page.getByText('Ilya Starling was updated successfully.')).toBeVisible();
	await expect(page.getByText('Custom path reasons')).toBeVisible();
	await expect(page.getByText('Existing custom draft retained', { exact: true })).toBeVisible();
});

test('character create route filters dependent subspecies and subclass options from catalog selections', async ({
	page
}) => {
	await page.goto('/app/characters/new');

	const speciesSelect = page.locator('select[name="speciesId"]').nth(1);
	const subspeciesSelect = page.locator('select[name="subspeciesId"]').nth(1);
	const classSelect = page.locator('select[name="classId"]').nth(1);
	const subclassSelect = page.locator('select[name="subclassId"]').nth(1);

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

	await page.locator('input[name="name"]').last().fill(values.name);
	const speciesSelect = page.locator('select[name="speciesId"]').last();
	const subspeciesSelect = page.locator('select[name="subspeciesId"]').last();
	const classSelect = page.locator('select[name="classId"]').last();
	const subclassSelect = page.locator('select[name="subclassId"]').last();

	await speciesSelect.selectOption({ label: values.species });
	await selectDependentOption(subspeciesSelect, values.subspecies);
	await classSelect.selectOption({ label: values.className });
	await selectDependentOption(subclassSelect, values.subclass);
	await page.locator('input[name="level"]').last().fill(values.level);
	await page.locator('select[name="backgroundId"]').last().selectOption({ label: values.background });
	await page.locator('textarea[name="story"]').last().fill(values.story);
	await page.locator('input[name="strength"]').last().fill(values.strength);
	await page.locator('input[name="dexterity"]').last().fill(values.dexterity);
	await page.locator('input[name="constitution"]').last().fill(values.constitution);
	await page.locator('input[name="intelligence"]').last().fill(values.intelligence);
	await page.locator('input[name="wisdom"]').last().fill(values.wisdom);
	await page.locator('input[name="charisma"]').last().fill(values.charisma);
	await page.locator('input[name="maxHp"]').last().fill(values.maxHp);
	await page.locator('input[name="currentHp"]').last().fill(values.currentHp);
	await page.locator('input[name="temporaryHp"]').last().fill(values.temporaryHp);
	await page.locator('input[name="armorClass"]').last().fill(values.armorClass);
	await page.locator('input[name="initiative"]').last().fill(values.initiative);
	await page.locator('input[name="speed"]').last().fill(values.speed);
	await page.locator('input[name="hitDice"]').last().fill(values.hitDice);
	const attackSection = page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Attacks' }) });
	const spellSection = page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Spells' }) });
	const inventorySection = page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Inventory' }) });
	const featSection = page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Feats' }) });
	const notesSection = page
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
