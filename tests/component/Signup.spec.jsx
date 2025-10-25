import { test, expect } from '@playwright/experimental-ct-react';
import Signup from '../../frontend/src/components/Signup.jsx';

test('renders signup form correctly', async ({ mount }) => {
  const component = await mount(<Signup onSignup={() => {}} onSwitchToLogin={() => {}} />);
  
  await expect(component.getByText('QuickBank')).toBeVisible();
  await expect(component.getByText('Create your account')).toBeVisible();
  await expect(component.getByLabel('Full Name')).toBeVisible();
  await expect(component.getByLabel('Email')).toBeVisible();
  await expect(component.getByLabel('Password')).toBeVisible();
  await expect(component.getByRole('button', { name: 'Sign Up' })).toBeVisible();
});

test('handles form input correctly', async ({ mount }) => {
  const component = await mount(<Signup onSignup={() => {}} onSwitchToLogin={() => {}} />);
  
  const nameInput = component.getByLabel('Full Name');
  const emailInput = component.getByLabel('Email');
  const passwordInput = component.getByLabel('Password');
  
  await nameInput.fill('John Doe');
  await emailInput.fill('john@example.com');
  await passwordInput.fill('password123');
  
  await expect(nameInput).toHaveValue('John Doe');
  await expect(emailInput).toHaveValue('john@example.com');
  await expect(passwordInput).toHaveValue('password123');
});

test('validates password minimum length', async ({ mount }) => {
  const component = await mount(<Signup onSignup={() => {}} onSwitchToLogin={() => {}} />);
  
  const passwordInput = component.getByLabel('Password');
  await expect(passwordInput).toHaveAttribute('minlength', '6');
});

test('shows loading state when submitting', async ({ mount }) => {
  const component = await mount(<Signup onSignup={() => {}} onSwitchToLogin={() => {}} />);
  
  await component.getByLabel('Full Name').fill('John Doe');
  await component.getByLabel('Email').fill('john@example.com');
  await component.getByLabel('Password').fill('password123');
  
  const submitButton = component.getByRole('button', { name: 'Sign Up' });
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
  await expect(component.getByText('Creating Account...')).toBeVisible();
});

test('switches to login when link is clicked', async ({ mount }) => {
  let switchedToLogin = false;
  const onSwitchToLogin = () => { switchedToLogin = true; };
  
  const component = await mount(<Signup onSignup={() => {}} onSwitchToLogin={onSwitchToLogin} />);
  
  await component.getByText('Sign in').click();
  
  expect(switchedToLogin).toBe(true);
});