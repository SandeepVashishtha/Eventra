import { test, expect } from '@playwright/test';

test.describe('Waitlist User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful authentication
    await page.route('/api/auth/session', async route => {
      const json = { user: { id: 'test-user', name: 'Test User' } };
      await route.fulfill({ json });
    });
    
    // Mock event fetch
    await page.route('/api/events/test-event', async route => {
      const json = {
        id: 'test-event',
        title: 'High Demand Event',
        capacity: 100,
        registeredCount: 100, // Full event
        waitlistEnabled: true
      };
      await route.fulfill({ json });
    });
  });

  test('should allow user to join waitlist when event is full', async ({ page }) => {
    // Navigate to full event
    await page.goto('/events/test-event');

    // Wait for the waitlist button to appear
    const joinWaitlistBtn = page.getByRole('button', { name: /join waitlist/i });
    await expect(joinWaitlistBtn).toBeVisible();

    // Mock the waitlist join response
    await page.route('/api/events/test-event/waitlist', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ json: { success: true, position: 1 } });
      } else {
        await route.continue();
      }
    });

    // Click the button
    await joinWaitlistBtn.click();

    // Expect success message and UI update
    await expect(page.getByText('Successfully joined the waitlist! You are at position 1.')).toBeVisible();
    await expect(page.getByRole('button', { name: /leave waitlist/i })).toBeVisible();
  });
});
