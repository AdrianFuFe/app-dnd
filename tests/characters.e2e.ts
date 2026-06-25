import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ request }) => {
	const response = await request.post('/api/test/reset');
	expect(response.ok()).toBeTruthy();
});

test('character create route saves a new draft and returns to the roster', async ({ page }) => {
	await page.goto('/app/characters/new');

	await expect(page).toHaveURL('/app/characters/new');
	await expect(page.getByRole('heading', { name: 'Create your first draft.' })).toBeVisible();

	await fillCharacterForm(page, {
		name: 'Brakka Emberforge',
		species: 'Dwarf',
		subspecies: '',
		className: 'Fighter',
		subclass: 'Battle Master',
		level: '4',
		background: 'Guild Artisan',
		story: 'A caravan guard learning to lead from the front.',
		strength: '16',
		constitution: '15',
		maxHp: '34',
		currentHp: '28',
		armorClass: '17',
		hitDice: '4d10',
		attacks: 'Warhammer',
		inventoryItems: [
			{
				name: 'Smith tools',
				quantity: '1',
				value: '15 gp'
			}
		]
	});

	await page.getByRole('button', { name: 'Create character' }).click();

	await expect(page).toHaveURL('/app/characters?created=Brakka%20Emberforge');
	await expect(page.getByText('Brakka Emberforge was created successfully.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Brakka Emberforge' })).toBeVisible();
	await expect(page.getByText('Dwarf - Fighter', { exact: true })).toBeVisible();
});

test('character edit route updates an existing draft and returns to detail', async ({ page }) => {
	await page.goto('/app/characters/char-e2e-1/edit');

	await expect(page).toHaveURL('/app/characters/char-e2e-1/edit');
	await expect(page.getByRole('heading', { name: 'Talia Stormstep' })).toBeVisible();

	await fillCharacterForm(page, {
		name: 'Talia Dawnweaver',
		className: 'Cleric',
		subclass: 'Light Domain',
		background: 'Pilgrim',
		species: 'Elf',
		subspecies: 'High Elf',
		story: 'Now follows a radiant omen across the coast.',
		intelligence: '14',
		wisdom: '16',
		currentHp: '20',
		inventoryItems: [
			{
				name: 'Lantern relic',
				quantity: '1',
				description: 'Burns with a warm dawn glow.',
				isEquipped: true
			}
		],
		spells: 'Guiding Bolt',
		notes: 'Carries a lantern relic.'
	});

	await page.getByRole('button', { name: 'Save changes' }).click();

	await expect(page).toHaveURL('/app/characters/char-e2e-1?updated=Talia%20Dawnweaver');
	await expect(page.getByText('Talia Dawnweaver was updated successfully.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Talia Dawnweaver' })).toBeVisible();
	await expect(page.getByText('Cleric', { exact: true })).toBeVisible();
	await expect(page.getByText('Pilgrim', { exact: true })).toBeVisible();
	await expect(page.getByText('Lantern relic', { exact: true })).toBeVisible();
	await expect(page.getByText('Guiding Bolt', { exact: true })).toBeVisible();
	await expect(page.getByText('Carries a lantern relic.', { exact: true })).toBeVisible();
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

	await page.getByRole('button', { name: 'Delete character' }).click();

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
		attacks: string;
		spells: string;
		inventoryItems: Array<{
			name: string;
			quantity?: string;
			description?: string;
			weight?: string;
			value?: string;
			isEquipped?: boolean;
		}>;
		notes: string;
	}> = {}
) {
	const values = {
		name: 'Talia Stormstep',
		species: 'Elf',
		subspecies: 'High Elf',
		className: 'Wizard',
		subclass: 'Evocation',
		level: '3',
		background: 'Sage',
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
		attacks: 'Quarterstaff',
		spells: 'Magic Missile',
		inventoryItems: [
			{
				name: 'Spellbook',
				quantity: '1'
			}
		],
		notes: 'Tracks ley lines.',
		...overrides
	};

	await page.locator('input[name="name"]').fill(values.name);
	await page.locator('select[name="speciesId"]').selectOption({ label: values.species });
	await page
		.locator('select[name="subspeciesId"]')
		.selectOption(values.subspecies ? { label: values.subspecies } : { value: '' });
	await page.locator('select[name="classId"]').selectOption({ label: values.className });
	await page.locator('select[name="subclassId"]').selectOption({ label: values.subclass });
	await page.locator('input[name="level"]').fill(values.level);
	await page.locator('select[name="backgroundId"]').selectOption({ label: values.background });
	await page.locator('textarea[name="story"]').fill(values.story);
	await page.locator('input[name="strength"]').fill(values.strength);
	await page.locator('input[name="dexterity"]').fill(values.dexterity);
	await page.locator('input[name="constitution"]').fill(values.constitution);
	await page.locator('input[name="intelligence"]').fill(values.intelligence);
	await page.locator('input[name="wisdom"]').fill(values.wisdom);
	await page.locator('input[name="charisma"]').fill(values.charisma);
	await page.locator('input[name="maxHp"]').fill(values.maxHp);
	await page.locator('input[name="currentHp"]').fill(values.currentHp);
	await page.locator('input[name="temporaryHp"]').fill(values.temporaryHp);
	await page.locator('input[name="armorClass"]').fill(values.armorClass);
	await page.locator('input[name="initiative"]').fill(values.initiative);
	await page.locator('input[name="speed"]').fill(values.speed);
	await page.locator('input[name="hitDice"]').fill(values.hitDice);
	await page.locator('textarea[name="attacks"]').fill(values.attacks);
	await page.locator('textarea[name="spells"]').fill(values.spells);
	await page.locator('textarea[name="notes"]').fill(values.notes);

	let currentInventoryItemCount = await page.getByLabel('Item name').count();

	while (currentInventoryItemCount > values.inventoryItems.length) {
		await page.getByRole('button', { name: 'Remove' }).last().click();
		currentInventoryItemCount -= 1;
	}

	while (currentInventoryItemCount < values.inventoryItems.length) {
		await page.getByRole('button', { name: 'Add inventory item' }).click();
		currentInventoryItemCount += 1;
	}

	for (let index = 0; index < values.inventoryItems.length; index += 1) {
		const item = values.inventoryItems[index];
		await page.getByLabel('Item name').nth(index).fill(item.name);
		await page
			.getByLabel('Quantity')
			.nth(index)
			.fill(item.quantity ?? '1');

		await page
			.getByLabel('Value')
			.nth(index)
			.fill(item.value ?? '');
		await page
			.getByLabel('Weight')
			.nth(index)
			.fill(item.weight ?? '');
		await page
			.getByLabel('Description')
			.nth(index)
			.fill(item.description ?? '');

		if (item.isEquipped) {
			await page.getByLabel('Currently equipped').nth(index).check();
		} else {
			await page.getByLabel('Currently equipped').nth(index).uncheck();
		}
	}
}
