import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';

test.describe.serial('Transactions API - filters and negatives', () => {
  let token; let userEmail; const password = 'TxPass123!'; const name = `Tx User ${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    userEmail = `tx_${Date.now()}@example.com`;
    const signup = await request.post(`${API_BASE}/signup`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ name, email: userEmail, password })
    });
    if (signup.status() === 201) {
      token = (await signup.json())?.data?.token;
    } else {
      const login = await request.post(`${API_BASE}/login`, {
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ email: userEmail, password })
      });
      token = (await login.json())?.data?.token;
    }
    expect(token).toBeTruthy();

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    // Seed transactions spanning dates and categories
    const today = new Date();
    const daysAgo = (n) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n).toISOString().split('T')[0];
    const seed = [
      { date: daysAgo(10), description: 'Groceries', amount: -25.5, category: 'Groceries' },
      { date: daysAgo(5), description: 'Salary', amount: 500, category: 'Income' },
      { date: daysAgo(2), description: 'Coffee', amount: -3, category: 'Food' },
    ];
    for (const tx of seed) {
      // eslint-disable-next-line no-await-in-loop
      await request.post(`${API_BASE}/transactions`, { headers, data: JSON.stringify(tx) });
    }
  });

  test('GET /transactions filtered by date range returns subset', async ({ request }) => {
    const headers = { Authorization: `Bearer ${token}` };
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const res = await request.get(`${API_BASE}/transactions?startDate=${startDate}&endDate=${endDate}`, { headers });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.transactions)).toBe(true);
    // Should include Salary and Coffee, but not Groceries from 10 days ago
    const descs = body.transactions.map(t => t.description);
    expect(descs).toEqual(expect.arrayContaining(['Salary', 'Coffee']));
    expect(descs).not.toEqual(expect.arrayContaining(['Groceries']));
  });

  test('GET /transactions filtered by category returns only that category', async ({ request }) => {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await request.get(`${API_BASE}/transactions?category=Income`, { headers });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const categories = body.transactions.map(t => t.category || '');
    expect(new Set(categories)).toEqual(new Set(['Income']));
  });

  test('GET /transactions with invalid date returns 400', async ({ request }) => {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await request.get(`${API_BASE}/transactions?startDate=not-a-date`, { headers });
    expect(res.status()).toBe(400);
  });
});
