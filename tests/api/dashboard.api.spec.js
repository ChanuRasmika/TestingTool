import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';

test.describe.serial('Dashboard API (transactions, balance, reports)', () => {
  let authToken;
  let userEmail;
  const password = 'TestPass123!';
  const name = `Dash API User ${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    userEmail = `dash_api_${Date.now()}@example.com`;

    // Sign up a dedicated user
    const signup = await request.post(`${API_BASE}/signup`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ name, email: userEmail, password })
    });

    expect([201, 400]).toContain(signup.status());
    if (signup.status() === 201) {
      const body = await signup.json();
      authToken = body?.data?.token;
    } else {
      // Fallback to login if user already exists
      const login = await request.post(`${API_BASE}/login`, {
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ email: userEmail, password })
      });
      expect(login.ok()).toBeTruthy();
      const body = await login.json();
      authToken = body?.data?.token;
    }

    expect(authToken).toBeTruthy();
  });

  test('GET /transactions (initial) returns shape with currentBalance', async ({ request }) => {
    const res = await request.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('transactions');
    expect(Array.isArray(body.transactions)).toBe(true);
    expect(body).toHaveProperty('currentBalance');
    expect(typeof body.currentBalance === 'number' || typeof body.currentBalance === 'string').toBeTruthy();
  });

  test('POST /transactions creates expense then income and updates balances', async ({ request }) => {
    const headers = {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Create an expense of -10.00
    const expensePayload = {
      date: new Date().toISOString().split('T')[0],
      description: 'API Expense',
      amount: -10.0,
      category: 'Food'
    };
    const expRes = await request.post(`${API_BASE}/transactions`, { headers, data: JSON.stringify(expensePayload) });
    expect(expRes.status()).toBe(201);
    const expBody = await expRes.json();
    expect(expBody).toHaveProperty('transaction');
    expect(expBody).toHaveProperty('newBalance');

    // Create an income of +100.00
    const incomePayload = {
      date: new Date().toISOString().split('T')[0],
      description: 'API Income',
      amount: 100.0,
      category: 'Income'
    };
    const incRes = await request.post(`${API_BASE}/transactions`, { headers, data: JSON.stringify(incomePayload) });
    expect(incRes.status()).toBe(201);
    const incBody = await incRes.json();
    expect(incBody).toHaveProperty('transaction');
    expect(incBody).toHaveProperty('newBalance');

    // Verify list and balance endpoints reflect updates
    const listRes = await request.get(`${API_BASE}/transactions`, { headers: { Authorization: `Bearer ${authToken}` } });
    expect(listRes.ok()).toBeTruthy();
    const listBody = await listRes.json();
    expect(Array.isArray(listBody.transactions)).toBe(true);
    const hasExpense = listBody.transactions.some(t => t.description === 'API Expense' && Number(t.amount) === -10);
    const hasIncome = listBody.transactions.some(t => t.description === 'API Income' && Number(t.amount) === 100);
    expect(hasExpense && hasIncome).toBeTruthy();

    const balRes = await request.get(`${API_BASE}/transactions/balance`, { headers: { Authorization: `Bearer ${authToken}` } });
    expect(balRes.ok()).toBeTruthy();
    const balBody = await balRes.json();
    // balance can be string or number depending on driver; ensure it matches listBody.currentBalance loosely
    const listBalance = Number(listBody.currentBalance);
    const balValue = Number(balBody.balance);
    expect(Number.isFinite(listBalance) && Number.isFinite(balValue)).toBeTruthy();
    expect(Math.abs(listBalance - balValue)).toBeLessThan(0.01);
  });

  test('POST /transactions with invalid payload returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      data: JSON.stringify({ description: 'Bad Tx' }) // missing required fields
    });
    expect(res.status()).toBe(400);
  });

  test('GET /transactions unauthorized returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/transactions`);
    expect(res.status()).toBe(401);
  });

  test('GET /reports/monthly returns a PDF with expected headers', async ({ request }) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1); // 1-12

    const res = await request.get(`${API_BASE}/reports/monthly?year=${year}&month=${month}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(res.ok()).toBeTruthy();
    const ct = res.headers()['content-type'] || res.headers()['Content-Type'];
    expect(ct).toMatch(/application\/pdf/);
    const cd = res.headers()['content-disposition'] || res.headers()['Content-Disposition'];
    expect(cd).toMatch(/attachment/);
    expect(cd).toMatch(/monthly-report-\d{4}-\d{2}\.pdf/);

    const buf = await res.body();
    expect(buf.byteLength).toBeGreaterThan(0);
  });
});
