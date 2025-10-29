import { test, expect } from '@playwright/test';

test.describe('Transactions E2E', () => {
  let uniqueEmail;
  const testPassword = process.env.E2E_TEST_PASSWORD || 'Test123!';
  const testFullName = process.env.E2E_TEST_FULL_NAME || 'Transactions Tester';

  test.beforeEach(async ({ page }) => {
    // Create unique user for each test
    uniqueEmail = `trans_${Date.now()}@example.com`;
    
    await page.goto('/');
    await page.waitForTimeout(500);

    // Signup
    await page.click('text=Sign up');
    await expect(page.locator('text=Create your account')).toBeVisible();
    
    await page.getByLabel('Full Name').fill(testFullName);
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Wait for dashboard
    await page.waitForTimeout(1000);
    await expect(page.locator('h2:has-text("Welcome to QuickBank")')).toBeVisible();
  });

  test('should add expense transaction successfully', async ({ page }) => {
    // Get initial balance
    const balanceElement = page.locator('h3:has-text("Account Balance")').locator('..').locator('p.text-2xl');
    const initialBalanceText = await balanceElement.textContent();
    const initialBalance = parseFloat(initialBalanceText.replace(/[$,]/g, ''));

    // Click Add Transaction button
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(500);

    // Verify modal is visible
    await expect(page.locator('h2:has-text("Add Transaction")')).toBeVisible();

    // Fill transaction form
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.getByPlaceholder('Enter description').fill('Lunch at restaurant');
    await page.getByPlaceholder('Enter amount (negative for expenses)').fill('-25.50');
    await page.locator('select').selectOption('Food');

    // Submit transaction
    await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(1000);

    // Verify transaction appears in list
    await expect(page.locator('text=Lunch at restaurant')).toBeVisible();
    await expect(page.locator('text=-$25.50').first()).toBeVisible();
    await expect(page.locator('text=Food').first()).toBeVisible();

    // Verify balance decreased by 25.50
    const newBalanceText = await balanceElement.textContent();
    const newBalance = parseFloat(newBalanceText.replace(/[$,]/g, ''));
    expect(newBalance).toBeCloseTo(initialBalance - 25.50, 2);
  });

  test('should add income transaction successfully', async ({ page }) => {
    // Get initial balance
    const balanceElement = page.locator('h3:has-text("Account Balance")').locator('..').locator('p.text-2xl');
    const initialBalanceText = await balanceElement.textContent();
    const initialBalance = parseFloat(initialBalanceText.replace(/[$,]/g, ''));

    // Click Add Transaction button
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(500);

    // Fill transaction form
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.getByPlaceholder('Enter description').fill('Freelance payment');
    await page.getByPlaceholder('Enter amount (negative for expenses)').fill('500');
    await page.locator('select').selectOption('Income');

    // Submit transaction
    await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(1000);

    // Verify transaction appears
    await expect(page.locator('text=Freelance payment')).toBeVisible();
    await expect(page.locator('text=+$500.00').first()).toBeVisible();

    // Verify balance increased by 500
    const newBalanceText = await balanceElement.textContent();
    const newBalance = parseFloat(newBalanceText.replace(/[$,]/g, ''));
    expect(newBalance).toBeCloseTo(initialBalance + 500, 2);
  });

  test('should add multiple transactions and verify count', async ({ page }) => {
    // Get initial balance
    const balanceElement = page.locator('h3:has-text("Account Balance")').locator('..').locator('p.text-2xl');
    const initialBalanceText = await balanceElement.textContent();
    const initialBalance = parseFloat(initialBalanceText.replace(/[$,]/g, ''));

    // Add first transaction (expense)
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(500);

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.getByPlaceholder('Enter description').fill('Coffee');
    await page.getByPlaceholder('Enter amount (negative for expenses)').fill('-5.50');
    await page.locator('select').selectOption('Food');
    await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(1000);

    // Add second transaction (income)
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(500);

    await page.locator('input[type="date"]').fill(today);
    await page.getByPlaceholder('Enter description').fill('Salary');
    await page.getByPlaceholder('Enter amount (negative for expenses)').fill('2000');
    await page.locator('select').selectOption('Income');
    await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(1000);

    // Add third transaction (expense)
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(500);

    await page.locator('input[type="date"]').fill(today);
    await page.getByPlaceholder('Enter description').fill('Uber ride');
    await page.getByPlaceholder('Enter amount (negative for expenses)').fill('-15');
    await page.locator('select').selectOption('Transport');
    await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(1000);

    // Verify transaction count
    const transactionsCard = page.locator('h3:has-text("Transactions")').first();
    await expect(transactionsCard).toBeVisible();
    const countElement = transactionsCard.locator('..').locator('p.text-2xl');
    const countText = await countElement.textContent();
    expect(parseInt(countText)).toBe(3);

    // Verify all transactions are visible
    await expect(page.locator('text=Coffee')).toBeVisible();
    await expect(page.locator('text=Salary')).toBeVisible();
    await expect(page.locator('text=Uber ride')).toBeVisible();

    // Verify balance calculation (initial + 2000 - 5.50 - 15)
    const newBalanceText = await balanceElement.textContent();
    const newBalance = parseFloat(newBalanceText.replace(/[$,]/g, ''));
    const expectedBalance = initialBalance + 2000 - 5.50 - 15;
    expect(newBalance).toBeCloseTo(expectedBalance, 2);
  });

  test('should cancel transaction form without saving', async ({ page }) => {
    // Click Add Transaction
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(500);

    // Fill some data
    await page.getByPlaceholder('Enter description').fill('Test transaction');
    await page.getByPlaceholder('Enter amount (negative for expenses)').fill('-100');

    // Click Cancel
    await page.locator('div.fixed').getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(500);

    // Verify modal is closed
    await expect(page.locator('h2:has-text("Add Transaction")')).not.toBeVisible();

    // Verify no transaction was added
    await expect(page.locator('text=Test transaction')).not.toBeVisible();
  });

  test('should handle validation errors', async ({ page }) => {
    // Click Add Transaction
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(500);

    // Try to submit without filling required fields
    await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(500);

    // Verify modal is still open (submission blocked by HTML5 validation)
    await expect(page.locator('h2:has-text("Add Transaction")')).toBeVisible();
  });

  test('should display transactions with different categories', async ({ page }) => {
    const categories = [
      { desc: 'Groceries shopping', amount: '-150', category: 'Groceries' },
      { desc: 'Movie tickets', amount: '-30', category: 'Entertainment' },
      { desc: 'Consulting work', amount: '800', category: 'Income' }
    ];

    for (const tx of categories) {
      await page.getByRole('button', { name: 'Add Transaction' }).click();
      await page.waitForTimeout(500);

      const today = new Date().toISOString().split('T')[0];
      await page.locator('input[type="date"]').fill(today);
      await page.getByPlaceholder('Enter description').fill(tx.desc);
      await page.getByPlaceholder('Enter amount (negative for expenses)').fill(tx.amount);
      await page.locator('select').selectOption(tx.category);
      await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
      await page.waitForTimeout(1000);
    }

    // Verify all transactions with their categories
    for (const tx of categories) {
      await expect(page.locator(`text=${tx.desc}`)).toBeVisible();
      // Category badges should be visible near the transaction
      const categoryBadge = page.locator('text=' + tx.category).first();
      await expect(categoryBadge).toBeVisible();
    }
  });

  test('should show empty state when no transactions', async ({ page }) => {
    // On fresh signup, should see some empty state or zero transactions
    const transactionsCard = page.locator('h3:has-text("Transactions")').first();
    await expect(transactionsCard).toBeVisible();
    
    // Balance should be $0.00
    const balanceElement = page.locator('h3:has-text("Account Balance")').locator('..').locator('p.text-2xl');
    const balanceText = await balanceElement.textContent();
    // Check for 0.00 (might be formatted differently)
    expect(balanceText.replace(/,/g, '')).toContain('0.00');
  });
});
