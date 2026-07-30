import { test, expect } from '@playwright/test';

test.describe('Event Registration E2E Tests', () => {

  // We assume there's at least one event with ID '1' or similar in mock data
  const testEventId = '1';

  test('Registration form renders correctly', async ({ page }) => {
    await page.goto(`/events/${testEventId}/register`);
    
    await expect(page.getByRole('heading', { name: /Register for this Event/i })).toBeVisible();
    
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Complete Registration/i })).toBeVisible();
  });

  test('Shows validation errors for missing required fields', async ({ page }) => {
    await page.goto(`/events/${testEventId}/register`);
    
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    await expect(page.getByText(/Full name is required/i)).toBeVisible();
    await expect(page.getByText(/Invalid email format/i).or(page.getByText(/Email is required/i))).toBeVisible();
    await expect(page.getByText(/Phone number is invalid/i).or(page.getByText(/Phone is required/i))).toBeVisible();
  });

  test('User can fill and submit the registration form', async ({ page }) => {
    // Mock successful registration API if needed, but here we just test UI flow
    await page.goto(`/events/${testEventId}/register`);

    await page.locator('input[name="fullName"]').fill('John Doe');
    await page.locator('input[name="email"]').fill('john@example.com');
    await page.locator('input[name="phone"]').fill('1234567890');

    // Submit the form
    // Note: If not logged in, it might redirect to login. 
    // This test assumes either a mock auth or testing the redirect.
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // If successful, should see success message or redirect
    // Since we don't have a real backend, we just expect it to attempt submission
    // and potentially show a login toast if unauthenticated.
    const toast = page.locator('.Toastify__toast');
    await expect(toast).toBeVisible();
  });

});
