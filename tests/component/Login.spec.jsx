import { test, expect } from '@playwright/experimental-ct-react';
import Login from '../../frontend/src/components/Login.jsx';

test('renders login form correctly', async ({ mount }) => {
  const component = await mount(<Login onLogin={() => {}} onSwitchToSignup={() => {}} />);
  
  await expect(component.getByText('QuickBank')).toBeVisible();
  await expect(component.getByText('Sign in to your account')).toBeVisible();
  await expect(component.getByLabel('Email')).toBeVisible();
  await expect(component.getByLabel('Password')).toBeVisible();
  await expect(component.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('handles form input correctly', async ({ mount }) => {
  const component = await mount(<Login onLogin={() => {}} onSwitchToSignup={() => {}} />);
  
  const emailInput = component.getByLabel('Email');
  const passwordInput = component.getByLabel('Password');
  
  await emailInput.fill('test@example.com');
  await passwordInput.fill('password123');
  
  await expect(emailInput).toHaveValue('test@example.com');
  await expect(passwordInput).toHaveValue('password123');
});

test('shows loading state when submitting', async ({ mount }) => {
  const component = await mount(<Login onLogin={() => {}} onSwitchToSignup={() => {}} />);
  
  await component.getByLabel('Email').fill('test@example.com');
  await component.getByLabel('Password').fill('password123');
  
  const submitButton = component.getByRole('button', { name: 'Sign In' });
  // Stub fetch to delay response so the loading state can be observed
  await component.evaluate(() => {
    // @ts-ignore - run in browser context
    window.fetch = () => new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ok: true, json: async () => ({ success: true, data: { token: 'fake', user: {} } }) });
      }, 500);
    });
  });

  await submitButton.click();

  // The button should show the loading text while the stubbed fetch is pending
  await expect(component.getByText('Signing in...')).toBeVisible();
});

test('switches to signup when link is clicked', async ({ mount }) => {
  let switchedToSignup = false;
  const onSwitchToSignup = () => { switchedToSignup = true; };
  
  const component = await mount(<Login onLogin={() => {}} onSwitchToSignup={onSwitchToSignup} />);
  
  await component.getByText('Sign up').click();
  
  expect(switchedToSignup).toBe(true);
});