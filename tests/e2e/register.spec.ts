import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  // We use a unique email for each test by appending the current timestamp.
  
  test('should register a new Job Seeker successfully with a unique email', async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:3000/login');

    // Switch to Sign Up mode
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Verify we are on the Sign Up form
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // Generate a unique email
    const uniqueEmail = `test_js_${Date.now()}@example.com`;

    // Fill in Email, Password, Confirm Password
    await page.locator('#auth-email').fill(uniqueEmail);
    await page.locator('#auth-password').fill('TestPass123!');
    await page.locator('#auth-confirm-password').fill('TestPass123!');

    // Fill in a profile field to ensure it interacts correctly (e.g., First Name)
    await page.locator('#js-firstName').fill('Playwright');
    await page.locator('#js-lastName').fill('Tester');

    // Submit the form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Expect success message
    await expect(page.locator('.auth-success-msg')).toContainText('Account created! Redirecting...', { timeout: 10000 });

    // Wait for redirect to home page
    await expect(page).toHaveURL('http://localhost:3000/');
  });
  
  test('should register a new Employer successfully with a unique email', async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:3000/login');

    // Switch to Sign Up mode
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Verify we are on the Sign Up form
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // Select Employer Role
    await page.getByText('Employer', { exact: true }).click();

    // Generate a unique email
    const uniqueEmail = `test_emp_${Date.now()}@example.com`;

    // Fill in Email, Password, Confirm Password
    await page.locator('#auth-email').fill(uniqueEmail);
    await page.locator('#auth-password').fill('TestPass123!');
    await page.locator('#auth-confirm-password').fill('TestPass123!');

    // Fill in a profile field
    await page.locator('#emp-companyName').fill('Playwright Corp');

    // Submit the form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Expect success message
    await expect(page.locator('.auth-success-msg')).toContainText('Account created! Redirecting...', { timeout: 10000 });
  });
  
  test('should register a new Business Promoter successfully with a unique email', async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:3000/login');

    // Switch to Sign Up mode
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Verify we are on the Sign Up form
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // Select Business Promoter Role
    await page.getByText('Business Promoter', { exact: true }).click();

    // Generate a unique email
    const uniqueEmail = `test_bp_${Date.now()}@example.com`;

    // Fill in Email, Password, Confirm Password
    await page.locator('#auth-email').fill(uniqueEmail);
    await page.locator('#auth-password').fill('TestPass123!');
    await page.locator('#auth-confirm-password').fill('TestPass123!');

    // Fill in a profile field
    await page.locator('#bp-businessName').fill('Promo Playwright');

    // Submit the form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Expect success message
    await expect(page.locator('.auth-success-msg')).toContainText('Account created! Redirecting...', { timeout: 10000 });
  });
});
