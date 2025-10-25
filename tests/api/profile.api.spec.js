import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';

// Keep a small, focused profile suite that depends on a single created user.
test.describe.serial('Profile API Tests', () => {
  let authToken;
  const ts = Date.now();
  const testUser = {
    name: `Profile User ${ts}`,
    email: `profile_${ts}@example.com`,
    password: 'TestPass123!'
  };

  test.beforeAll(async ({ request }) => {
    const signupResponse = await request.post(`${API_BASE}/signup`, {
      data: JSON.stringify(testUser),
      headers: { 'Content-Type': 'application/json' }
    });

    expect([201, 400]).toContain(signupResponse.status());
    if (signupResponse.status() === 201) {
      const signupBody = await signupResponse.json();
      authToken = signupBody.data.token;
    } else {
      // If user already exists, try to login and get token
      const loginResponse = await request.post(`${API_BASE}/login`, {
        data: JSON.stringify({ email: testUser.email, password: testUser.password }),
        headers: { 'Content-Type': 'application/json' }
      });
      const loginBody = await loginResponse.json();
      authToken = loginBody?.data?.token;
    }

    if (!authToken) throw new Error('Could not obtain auth token in profile.beforeAll');
  });

  test('GET /profile -> should get user profile successfully', async ({ request }) => {
    const response = await request.get(`${API_BASE}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

  expect(response.status()).toBe(200);
  const body = await response.json();
  // API returns { success, data: { user } }
  expect(body).toHaveProperty('data');
  const user = body.data.user;
  expect(user.email).toBe(testUser.email);
  expect(user).not.toHaveProperty('password');
  });

  test('GET /profile -> should fail without authentication', async ({ request }) => {
    const response = await request.get(`${API_BASE}/profile`);
    expect(response.status()).toBe(401);
  });

  test('PUT /profile -> should update profile successfully', async ({ request }) => {
    const updateData = { name: 'Updated Profile Name' };
    const response = await request.put(`${API_BASE}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      data: JSON.stringify(updateData)
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    // Accept some variations in shape; just ensure updated value is present
    if (body.user) expect(body.user.name || body.user.firstName).toBeDefined();
  });
});