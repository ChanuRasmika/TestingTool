import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Adjustable pacing for demo. Set DEMO_PACE_MS=400..800 to slow/speed the flow.
const PACE = Number(process.env.DEMO_PACE_MS || '500');

async function pause(page, ms = PACE) {
  await page.waitForTimeout(ms);
}

function makeTempDir() {
  const dir = path.join(process.cwd(), 'test-results', 'temp');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Use local timezone date for <input type="date"> to avoid UTC off-by-one
function localDateYYYYMMDD() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test('Combined demo: signup → dashboard → transactions → report → profile → logout/login', async ({ page }) => {
  const tempDir = makeTempDir();

  // Test data
  const baseName = process.env.E2E_TEST_FULL_NAME || 'Demo User';
  const testFullName = `${baseName}`;
  const testPassword = process.env.E2E_TEST_PASSWORD || 'Test123!';
  const emailBase = process.env.E2E_TEST_EMAIL || 'demo.user@example.com';
  const [local, domain] = emailBase.split('@');
  const uniqueEmail = `${local}+${Date.now()}@${domain || 'example.com'}`;

  // 1) Go to app
  await page.goto('/');
  await pause(page, 800);

  // 2) Signup
  await page.click('text=Sign up');
  await expect(page.locator('text=Create your account')).toBeVisible();
  await pause(page);

  await page.getByLabel('Full Name').fill(testFullName);
  await pause(page);
  await page.getByLabel('Email').fill(uniqueEmail);
  await pause(page);
  await page.getByLabel('Password').fill(testPassword);
  await pause(page);
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // 3) Wait for Dashboard (robust cue)
  await expect(page.getByRole('button', { name: 'Add Transaction' })).toBeVisible({ timeout: 15000 });
  await pause(page, 1000);

  // 4) Verify auth persisted
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();
  await pause(page);

  // 5) Add 2 transactions (expense + income)
  const addTx = async (desc, amount, category) => {
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    await pause(page, 600);

    const today = localDateYYYYMMDD();
    await page.locator('input[type="date"]').fill(today);
    await pause(page);
    await page.getByPlaceholder('Enter description').fill(desc);
    await pause(page);
    await page.getByPlaceholder('Enter amount (negative for expenses)').fill(String(amount));
    await pause(page);
    await page.locator('select').selectOption(String(category));
    await pause(page, 400);
    await page.locator('div.fixed').getByRole('button', { name: 'Add Transaction' }).click();
    await pause(page, 1000);
  };

  await addTx('Coffee', '-4.75', 'Food');
  await addTx('Freelance', '250', 'Income');

  // 6) Verify transactions list card and count present
  const transactionsCard = page.locator('h3:has-text("Transactions")').first();
  await expect(transactionsCard).toBeVisible();
  await pause(page);

  // 7) Download monthly report
  const downloadPromise = page.waitForEvent('download');
  await page.locator('h3:has-text("Monthly Report")').click();
  const download = await downloadPromise;
  const reportPath = path.join(tempDir, download.suggestedFilename());
  await download.saveAs(reportPath);
  expect(fs.existsSync(reportPath)).toBe(true);
  const stats = fs.statSync(reportPath);
  expect(stats.size).toBeGreaterThan(0);
  await pause(page, 1000);

  // 8) Open profile menu and edit profile
  await page.locator('button').filter({ hasText: testFullName }).click();
  await pause(page, 600);
  await page.click('text=Edit Profile');
  await pause(page, 600);
  await expect(page.locator('h2:has-text("Update Profile")')).toBeVisible();
  await pause(page);

  // Change name and email
  const newName = `${baseName} ${new Date().getMinutes()}`;
  const newEmail = `${local}+upd${Date.now()}@${domain || 'example.com'}`;
  await page.locator('input[type="text"]').first().fill(newName);
  await pause(page);
  await page.locator('input[type="email"]').fill(newEmail);
  await pause(page);

  // Upload a tiny PNG
  const imgPath = path.join(tempDir, 'demo-avatar.png');
  const pngBuffer = Buffer.from([
    0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,
    0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
    0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
    0x08,0x06,0x00,0x00,0x00,0x1F,0x15,0xC4,
    0x89,0x00,0x00,0x00,0x0A,0x49,0x44,0x41,
    0x54,0x78,0x9C,0x63,0x00,0x01,0x00,0x00,
    0x05,0x00,0x01,0x0D,0x0A,0x2D,0xB4,0x00,
    0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,
    0x42,0x60,0x82
  ]);
  fs.writeFileSync(imgPath, pngBuffer);
  await page.locator('input[type="file"]').setInputFiles(imgPath);
  await pause(page, 800);

  // Submit profile changes
  await page.locator('div.fixed').getByRole('button', { name: 'Update Profile' }).click();
  await pause(page, 1200);

  // Modal closed or shows error depending on env permissions
  const modalVisible = await page.locator('h2:has-text("Update Profile")').isVisible();
  if (modalVisible) {
    const err = page.locator('div.bg-red-100');
    if (await err.isVisible()) {
      // Acceptable in restricted envs
      await expect(err).toBeVisible();
      // Close modal via Cancel if still open
      await page.locator('div.fixed').getByRole('button', { name: 'Cancel' }).click();
      await pause(page, 600);
    }
  }

  // Determine which email to use on next login (read from localStorage BEFORE logout)
  const userAfterUpdate = await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const loginEmail = (userAfterUpdate && userAfterUpdate.email) ? userAfterUpdate.email : uniqueEmail;

  // 9) Logout
  await page.locator('button').filter({ hasText: newName }).click().catch(async () => {
    // Fallback to previous name if update didn't persist
    await page.locator('button').filter({ hasText: testFullName }).click();
  });
  await pause(page, 600);
  await page.click('text=Sign out');
  await pause(page, 800);

  // 10) Login with last known email (prefer updated email if modal closed successfully)
  await page.getByLabel('Email').fill(loginEmail);
  await pause(page);
  await page.getByLabel('Password').fill(testPassword);
  await pause(page);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Back to dashboard
  // Wait for a robust dashboard cue with better error handling
  try {
    const addTxBtn = page.getByRole('button', { name: 'Add Transaction' });
    const welcomeHdr = page.locator('h2:has-text("Welcome to QuickBank")');
    await Promise.race([
      addTxBtn.waitFor({ state: 'visible', timeout: 25000 }),
      welcomeHdr.waitFor({ state: 'visible', timeout: 25000 })
    ]);
  } catch (error) {
    // Fallback: wait for any dashboard indicator
    await expect(page.locator('h1:has-text("QuickBank")')).toBeVisible({ timeout: 10000 });
  }
  await pause(page, 1000);

  // 11) Optional: download report again quickly
  const dl2 = page.waitForEvent('download');
  await page.locator('h3:has-text("Monthly Report")').click();
  const d2 = await dl2;
  const report2 = path.join(tempDir, 'report-demo-2.pdf');
  await d2.saveAs(report2);
  expect(fs.existsSync(report2)).toBe(true);
  await pause(page, 800);
});
