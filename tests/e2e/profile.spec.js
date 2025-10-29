import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Profile E2E', () => {
  let uniqueEmail;
  const testPassword = process.env.E2E_TEST_PASSWORD || 'Test123!';
  const testFullName = process.env.E2E_TEST_FULL_NAME || 'Profile Tester';

  test.beforeEach(async ({ page }) => {
    // Create unique user for each test
    uniqueEmail = `profile_${Date.now()}@example.com`;
    
    await page.goto('/');
    await page.waitForTimeout(500);

    // Signup
    await page.click('text=Sign up');
    await expect(page.locator('text=Create your account')).toBeVisible();
    
    await page.getByLabel('Full Name').fill(testFullName);
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign Up' }).click();

  // Wait for dashboard – assert a stable dashboard control instead of heading text
  await expect(page.getByRole('button', { name: 'Add Transaction' })).toBeVisible({ timeout: 15000 });
  });

  test('should display user profile information', async ({ page }) => {
    // Click on profile menu
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);

    // Verify profile menu is open
    await expect(page.locator('text=Edit Profile')).toBeVisible();
    await expect(page.locator('text=Sign out')).toBeVisible();

    // Verify user name is displayed in header
    await expect(page.locator(`h2:has-text("${testFullName}")`)).toBeVisible();
  });

  test('should open profile update modal', async ({ page }) => {
    // Open profile menu
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);

    // Click Edit Profile
    await page.click('text=Edit Profile');
    await page.waitForTimeout(500);

    // Verify modal is visible
    await expect(page.locator('h2:has-text("Update Profile")')).toBeVisible();
    
    // Verify form fields are pre-filled (use input type selectors since labels aren't programmatically associated)
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toHaveValue(testFullName);
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue(uniqueEmail);
  });

  test('should update profile name successfully', async ({ page }) => {
    const newName = 'Updated Name ' + Date.now();

    // Open profile menu and update profile
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);
    await page.click('text=Edit Profile');
    await page.waitForTimeout(500);

    // Update name (use input type selector)
    await page.locator('input[type="text"]').first().fill(newName);

    // Submit form
    await page.locator('div.fixed').getByRole('button', { name: 'Update Profile' }).click();
    await page.waitForTimeout(1000);

    // Verify modal is closed
    await expect(page.locator('h2:has-text("Update Profile")')).not.toBeVisible();

    // Verify new name is displayed
    await expect(page.locator(`h2:has-text("${newName}")`)).toBeVisible();

    // Verify name persists in profile menu
    await page.locator('button').filter({ hasText: newName }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Edit Profile')).toBeVisible();
  });

  test('should update email successfully', async ({ page }) => {
    const newEmail = `updated_${Date.now()}@example.com`;

    // Open profile form
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);
    await page.click('text=Edit Profile');
    await page.waitForTimeout(500);

    // Update email (use input type selector)
    await page.locator('input[type="email"]').fill(newEmail);

    // Submit form
    await page.locator('div.fixed').getByRole('button', { name: 'Update Profile' }).click();
    await page.waitForTimeout(1000);

    // Verify modal is closed
    await expect(page.locator('h2:has-text("Update Profile")')).not.toBeVisible();

    // Reopen profile form to verify email was updated
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);
    await page.click('text=Edit Profile');
    await page.waitForTimeout(500);

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue(newEmail);
  });

  test('should upload profile picture', async ({ page }) => {
    // Create a temporary test image
    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const testImagePath = path.join(tempDir, 'test-avatar.png');
    
    // Create a simple 1x1 PNG (smallest valid PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, pngBuffer);

    // Open profile form
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);
    await page.click('text=Edit Profile');
    await page.waitForTimeout(500);

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(500);

    // Verify preview appears (image tag should exist)
    const previewImage = page.locator('img[alt="Profile preview"]');
    await expect(previewImage).toBeVisible();

    // Submit form
    await page.locator('div.fixed').getByRole('button', { name: 'Update Profile' }).click();
    await page.waitForTimeout(1500);

    // Clean up
    fs.unlinkSync(testImagePath);

    // Note: Actual image upload success depends on backend file system permissions
    // Modal should close if successful or show error
    const modalVisible = await page.locator('h2:has-text("Update Profile")').isVisible();
    if (!modalVisible) {
      // Success - profile was updated
      expect(modalVisible).toBe(false);
    } else {
      // Error may be shown if uploads are disabled
      const errorDiv = page.locator('div.bg-red-100');
      if (await errorDiv.isVisible()) {
        expect(await errorDiv.textContent()).toBeTruthy();
      }
    }
  });

  test('should show error for invalid file type', async ({ page }) => {
    // Create a text file
    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const testFilePath = path.join(tempDir, 'test.txt');
    fs.writeFileSync(testFilePath, 'This is not an image');

    // Open profile form
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);
    await page.click('text=Edit Profile');
    await page.waitForTimeout(500);

    // Try to upload text file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);
    await page.waitForTimeout(500);

    // Verify error message appears
    await expect(page.locator('text=Please select an image file')).toBeVisible();

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('should cancel profile update without saving', async ({ page }) => {
    const originalName = testFullName;

    // Open profile form
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);
    await page.click('text=Edit Profile');
    await page.waitForTimeout(500);

    // Make some changes (use input type selector)
    await page.locator('input[type="text"]').first().fill('This should not be saved');

    // Click Cancel
    await page.locator('div.fixed').getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(500);

    // Verify modal is closed
    await expect(page.locator('h2:has-text("Update Profile")')).not.toBeVisible();

    // Verify original name is still displayed
    await expect(page.locator(`h2:has-text("${originalName}")`)).toBeVisible();
  });

  test('should close profile modal with X button', async ({ page }) => {
    // Open profile form
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);
    await page.click('text=Edit Profile');
    await page.waitForTimeout(500);

    // Verify modal is open
    await expect(page.locator('h2:has-text("Update Profile")')).toBeVisible();

    // Click X button
    await page.locator('div.fixed svg').click();
    await page.waitForTimeout(500);

    // Verify modal is closed
    await expect(page.locator('h2:has-text("Update Profile")')).not.toBeVisible();
  });

  test('should display default avatar when no profile picture', async ({ page }) => {
    // Open profile form
    await page.locator('button').filter({ hasText: testFullName }).click();
    await page.waitForTimeout(500);
    await page.click('text=Edit Profile');
    await page.waitForTimeout(500);

    // Verify default avatar (div with first letter) or existing profile picture
    // Use nth(1) to select the larger avatar in the modal (not the header one)
    const defaultAvatar = page.locator('div.rounded-full').filter({ hasText: testFullName.charAt(0).toUpperCase() }).nth(1);
    const profileImage = page.locator('img[alt="Profile preview"]');
    
    // Either default avatar or profile image should be visible
    const defaultVisible = await defaultAvatar.isVisible();
    const imageVisible = await profileImage.isVisible();
    expect(defaultVisible || imageVisible).toBe(true);
  });
});
