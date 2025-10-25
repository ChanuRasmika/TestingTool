import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('login flow authenticates existing user and stores token', async ({ page }) => {
  // First create a user to login with
  await page.waitForTimeout(1500);
  await page.click('text=Sign up');
  await expect(page.locator('text=Create your account')).toBeVisible();
  await page.waitForTimeout(1500);
  
  const testEmail = `${process.env.E2E_TEST_EMAIL.split('@')[0]}+${Date.now()}@${process.env.E2E_TEST_EMAIL.split('@')[1]}`;
  const testPassword = process.env.E2E_TEST_PASSWORD;
  const testFullName = process.env.E2E_TEST_FULL_NAME;
  
  // Create user
  await page.getByLabel('Full Name').fill(testFullName);
  await page.waitForTimeout(800);
  await page.getByLabel('Email').fill(testEmail);
  await page.waitForTimeout(800);
  await page.getByLabel('Password').fill(testPassword);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Sign Up' }).click();
  
  // Wait for dashboard and then logout
  await page.waitForTimeout(2000);
  await expect(page.locator('h2:has-text("Welcome to QuickBank")')).toBeVisible();
  
  // Logout
  await page.locator('button').filter({ hasText: testFullName }).click();
  await page.waitForSelector('text=Sign out', { state: 'visible' });
  await page.waitForTimeout(1000);
  await page.click('text=Sign out');
  
  // Now test login
  await page.waitForTimeout(1500);
  await expect(page.locator('text=Sign in to your account')).toBeVisible();
  
  await page.getByLabel('Email').fill(testEmail);
  await page.waitForTimeout(800);
  await page.getByLabel('Password').fill(testPassword);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);
  await expect(page.locator('h2:has-text("Welcome to QuickBank")')).toBeVisible();
  
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).not.toBeNull();
  await page.waitForTimeout(1500);
});
