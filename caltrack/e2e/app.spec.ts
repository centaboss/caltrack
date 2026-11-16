import { expect, test } from '@playwright/test';

test('loads the calorie tracker dashboard', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('ion-title').first()).toContainText('CalTrack');
  await expect(page.getByText('Calories remaining')).toBeVisible();
  await expect(page.getByLabel('Log a meal')).toBeVisible();
});

test('navigates to settings', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Settings').click();

  await expect(page.locator('ion-title').filter({ hasText: 'Settings' })).toBeVisible();
  await expect(page.getByText('Daily target')).toBeVisible();
});

test('navigates to insights', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Insights').click();

  await expect(page.locator('ion-title').filter({ hasText: 'Insights' })).toBeVisible();
  await expect(page.getByText('Average intake')).toBeVisible();
  await expect(page.locator('ion-segment-button[value="30"]')).toBeVisible();
});

test('logs a meal from the dashboard', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Log a meal').click();
  await page.locator('ion-input[formcontrolname="name"] input').fill('Test salad');
  await page.locator('ion-input[formcontrolname="calories"] input').fill('250');
  await page.getByRole('button', { name: 'Log meal' }).click();

  await expect(page.getByText('Test salad')).toBeVisible();
  await expect(page.getByText('250 kcal').first()).toBeVisible();
});

test('opens the log meal form from insights', async ({ page }) => {
  await page.goto('/history');

  await page.getByRole('button', { name: 'Log a meal' }).click();

  await expect(page.locator('ion-modal app-entry-form')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log meal' })).toBeVisible();
});
