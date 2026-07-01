import { test, expect } from '@playwright/test';

test.describe('Signup (Social OAuth) flow', () => {
  test('Social signup opens popup and completes OAuth', async ({ page }) => {
    await page.goto('/signup');

    const origin = new URL(page.url()).origin;

    // Intercept the initiation request to return a redirect URL to an auth-callback on same origin
    await page.route('**/api/auth/google', async (route) => {
      const redirect = `${origin}/auth-callback?token=mock-token`;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: redirect })
      });
    });

    // Intercept profile fetch after popup completes
    await page.route('**/api/users/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' }, token: 'mock-token' })
      });
    });

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: /google/i }).first().click()
    ]);

    // The popup should navigate to our auth-callback and then close (handled by app)
    await popup.waitForURL('**/auth-callback?token=*', { timeout: 5000 });

    // Wait for navigation to dashboard after profile fetch
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Confirm user's name appears in navbar
    const userName = page.getByText(/Test/i).first();
    await expect(userName).toBeVisible();
  });
});
