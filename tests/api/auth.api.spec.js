import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';

// Keep a concise, stable auth test suite. Use serial to avoid ordering issues when
// tests depend on created users.
test.describe.serial('Auth API Tests', () => {
  let authToken;
  const timestamp = Date.now();
  const testUser = {
    // backend expects `name` in the DTO
    name: `Test User ${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'TestPass123!'
  };

  test.beforeAll(async ({ request }) => {
    // Ensure backend is reachable
    try {
      await request.get(`${API_BASE}/`);
    } catch (error) {
      throw new Error('Backend server not running on expected port (http://localhost:5000)');
    }
  });

  test('POST /signup -> should register new user successfully', async ({ request }) => {
    const response = await request.post(`${API_BASE}/signup`, {
      data: JSON.stringify(testUser),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('token');
    expect(body.data).toHaveProperty('user');
    expect(body.data.user.email).toBe(testUser.email);

    authToken = body.data.token;
  });

  test('POST /signup -> should fail with missing required fields', async ({ request }) => {
    const response = await request.post(`${API_BASE}/signup`, {
      data: JSON.stringify({ email: 'test@test.com' }),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('POST /login -> should login successfully with valid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE}/login`, {
      data: JSON.stringify({ email: testUser.email, password: testUser.password }),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('token');
  });

  test('POST /login -> should fail with invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE}/login`, {
      data: JSON.stringify({ email: 'noone@nowhere.test', password: 'bad' }),
      headers: { 'Content-Type': 'application/json' }
    });

    expect([400, 401]).toContain(response.status());
  });

  test('POST /login -> should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post(`${API_BASE}/login`, {
      // intentionally send invalid JSON string
      data: 'not a json',
      headers: { 'Content-Type': 'application/json' }
    });

    // server may return 400 (bad request) or 401 depending on middleware
    expect([400, 401]).toContain(response.status());
  });
});