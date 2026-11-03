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

  test('shows the 29 Vancouver directory stores and opens one from its pin', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('.pin--listing')).toHaveCount(29);
    await page.getByRole('button', { name: 'Shoppers Drug Mart Yaletown' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Yaletown' })).toBeVisible();
    await expect(page).toHaveURL(/#\/store\/2246$/);
  });

  test('finds a store from the search field', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('combobox', { name: /find a store/i }).fill('kingsway');
    await page.getByRole('option', { name: /El Dorado/ }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'El Dorado' })).toBeVisible();
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

test.describe('compare', () => {
  test('opens from the switcher and returns to a store', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('tab', { name: 'Compare' }).click();
    await expect(page).toHaveURL(/#\/compare$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Compare stores' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Where each store should specialise' })).toBeVisible();
    await page.getByRole('tab', { name: 'University Blvd' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'University Blvd' })).toBeVisible();
  });
});

test.describe('store brief', () => {
  test('opens from the store panel and prints on one page', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /One-page brief/ }).click();
    await expect(page).toHaveURL(/#\/store\/2247\/brief$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Wesbrook Village' })).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.topbar')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeHidden();
    const pdf = (await page.pdf({ format: 'Letter', preferCSSPageSize: true })).toString('latin1');
    expect(pdf.match(/\/Type\s*\/Page[^s]/g)).toHaveLength(1);
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
  await page.goto('./#/compare');
  const [scroll, client] = await page.locator('.page').evaluate((el) => [el.scrollWidth, el.clientWidth]);
  expect(scroll, 'compare').toBeLessThanOrEqual(client);
});
