import { test, expect } from '@playwright/test';

test('complete E2E flow: signup → dashboard → signout → login', async ({ page }) => {
  // Generate unique email to avoid conflicts
  const uniqueEmail = `${process.env.E2E_TEST_EMAIL.split('@')[0]}+${Date.now()}@${process.env.E2E_TEST_EMAIL.split('@')[1]}`;
  const testPassword = process.env.E2E_TEST_PASSWORD;
  const testFullName = process.env.E2E_TEST_FULL_NAME;

  await page.goto('/');
  await page.waitForTimeout(1500);

  // Navigate to signup form
  await page.click('text=Sign up');
  await expect(page.locator('text=Create your account')).toBeVisible();
  await page.waitForTimeout(1500);

  //Signup with auto-filled data
  await page.getByLabel('Full Name').fill(testFullName);
  await page.waitForTimeout(800);
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.waitForTimeout(800);
  await page.getByLabel('Password').fill(testPassword);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Verify signup success and token storage
  await page.waitForTimeout(1000);
  const signupToken = await page.evaluate(() => localStorage.getItem('token'));
  expect(signupToken).not.toBeNull();

  //Verify dashboard access after signup
  await expect(page.locator('h2:has-text("Welcome to QuickBank")')).toBeVisible();
  await expect(page.locator(`h2:has-text("${testFullName}")`)).toBeVisible();
  await page.waitForTimeout(2000);

  //Signout
  await page.locator('button').filter({ hasText: testFullName }).click();
  await page.waitForSelector('text=Sign out', { state: 'visible' });
  await page.waitForTimeout(1000);
  await page.click('text=Sign out');

  //back to login/signup page
  await page.waitForTimeout(500);
  const tokenAfterSignout = await page.evaluate(() => localStorage.getItem('token'));
  expect(tokenAfterSignout).toBeNull();
  await expect(page.locator('text=Sign in to your account')).toBeVisible();

  //Login with same credentials
  await page.waitForTimeout(1500);
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.waitForTimeout(800);
  await page.getByLabel('Password').fill(testPassword);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Verify login success and token storage
  await page.waitForTimeout(1000);
  const loginToken = await page.evaluate(() => localStorage.getItem('token'));
  expect(loginToken).not.toBeNull();

  //Verify dashboard access after login
  await expect(page.locator('h2:has-text("Welcome to QuickBank")')).toBeVisible();
  await expect(page.locator(`h2:has-text("${testFullName}")`)).toBeVisible();
  await page.waitForTimeout(2000);

  // Verify user data persistence
  const userData = await page.evaluate(() => JSON.parse(localStorage.getItem('user')));
  expect(userData.name).toBe(testFullName);
  expect(userData.email).toBe(uniqueEmail);
  await page.waitForTimeout(1500);
});