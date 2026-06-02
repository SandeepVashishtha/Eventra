import { test, expect } from '@playwright/test';

test.describe('Authentication Flow E2E Tests', () => {

  test('User can navigate to Login page and see form', async ({ page }) => {
    await page.goto('/login');
    
    // Heading should be visible
    const heading = page.getByRole('heading', { name: /Welcome Back/i }).first();
    await expect(heading).toBeVisible();

    // Form fields should be present
    const usernameInput = page.locator('input[name="usernameOrEmail"]');
    await expect(usernameInput).toBeVisible();

    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();

    const submitButton = page.getByRole('button', { name: /Sign In/i, exact: true }).first();
    await expect(submitButton).toBeVisible();
  });

  test('Login form shows validation errors on empty submission', async ({ page }) => {
    await page.goto('/login');
    
    const submitButton = page.getByRole('button', { name: /Sign In/i, exact: true }).first();
    await submitButton.click();

    // Expect validation messages to appear
    await expect(page.getByText(/Email or username is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test('Login form validates short passwords', async ({ page }) => {
    await page.goto('/login');
    
    const usernameInput = page.locator('input[name="usernameOrEmail"]');
    await usernameInput.fill('testuser');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('123'); // Too short

    const submitButton = page.getByRole('button', { name: /Sign In/i, exact: true }).first();
    await submitButton.click();

    await expect(page.getByText(/Password must be at least 8 characters long/i)).toBeVisible();
  });

  test('User can navigate to Signup page and see form', async ({ page }) => {
    await page.goto('/signup');
    
    const heading = page.getByRole('heading', { name: /Create an Account/i }).first();
    await expect(heading).toBeVisible();

    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();

    const submitButton = page.getByRole('button', { name: /Sign Up/i, exact: true }).first();
    await expect(submitButton).toBeVisible();
  });

  test('Signup form shows validation errors on empty submission', async ({ page }) => {
    await page.goto('/signup');
    
    const submitButton = page.getByRole('button', { name: /Sign Up/i, exact: true }).first();
    await submitButton.click();

    await expect(page.getByText(/First name is required/i)).toBeVisible();
    await expect(page.getByText(/Last name is required/i)).toBeVisible();
    await expect(page.getByText(/Email is required/i)).toBeVisible();
    await expect(page.getByText(/Username is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

});
