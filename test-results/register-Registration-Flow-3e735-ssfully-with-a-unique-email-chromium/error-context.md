# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: register.spec.ts >> Registration Flow >> should register a new Employer successfully with a unique email
- Location: tests/e2e/register.spec.ts:38:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Create Account' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Create Account' })

```

```yaml
- heading "Unlock Your Next Career Move." [level=1]
- paragraph: Join thousands of professionals finding their dream roles at top companies worldwide. Premium roles, exclusive insights, zero noise.
- heading "Welcome Back" [level=2]
- paragraph: Sign in to access your dashboard
- link "Continue with Google":
  - /url: http://localhost:5000/api/auth/google
  - img
  - text: Continue with Google
- text: or continue with email Email Address
- textbox "Email Address":
  - /placeholder: you@example.com
- text: Password
- textbox "Password":
  - /placeholder: ••••••••
- button "Show password": 
- button "Sign In"
- text: Don't have an account?
- button "Sign up"
- alert
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Registration Flow', () => {
  4   |   // We use a unique email for each test by appending the current timestamp.
  5   |   
  6   |   test('should register a new Job Seeker successfully with a unique email', async ({ page }) => {
  7   |     // Navigate to the login page
  8   |     await page.goto('http://localhost:3000/login');
  9   | 
  10  |     // Switch to Sign Up mode
  11  |     await page.getByRole('button', { name: 'Sign up' }).click();
  12  | 
  13  |     // Verify we are on the Sign Up form
  14  |     await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  15  | 
  16  |     // Generate a unique email
  17  |     const uniqueEmail = `test_js_${Date.now()}@example.com`;
  18  | 
  19  |     // Fill in Email, Password, Confirm Password
  20  |     await page.locator('#auth-email').fill(uniqueEmail);
  21  |     await page.locator('#auth-password').fill('TestPass123!');
  22  |     await page.locator('#auth-confirm-password').fill('TestPass123!');
  23  | 
  24  |     // Fill in a profile field to ensure it interacts correctly (e.g., First Name)
  25  |     await page.locator('#js-firstName').fill('Playwright');
  26  |     await page.locator('#js-lastName').fill('Tester');
  27  | 
  28  |     // Submit the form
  29  |     await page.getByRole('button', { name: 'Create Account' }).click();
  30  | 
  31  |     // Expect success message
  32  |     await expect(page.locator('.auth-success-msg')).toContainText('Account created! Redirecting...', { timeout: 10000 });
  33  | 
  34  |     // Wait for redirect to home page
  35  |     await expect(page).toHaveURL('http://localhost:3000/');
  36  |   });
  37  |   
  38  |   test('should register a new Employer successfully with a unique email', async ({ page }) => {
  39  |     // Navigate to the login page
  40  |     await page.goto('http://localhost:3000/login');
  41  | 
  42  |     // Switch to Sign Up mode
  43  |     await page.getByRole('button', { name: 'Sign up' }).click();
  44  | 
  45  |     // Verify we are on the Sign Up form
> 46  |     await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  47  | 
  48  |     // Select Employer Role
  49  |     await page.getByText('Employer', { exact: true }).click();
  50  | 
  51  |     // Generate a unique email
  52  |     const uniqueEmail = `test_emp_${Date.now()}@example.com`;
  53  | 
  54  |     // Fill in Email, Password, Confirm Password
  55  |     await page.locator('#auth-email').fill(uniqueEmail);
  56  |     await page.locator('#auth-password').fill('TestPass123!');
  57  |     await page.locator('#auth-confirm-password').fill('TestPass123!');
  58  | 
  59  |     // Fill in a profile field
  60  |     await page.locator('#emp-companyName').fill('Playwright Corp');
  61  | 
  62  |     // Submit the form
  63  |     await page.getByRole('button', { name: 'Create Account' }).click();
  64  | 
  65  |     // Expect success message
  66  |     await expect(page.locator('.auth-success-msg')).toContainText('Account created! Redirecting...', { timeout: 10000 });
  67  |   });
  68  |   
  69  |   test('should register a new Business Promoter successfully with a unique email', async ({ page }) => {
  70  |     // Navigate to the login page
  71  |     await page.goto('http://localhost:3000/login');
  72  | 
  73  |     // Switch to Sign Up mode
  74  |     await page.getByRole('button', { name: 'Sign up' }).click();
  75  | 
  76  |     // Verify we are on the Sign Up form
  77  |     await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  78  | 
  79  |     // Select Business Promoter Role
  80  |     await page.getByText('Business Promoter', { exact: true }).click();
  81  | 
  82  |     // Generate a unique email
  83  |     const uniqueEmail = `test_bp_${Date.now()}@example.com`;
  84  | 
  85  |     // Fill in Email, Password, Confirm Password
  86  |     await page.locator('#auth-email').fill(uniqueEmail);
  87  |     await page.locator('#auth-password').fill('TestPass123!');
  88  |     await page.locator('#auth-confirm-password').fill('TestPass123!');
  89  | 
  90  |     // Fill in a profile field
  91  |     await page.locator('#bp-businessName').fill('Promo Playwright');
  92  | 
  93  |     // Submit the form
  94  |     await page.getByRole('button', { name: 'Create Account' }).click();
  95  | 
  96  |     // Expect success message
  97  |     await expect(page.locator('.auth-success-msg')).toContainText('Account created! Redirecting...', { timeout: 10000 });
  98  |   });
  99  | });
  100 | 
```