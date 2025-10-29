import { test, expect } from '@playwright/experimental-ct-react';
import TransactionList from '../../frontend/src/components/TransactionList.jsx';

test.describe('TransactionList component', () => {
  test('renders empty state', async ({ mount }) => {
    const component = await mount(<TransactionList transactions={[]} />);
    await expect(component.getByText('No transactions yet')).toBeVisible();
  });

  test('renders transactions with correct formatting', async ({ mount }) => {
    const txs = [
      { id: 1, date: new Date().toISOString(), description: 'Salary', amount: 100, category: 'Income' },
      { id: 2, date: new Date().toISOString(), description: 'Coffee', amount: -3.5, category: 'Food' },
    ];
    const component = await mount(<TransactionList transactions={txs} />);

    await expect(component.getByText('Salary')).toBeVisible();
    await expect(component.getByText('+$100.00')).toBeVisible();
    await expect(component.getByText('Coffee')).toBeVisible();
    await expect(component.getByText('-$3.50')).toBeVisible();
    await expect(component.getByText('Food')).toBeVisible();
  });
});
