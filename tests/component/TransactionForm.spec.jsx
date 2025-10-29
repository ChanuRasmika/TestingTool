import { test, expect } from '@playwright/experimental-ct-react';
import TransactionForm from '../../frontend/src/components/TransactionForm.jsx';

test.describe('TransactionForm component', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake');
    });
  });

  test('submits successfully and calls onTransactionAdded', async ({ mount, page }) => {
    let received = null;
    const onTransactionAdded = (data) => { received = data; };
    const onClose = () => {};

    await page.evaluate(() => {
      // @ts-ignore
      window.fetch = async (url, opts) => {
        const headers = { 'Content-Type': 'application/json' };
        // @ts-ignore
        return new Response(JSON.stringify({
          transaction: { id: 1, date: new Date().toISOString(), description: 'Lunch', amount: -10, category: 'Food' },
          newBalance: 90
        }), { status: 201, headers });
      };
    });

    const component = await mount(<TransactionForm onTransactionAdded={onTransactionAdded} onClose={onClose} />);

    await component.getByPlaceholder('Enter description').fill('Lunch');
    await component.getByPlaceholder('Enter amount (negative for expenses)').fill('-10');
    await component.locator('select').first().selectOption({ label: 'Food' });
    await component.getByRole('button', { name: 'Add Transaction' }).click();

    await expect.poll(() => received).toBeTruthy();
    expect(received.transaction.description).toBe('Lunch');
    expect(received.newBalance).toBe(90);
  });

  test('shows error message on server error', async ({ mount, page }) => {
    await page.evaluate(() => {
      // @ts-ignore
      window.fetch = async () => {
        const headers = { 'Content-Type': 'application/json' };
        // @ts-ignore
        return new Response(JSON.stringify({ error: 'Failed to create transaction' }), { status: 400, headers });
      };
    });

    const component = await mount(<TransactionForm onTransactionAdded={() => {}} onClose={() => {}} />);
    await component.getByPlaceholder('Enter description').fill('Bad');
    await component.getByPlaceholder('Enter amount (negative for expenses)').fill('-1');
    await component.getByRole('button', { name: 'Add Transaction' }).click();

    await expect(component.getByText('Failed to create transaction')).toBeVisible();
  });
});
