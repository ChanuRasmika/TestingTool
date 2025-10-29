import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Reports E2E', () => {
  let uniqueEmail;
  const testPassword = process.env.E2E_TEST_PASSWORD || 'Test123!';
  const testFullName = process.env.E2E_TEST_FULL_NAME || 'Reports Tester';

  test.beforeEach(async ({ page }) => {
    // Create unique user for each test
    uniqueEmail = `reports_${Date.now()}@example.com`;
    
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

  test('should download monthly report with transactions', async ({ page }) => {
    // Add some transactions first
    const transactions = [
      { desc: 'Salary', amount: '3000', category: 'Income' },
      { desc: 'Rent', amount: '-1200', category: 'Services' },
      { desc: 'Groceries', amount: '-150', category: 'Groceries' }
    ];

    for (const tx of transactions) {
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

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click Monthly Report card (it's a button with heading "Monthly Report")
    await page.locator('h3:has-text("Monthly Report")').click();

    // Wait for download
    const download = await downloadPromise;

    // Verify file name contains current month and year
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const expectedFilename = `monthly-report-${year}-${month}.pdf`;
    
    expect(download.suggestedFilename()).toBe(expectedFilename);

    // Save and verify file exists
    const downloadPath = path.join(process.cwd(), 'test-results', 'temp', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    expect(fs.existsSync(downloadPath)).toBe(true);
    
    // Verify file is not empty
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should download report for current month even with no transactions', async ({ page }) => {
    // Don't add any transactions, just download report
    const downloadPromise = page.waitForEvent('download');

    await page.locator('h3:has-text("Monthly Report")').click();

    const download = await downloadPromise;

    // Verify download happens
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const expectedFilename = `monthly-report-${year}-${month}.pdf`;
    
    expect(download.suggestedFilename()).toBe(expectedFilename);

    // Save file
    const downloadPath = path.join(process.cwd(), 'test-results', 'temp', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    expect(fs.existsSync(downloadPath)).toBe(true);

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should download report after adding multiple transactions', async ({ page }) => {
    // Add several transactions spanning different categories
    const categories = ['Food', 'Income', 'Groceries', 'Services', 'Entertainment', 'Transport'];
    
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: 'Add Transaction' }).click();
      await page.waitForTimeout(500);

      const today = new Date().toISOString().split('T')[0];
      await page.locator('input[type="date"]').fill(today);
      await page.getByPlaceholder('Enter description').fill(`Transaction ${i + 1}`);
      const amount = i % 2 === 0 ? `${(i + 1) * 100}` : `-${(i + 1) * 10}`;
      await page.getByPlaceholder('Enter amount (negative for expenses)').fill(amount);
      await page.locator('select').selectOption(categories[i]);
      await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
      await page.waitForTimeout(1000);
    }

    // Verify transaction count
    const transactionsCard = page.locator('h3:has-text("Transactions")').first();
    const countElement = transactionsCard.locator('..').locator('p.text-2xl');
    const countText = await countElement.textContent();
    expect(parseInt(countText)).toBe(6);

    // Download report
    const downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Monthly Report")').click();
    const download = await downloadPromise;

    // Verify download
    const downloadPath = path.join(process.cwd(), 'test-results', 'temp', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    expect(fs.existsSync(downloadPath)).toBe(true);
    
    // Verify file size indicates content
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(100); // Should be more than minimal PDF with 6 transactions

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should download report multiple times', async ({ page }) => {
    // Add a transaction
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(500);

    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.getByPlaceholder('Enter description').fill('Test transaction');
    await page.getByPlaceholder('Enter amount (negative for expenses)').fill('100');
    await page.locator('select').selectOption('Income');
    await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
    await page.waitForTimeout(1000);

    // Download report first time
    let downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Monthly Report")').click();
    let download = await downloadPromise;
    
    const downloadPath1 = path.join(process.cwd(), 'test-results', 'temp', 'report1.pdf');
    await download.saveAs(downloadPath1);
    expect(fs.existsSync(downloadPath1)).toBe(true);

    await page.waitForTimeout(1000);

    // Download report second time
    downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Monthly Report")').click();
    download = await downloadPromise;
    
    const downloadPath2 = path.join(process.cwd(), 'test-results', 'temp', 'report2.pdf');
    await download.saveAs(downloadPath2);
    expect(fs.existsSync(downloadPath2)).toBe(true);

    // Verify both files exist and have similar size (same content)
    const stats1 = fs.statSync(downloadPath1);
    const stats2 = fs.statSync(downloadPath2);
    expect(Math.abs(stats1.size - stats2.size)).toBeLessThan(100); // Should be nearly identical

    // Clean up
    fs.unlinkSync(downloadPath1);
    fs.unlinkSync(downloadPath2);
  });

  test('should access download report button from dashboard', async ({ page }) => {
    // Verify Monthly Report card is visible on dashboard
    const reportCard = page.locator('h3:has-text("Monthly Report")');
    await expect(reportCard).toBeVisible();
  });

  test('should download report with income and expense summary', async ({ page }) => {
    // Get initial balance
    const balanceElement = page.locator('h3:has-text("Account Balance")').locator('..').locator('p.text-2xl');
    const initialBalanceText = await balanceElement.textContent();
    const initialBalance = parseFloat(initialBalanceText.replace(/[$,]/g, ''));

    // Add mix of income and expenses
    const transactions = [
      { desc: 'Monthly salary', amount: '5000', category: 'Income' },
      { desc: 'Freelance work', amount: '800', category: 'Income' },
      { desc: 'Rent payment', amount: '-1500', category: 'Services' },
      { desc: 'Electricity bill', amount: '-80', category: 'Services' },
      { desc: 'Grocery shopping', amount: '-250', category: 'Groceries' },
      { desc: 'Restaurant dinner', amount: '-65', category: 'Food' }
    ];

    for (const tx of transactions) {
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

    // Verify balance changed correctly (initial + 5000 + 800 - 1500 - 80 - 250 - 65)
    const newBalanceText = await balanceElement.textContent();
    const newBalance = parseFloat(newBalanceText.replace(/[$,]/g, ''));
    const expectedBalance = initialBalance + 5000 + 800 - 1500 - 80 - 250 - 65;
    expect(newBalance).toBeCloseTo(expectedBalance, 2);

    // Download report
    const downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Monthly Report")').click();
    const download = await downloadPromise;

    const downloadPath = path.join(process.cwd(), 'test-results', 'temp', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    expect(fs.existsSync(downloadPath)).toBe(true);

    // Verify file size indicates proper content (with 6 transactions and summary)
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(200);

    // Clean up
    fs.unlinkSync(downloadPath);
  });
});
