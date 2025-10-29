import { test, expect } from '@playwright/experimental-ct-react';
import Dashboard from '../../frontend/src/components/Dashboard.jsx';

const fakeUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  profileUrl: ''
};

test.describe('Dashboard component', () => {
  test.beforeEach(async ({ page }) => {
    // Stub network used by Dashboard before mount and seed token
    await page.evaluate(() => {
      // Record fetch calls for assertions
      // @ts-ignore
      window.__fetchCalls = [];
      // @ts-ignore
      window.fetch = async (url, opts = {}) => {
        // @ts-ignore
        window.__fetchCalls.push(String(url));
        const headers = { 'Content-Type': 'application/json' };
        if (String(url).endsWith('/api/transactions')) {
          const payload = {
            transactions: [
              { id: 101, date: new Date().toISOString(), description: 'Coffee', amount: -4.5, category: 'Food' },
              { id: 102, date: new Date().toISOString(), description: 'Salary', amount: 1239.06, category: 'Income' },
            ],
            currentBalance: 1234.56,
          };
          // @ts-ignore
          return new Response(JSON.stringify(payload), { status: 200, headers });
        }
        if (String(url).endsWith('/api/transactions/balance')) {
          // @ts-ignore
          return new Response(JSON.stringify({ balance: 1234.56 }), { status: 200, headers });
        }
        if (String(url).includes('/api/reports/monthly')) {
          // Minimal PDF-like bytes to satisfy blob usage
          const bytes = new Uint8Array([37, 80, 68, 70]); // %PDF
          // @ts-ignore
          return new Response(new Blob([bytes], { type: 'application/pdf' }), { status: 200 });
        }
        // @ts-ignore
        return new Response('{}', { status: 404, headers });
      };
      localStorage.setItem('token', 'fake-token');
    });
  });

  test('renders header, cards, and fetched values', async ({ mount, page }) => {
    const component = await mount(<Dashboard user={fakeUser} onLogout={() => {}} />);

    await expect(component.getByRole('heading', { name: /Welcome to QuickBank, Test User!/ })).toBeVisible();

    // Account balance card shows formatted value
    await expect(component.getByText(/\$1,234\.56/)).toBeVisible();
    // Transactions count card shows 2
    await expect(component.getByText(/^2$/)).toBeVisible();

  // Profile menu toggle (header button may have no accessible name when avatar initials are shown)
  await component.locator('header').getByRole('button').first().click();
    await expect(component.getByText('Edit Profile')).toBeVisible();
    await expect(component.getByText('Sign out')).toBeVisible();

    // Open Add Transaction modal
    await component.getByRole('button', { name: 'Add Transaction' }).click();
  await expect(component.getByRole('heading', { name: 'Add Transaction' })).toBeVisible();
  // The Amount input is type=number and not explicitly associated to a label; use its placeholder instead
  await expect(component.getByPlaceholder('Enter amount (negative for expenses)')).toBeVisible();
  });

  test('downloads monthly report when clicking card', async ({ mount, page }) => {
    const component = await mount(<Dashboard user={fakeUser} onLogout={() => {}} />);

    // Click the Monthly Report card (it's a button with that text inside)
    await component.getByRole('button', { name: /Monthly Report/ }).click();

    // Assert that the monthly report endpoint was called
    const calls = await page.evaluate(() => {
      // @ts-ignore
      return window.__fetchCalls || [];
    });
    expect(calls.some(u => u.includes('/api/reports/monthly'))).toBeTruthy();
  });

  test('shows empty state when transactions fetch fails', async ({ mount, page }) => {
    // Override fetch to fail for transactions only
    await page.evaluate(() => {
      // @ts-ignore
      window.fetch = async (url, opts = {}) => {
        const headers = { 'Content-Type': 'application/json' };
        if (String(url).endsWith('/api/transactions')) {
          // @ts-ignore
          return new Response(JSON.stringify({ error: 'boom' }), { status: 500, headers });
        }
        if (String(url).endsWith('/api/transactions/balance')) {
          // @ts-ignore
          return new Response(JSON.stringify({ balance: 0 }), { status: 200, headers });
        }
        // @ts-ignore
        return new Response('{}', { status: 404, headers });
      };
      localStorage.setItem('token', 'fake-token');
    });

    const component = await mount(<Dashboard user={fakeUser} onLogout={() => {}} />);

    // Empty state from TransactionList should be visible
    await expect(component.getByText('No transactions yet')).toBeVisible();
  });
});
