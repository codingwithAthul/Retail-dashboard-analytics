import { expect, test } from '@playwright/test';

test.describe('overview', () => {
  test('shows both store pins and the first store', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 2, name: 'Wesbrook Village' })).toBeVisible();
    await expect(page.locator('.pin--store')).toHaveCount(2);
  });

  test('selects a store by clicking its map pin', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Shoppers Drug Mart University of BC' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'University Blvd' })).toBeVisible();
    await expect(page).toHaveURL(/#\/store\/2273$/);
  });

  test('shows Store Leadership placeholders, not names', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByText('Not yet added')).toHaveCount(4);
  });
});

test.describe('analytics tabs', () => {
  test('opens Sales from the overview and labels sample data', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /^Sales/ }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Sales' })).toBeVisible();
    await expect(page.getByText('Sample data').first()).toBeVisible();
    await expect(page.locator('.recharts-surface').first()).toBeVisible();
  });

  test('deep link opens Competitors for University Blvd', async ({ page }) => {
    await page.goto('./#/store/2273/competitors');
    await expect(page.getByText('University Blvd · #2273')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Where to compete' })).toBeVisible();
  });

  test('back button returns to the overview', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /^Demographics/ }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Demographics' })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { level: 2, name: 'Wesbrook Village' })).toBeVisible();
  });
});

test('dark appearance follows the system setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(0, 0, 0)');
});

test('analytics pages never scroll sideways', async ({ page }) => {
  for (const tab of ['demographics', 'sales', 'competitors']) {
    await page.goto(`./#/store/2247/${tab}`);
    const [scroll, client] = await page.locator('.page').evaluate((el) => [el.scrollWidth, el.clientWidth]);
    expect(scroll, tab).toBeLessThanOrEqual(client);
  }
});
