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

  test('groups close directory stores and zooms in to open one', async ({ page }) => {
    await page.goto('./');
    const clusters = page.locator('.pin--cluster');
    await expect(clusters.first()).toBeVisible();
    const shown = await page.locator('.pin--listing').count();
    const grouped = await clusters.evaluateAll((els) => els.reduce((n, el) => n + Number(el.textContent), 0));
    expect(shown + grouped).toBe(29);
    await page.getByRole('button', { name: /stores: .*Yaletown/ }).click();
    await page.getByRole('button', { name: 'Shoppers Drug Mart Yaletown' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Yaletown' })).toBeVisible();
    await expect(page).toHaveURL(/#\/store\/2246$/);
  });

  test('explains the pins in a map key, folded on phones', async ({ page }, testInfo) => {
    await page.goto('./');
    const key = page.getByRole('note', { name: 'Map key' });
    await expect(key).toBeVisible();
    if (testInfo.project.name === 'phone') {
      await expect(key.getByText('Profiled store, full analytics')).toBeHidden();
      await key.getByText('Map key').click();
    }
    await expect(key.getByText('Profiled store, full analytics')).toBeVisible();
    await expect(key.getByText('Stores grouped here; tap to zoom in')).toBeVisible();
    await expect(key.getByText('Nearby pharmacy or supermarket')).toBeHidden();
    await page.goto('./#/store/2246');
    await expect(key.getByText('Nearby pharmacy or supermarket')).toBeVisible();
  });

  test('zooms to a directory store opened by link, with no pins grouped', async ({ page }) => {
    await page.goto('./#/store/2246');
    await expect(page.locator('.pin--listing.is-selected')).toBeVisible();
    await expect(page.locator('.pin--cluster')).toHaveCount(0);
  });

  test('shows the postal-area census for a directory store', async ({ page }) => {
    await page.goto('./#/store/201');
    await expect(page.getByRole('heading', { name: /2021 census, postal area V6G/ })).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Households that rent' })).toBeVisible();
  });

  test('shows pharmacies and supermarkets within a 10-minute walk of a directory store', async ({ page }) => {
    await page.goto('./#/store/2246');
    await expect(page.getByRole('heading', { name: 'Within a 10-minute walk' })).toBeVisible();
    await expect(page.locator('.pin--competitor').first()).toBeVisible();
    await page.goto('./#/store/2247');
    await expect(page.locator('.pin--competitor')).toHaveCount(0);
  });

  test('says what nearby stores sell and what to stock', async ({ page }) => {
    await page.goto('./#/store/201');
    await expect(page.getByRole('rowheader', { name: /No Frills/ })).toContainText('Discount supermarket');
    const calls = page.getByRole('table', { name: /Stock calls/ });
    await expect(calls.getByRole('row', { name: /Fresh grocery/ })).toContainText('Avoid');
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

test.describe('network', () => {
  test('opens from the switcher, lists overlapping stores, and opens one', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('tab', { name: 'Network' }).click();
    await expect(page).toHaveURL(/#\/network$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Where the network overlaps' })).toBeVisible();
    await page.getByRole('button', { name: 'Yaletown' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Yaletown' })).toBeVisible();
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
  for (const hash of ['compare', 'network']) {
    await page.goto(`./#/${hash}`);
    const [scroll, client] = await page.locator('.page').evaluate((el) => [el.scrollWidth, el.clientWidth]);
    expect(scroll, hash).toBeLessThanOrEqual(client);
  }
});
