import { expect, test } from '@playwright/test';

test('character detail route supports deleting a draft', async ({ page }) => {
	await page.goto('/app/characters');

	await expect(page).toHaveURL('/app/characters');
	await expect(page.getByRole('heading', { name: 'Character management starts here.' })).toBeVisible();
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
