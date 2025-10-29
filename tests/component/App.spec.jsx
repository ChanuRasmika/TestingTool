import { test, expect } from '@playwright/experimental-ct-react';
import App from '../../frontend/src/App.jsx';

test.describe('App component (routing/auth)', () => {
  test('renders Login when no token/user in storage', async ({ mount, page }) => {
    await page.evaluate(() => { localStorage.clear(); });
    const component = await mount(<App />);
    await expect(component.getByText('Sign in to your account')).toBeVisible();
  });

  test('renders Dashboard when token and user exist', async ({ mount, page }) => {
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'AuthUser', email: 'auth@u.test' }));
      // @ts-ignore
      window.fetch = async (url) => {
        const headers = { 'Content-Type': 'application/json' };
        if (String(url).endsWith('/api/transactions')) {
          // @ts-ignore
          return new Response(JSON.stringify({ transactions: [], currentBalance: 0 }), { status: 200, headers });
        }
        if (String(url).endsWith('/api/transactions/balance')) {
          // @ts-ignore
          return new Response(JSON.stringify({ balance: 0 }), { status: 200, headers });
        }
        // @ts-ignore
        return new Response('{}', { status: 404, headers });
      };
    });

    const component = await mount(<App />);
    await expect(component.getByText(/Welcome to QuickBank, AuthUser!/)).toBeVisible();
  });

  test('switches to Signup view from Login', async ({ mount, page }) => {
    await page.evaluate(() => { localStorage.clear(); });
    const component = await mount(<App />);
    await component.getByText('Sign up').click();
    await expect(component.getByText('Create your account')).toBeVisible();
  });

  test('logout from Dashboard returns to Login', async ({ mount, page }) => {
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'AuthUser', email: 'auth@u.test' }));
      // @ts-ignore
      window.fetch = async (url) => {
        const headers = { 'Content-Type': 'application/json' };
        if (String(url).endsWith('/api/transactions')) {
          // @ts-ignore
          return new Response(JSON.stringify({ transactions: [], currentBalance: 0 }), { status: 200, headers });
        }
        if (String(url).endsWith('/api/transactions/balance')) {
          // @ts-ignore
          return new Response(JSON.stringify({ balance: 0 }), { status: 200, headers });
        }
        // @ts-ignore
        return new Response('{}', { status: 404, headers });
      };
    });

    const component = await mount(<App />);
    // open profile menu and click Sign out
    await component.locator('header').getByRole('button').first().click();
    await component.getByText('Sign out').click();
    await expect(component.getByText('Sign in to your account')).toBeVisible();
  });
});
