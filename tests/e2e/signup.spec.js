import { test, expect } from '@playwright/test';

test('signup flow creates a new user and stores token', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500);
  
  // Navigate to signup form
  await page.click('text=Sign up');
  await expect(page.locator('text=Create your account')).toBeVisible();
  await page.waitForTimeout(1500);
  
  // Fill signup form
  await page.getByLabel('Full Name').fill('E2E Tester');
  await page.waitForTimeout(800);
  const email = `e2e+signup+${Date.now()}@example.com`;
  await page.getByLabel('Email').fill(email);
  await page.waitForTimeout(800);
  await page.getByLabel('Password').fill('Password123!');
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Wait for signup to complete and verify dashboard
  await page.waitForTimeout(2000);
  await expect(page.locator('h2:has-text("Welcome to QuickBank")')).toBeVisible();
  
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).not.toBeNull();
  await page.waitForTimeout(1500);
});
