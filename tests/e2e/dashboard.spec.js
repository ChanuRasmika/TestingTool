import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test('add expense and income, verify list and download report', async ({ page }) => {
    await page.goto('/');

    // Create a fresh user via signup
    await page.getByText('Sign up').click();
    await expect(page.getByText('Create your account')).toBeVisible();

    const now = Date.now();
    const fullName = `E2E Dashboard ${now}`;
    const email = `e2e+dash+${now}@example.com`;
    const password = 'Password123!';

    await page.getByLabel('Full Name').fill(fullName);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // On dashboard
    await expect(page.locator('h2', { hasText: 'Welcome to QuickBank' })).toBeVisible();

    // Helper to open Add Transaction, submit, and wait for modal to close
    const addTransaction = async ({ description, amount, category }) => {
      await page.getByRole('button', { name: 'Add Transaction' }).click();
      await expect(page.getByRole('heading', { name: 'Add Transaction' })).toBeVisible();
  await page.getByPlaceholder('Enter description').fill(description);
  await page.getByPlaceholder('Enter amount (negative for expenses)').fill(String(amount));
  if (category) await page.locator('select').first().selectOption({ label: category });
  // Click the submit button inside the modal specifically to avoid strict mode conflicts
  await page.locator('.fixed.inset-0').getByRole('button', { name: 'Add Transaction' }).click();
      // Modal should disappear
      await expect(page.getByRole('heading', { name: 'Add Transaction' })).toHaveCount(0);
    };

    // Add an expense
    await addTransaction({ description: 'Lunch', amount: -10.0, category: 'Food' });
    // Verify list and amount formatting
    await expect(page.getByText('Lunch')).toBeVisible();
    await expect(page.getByText(/-\$10\.00/)).toBeVisible();

    // Add an income
    await addTransaction({ description: 'Paycheck', amount: 100.0, category: 'Income' });
    await expect(page.getByText('Paycheck')).toBeVisible();
    await expect(page.getByText(/\+\$100\.00/)).toBeVisible();

    // Transactions card should show at least 2
    const countText = await page
      .getByRole('heading', { name: 'Transactions' })
      .locator('xpath=following-sibling::p')
      .textContent();
    expect(Number((countText || '').trim())).toBeGreaterThanOrEqual(2);

    // Download monthly report
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Monthly Report/ }).click(),
    ]);
    const suggested = download.suggestedFilename();
    expect(suggested).toMatch(/monthly-report-\d{4}-\d{2}\.pdf/);
  });
});
