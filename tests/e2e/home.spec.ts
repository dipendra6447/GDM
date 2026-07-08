import { test, expect } from '@playwright/test';

test.describe('Job Portal Navigation', () => {
  test('homepage has expected title', async ({ page }) => {
    await page.goto('/');

    // Verify the page title (adjust if the title is different)
    await expect(page).toHaveTitle(/JobNest/);
  });

  test('navigation to login page works', async ({ page }) => {
    await page.goto('/');

    // Check if there is a link to login or try to navigate directly
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
  });
});
