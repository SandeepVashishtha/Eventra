import { test, expect } from '@playwright/test';

test.describe('Check-in User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock organizer authentication
    await page.route('/api/auth/session', async route => {
      const json = { user: { id: 'org-user', name: 'Org User', role: 'ORGANIZER' } };
      await route.fulfill({ json });
    });
  });

  test('organizer should be able to check-in an attendee with a token', async ({ page }) => {
    // Navigate to scanner/checkin page
    await page.goto('/admin/scanner');

    // Mock the checkin response
    await page.route('/api/tickets/checkin', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ json: { success: true, message: 'Attendee checked in successfully' } });
      } else {
        await route.continue();
      }
    });

    // Assume there is a manual token input for testing when camera is unavailable
    const tokenInput = page.getByPlaceholder('Enter ticket token manually');
    await expect(tokenInput).toBeVisible();

    await tokenInput.fill('valid-ticket-token-123');
    await page.getByRole('button', { name: /verify & check-in/i }).click();

    // Verify success state
    await expect(page.getByText('Attendee checked in successfully')).toBeVisible();
  });
});
