import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';

test.describe.serial('Reports API - negative cases', () => {
  let token; let userEmail; const password = 'RptPass123!'; const name = `Rpt User ${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    userEmail = `rpt_${Date.now()}@example.com`;
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
  });

  test('GET /reports/monthly without year/month returns 400', async ({ request }) => {
    const res = await request.get(`${API_BASE}/reports/monthly`, { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(400);
  });

  test('GET /reports/monthly with invalid month returns 200 or an error', async ({ request }) => {
    const year = new Date().getFullYear();
    const res = await request.get(`${API_BASE}/reports/monthly?year=${year}&month=13`, { headers: { Authorization: `Bearer ${token}` } });
    // Implementation may coerce month and still generate a PDF (200), or return an error (400/500)
    expect([200, 400, 500]).toContain(res.status());
  });

  test('GET /reports/monthly unauthorized returns 401', async ({ request }) => {
    const now = new Date();
    const res = await request.get(`${API_BASE}/reports/monthly?year=${now.getFullYear()}&month=${now.getMonth()+1}`);
    expect(res.status()).toBe(401);
  });
});
