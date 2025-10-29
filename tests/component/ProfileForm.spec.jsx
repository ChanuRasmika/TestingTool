import { test, expect } from '@playwright/experimental-ct-react';
import { Buffer } from 'buffer';
import ProfileForm from '../../frontend/src/components/ProfileForm.jsx';

const fakeUser = { id: 1, name: 'Alice', email: 'alice@example.com', profileUrl: '' };

test.describe('ProfileForm component', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('token', 'fake'));
  });

  test('updates profile successfully and closes', async ({ mount, page }) => {
    let updatedUser = null;
    let closed = false;
    const onProfileUpdated = (u) => { updatedUser = u; };
    const onClose = () => { closed = true; };

    await page.evaluate(() => {
      // @ts-ignore
      window.fetch = async () => {
        const headers = { 'Content-Type': 'application/json' };
        // @ts-ignore
        return new Response(JSON.stringify({ user: { id: 1, name: 'Alice Updated', email: 'alice@example.com' } }), { status: 200, headers });
      };
    });

    const component = await mount(<ProfileForm user={fakeUser} onProfileUpdated={onProfileUpdated} onClose={onClose} />);

    // Change name and submit (label isn't programmatically associated, target the text input directly)
    await component.locator('input[type="text"]').first().fill('Alice Updated');
    await component.getByRole('button', { name: 'Update Profile' }).click();

    await expect.poll(() => updatedUser).toBeTruthy();
    expect(updatedUser.name).toBe('Alice Updated');
    await expect.poll(() => closed).toBe(true);
  });

  test('shows image preview after selecting a valid file', async ({ mount }) => {
    const component = await mount(<ProfileForm user={fakeUser} onProfileUpdated={() => {}} onClose={() => {}} />);

  const fileInput = component.locator('input[type="file"]');
  const pngBytes = Buffer.from([137,80,78,71,13,10,26,10]); // minimal PNG header
  await fileInput.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: pngBytes });

    await expect(component.getByAltText('Profile preview')).toBeVisible();
  });

  test('rejects non-image file type', async ({ mount }) => {
    const component = await mount(<ProfileForm user={fakeUser} onProfileUpdated={() => {}} onClose={() => {}} />);
    const fileInput = component.locator('input[type="file"]');
    await fileInput.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from([65,66,67]) });
    await expect(component.getByText('Please select an image file')).toBeVisible();
  });
});
