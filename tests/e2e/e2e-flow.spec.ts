/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

test.describe('URL Deconstructor App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load the homepage with form', async ({ page }) => {
    await expect(page.getByText('URL Crawler & Deconstructor')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });

  test('should show error for invalid URL', async ({ page }) => {
    await page.locator('input').fill('not-a-url');
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText('Invalid URL format')).toBeVisible();
  });

  test('should successfully crawl and show sub-URLs for a valid site', async ({ page }) => {
    await page.locator('input').fill('https://example.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.url-components')).toBeVisible();
    await expect(page.locator('.subpaths')).toBeVisible();
  });
});
